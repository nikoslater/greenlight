// Greenlight dashboard server.
// Serves the one-window UI, drives Claude Code via the Agent SDK, and streams
// everything (Claude's narration, tool activity, questions, approvals, the
// status board) to the browser over SSE. Zero dependencies beyond the SDK.
//
// Layout assumption: this file lives at <project>/greenlight/ui/server.mjs.

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const UI_DIR = path.dirname(fileURLToPath(import.meta.url));
const GL_DIR = path.resolve(UI_DIR, '..');            // <project>/greenlight
const REPO = path.resolve(GL_DIR, '..');              // <project>
const PORT = Number(process.env.PORT || 4747);
const MOCK = process.env.GREENLIGHT_MOCK === '1';

// ---------------------------------------------------------------- utilities

const exec = (cmd, args, opts = {}) =>
  new Promise((resolve) =>
    execFile(cmd, args, { cwd: REPO, timeout: 8000, ...opts }, (err, stdout) =>
      resolve(err ? null : stdout.toString().trimEnd())
    )
  );

const readIf = async (p) => {
  try { return await fsp.readFile(p, 'utf8'); } catch { return null; }
};

// ------------------------------------------------------- project state view
// The dashboard never invents state: it renders what the Greenlight files say.

function parseFrontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*"?([^"#]*)"?\s*(#.*)?$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

function parseBoard(md) {
  const sec = md.split(/^## 3\./m)[1];
  if (!sec) return [];
  const rows = [];
  for (const line of sec.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length >= 7 && cells[1] && !/^[-:\s]+$/.test(cells[1]) && cells[1] !== 'ID') {
      rows.push({
        id: cells[1], name: cells[2], status: cells[3],
        passes: cells[4], verified: cells[5], evidence: cells[6],
      });
    }
  }
  return rows;
}

function parseNextAction(md) {
  const sec = md.split(/^## 5\./m)[1];
  if (!sec) return null;
  const m = sec.match(/\*\*→?\s*([\s\S]*?)\*\*/);
  return m ? m[1].trim() : null;
}

function parseSecurity(md) {
  const sec = md.split(/^## 4\./m)[1]?.split(/^## /m)[0] || '';
  const done = (sec.match(/\[x\]/gi) || []).length;
  const open = (sec.match(/\[ \]/g) || []).length;
  return { done, total: done + open };
}

function parseOpenAsks(decisions, board) {
  const asks = [];
  const blockedIds = new Set(board.filter((r) => r.status === 'BLOCKED').map((r) => r.id));
  if (!decisions) return asks;
  for (const block of decisions.split(/^## /m).slice(1)) {
    const title = block.split('\n')[0].trim();
    const isBlocker = /Type:\s*blocker/i.test(block);
    const answered = /Answer:|Status:\s*(answered|resolved)/i.test(block);
    if (isBlocker && !answered && [...blockedIds].some((id) => block.includes(id) || true)) {
      asks.push(title);
    }
  }
  return asks.slice(-4);
}

async function snapshotState() {
  const control = await readIf(path.join(GL_DIR, 'CONTROL.md'));
  const decisions = await readIf(path.join(GL_DIR, 'DECISIONS.md'));
  if (!control) {
    return { bootstrapped: false, branch: await exec('git', ['branch', '--show-current']) };
  }
  const fm = parseFrontMatter(control);
  const board = parseBoard(control);
  return {
    bootstrapped: true,
    project: fm.project || path.basename(REPO),
    version: fm.version || '',
    status: fm.status || '',
    greenlight: fm.greenlight === 'yes',
    loop_count: fm.loop_count || '0',
    board,
    nextAction: parseNextAction(control),
    security: parseSecurity(control),
    openAsks: parseOpenAsks(decisions, board),
    branch: await exec('git', ['branch', '--show-current']),
    commits: ((await exec('git', ['log', '--oneline', '-12'])) || '').split('\n').filter(Boolean),
  };
}

// ------------------------------------------------------------ event fan-out

const clients = new Set();
const history = [];                   // feed ring buffer, survives page refresh
const HISTORY_MAX = 300;

function broadcast(type, data) {
  const evt = { type, data, ts: Date.now() };
  if (type !== 'state') {
    history.push(evt);
    if (history.length > HISTORY_MAX) history.shift();
  }
  const line = `data: ${JSON.stringify(evt)}\n\n`;
  for (const res of clients) res.write(line);
}

let stateTimer = null;
function stateChanged() {
  clearTimeout(stateTimer);
  stateTimer = setTimeout(async () => broadcast('state', await snapshotState()), 350);
}

// Watch the greenlight docs and the git ref for live board/commit updates.
try { fs.watch(GL_DIR, stateChanged); } catch { /* dir may not exist pre-install */ }
try { fs.watch(path.join(REPO, '.git'), (_, f) => { if (!f || /HEAD|refs/.test(f)) stateChanged(); }); } catch { /* not a git repo yet */ }

// -------------------------------------------------------------- the session

const session = {
  active: false,
  mode: null,               // 'bootstrap' | 'loop' | 'chat'
  review: false,            // true => Edit/Write/Bash wait for an Allow button
  inbox: [],
  wake: null,
  abort: null,
  pending: new Map(),       // id -> resolve(answerPayload)
};

const MUTATING = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Bash']);

function pushUser(text) {
  session.inbox.push({
    type: 'user',
    message: { role: 'user', content: text },
    parent_tool_use_id: null,
  });
  session.wake?.();
}

async function* userStream() {
  while (session.active) {
    while (session.inbox.length) yield session.inbox.shift();
    await new Promise((r) => (session.wake = r));
  }
}

function waitForBrowser(kind, payload) {
  const id = randomUUID();
  broadcast(kind, { id, ...payload });
  return new Promise((resolve) => session.pending.set(id, resolve));
}

async function canUseTool(toolName, input) {
  if (toolName === 'AskUserQuestion') {
    const reply = await waitForBrowser('question', { questions: input.questions || [] });
    broadcast('question-answered', { answers: reply.answers });
    return { behavior: 'allow', updatedInput: { ...input, answers: reply.answers } };
  }
  if (session.review && MUTATING.has(toolName)) {
    const summary =
      toolName === 'Bash' ? input.command :
      input.file_path ? `${toolName} ${path.relative(REPO, String(input.file_path))}` : toolName;
    const reply = await waitForBrowser('approval', { tool: toolName, summary });
    if (!reply.allow) {
      broadcast('denied', { tool: toolName, summary });
      return { behavior: 'deny', message: 'The human denied this from the dashboard. Ask them what to do instead.' };
    }
  }
  return { behavior: 'allow', updatedInput: input };
}

async function runSession(mode, firstMessage) {
  const { query } = await import('@anthropic-ai/claude-agent-sdk');
  session.active = true;
  session.mode = mode;
  session.abort = new AbortController();
  broadcast('session', { status: 'running', mode });
  pushUser(firstMessage);

  try {
    const q = query({
      prompt: userStream(),
      options: {
        cwd: REPO,
        abortController: session.abort,
        permissionMode: 'default',
        settingSources: ['user', 'project', 'local'],
        canUseTool,
        ...(process.env.ANTHROPIC_MODEL ? { model: process.env.ANTHROPIC_MODEL } : {}),
      },
    });
    for await (const m of q) {
      if (m.type === 'assistant') {
        for (const b of m.message.content) {
          if (b.type === 'text' && b.text.trim()) broadcast('claude', { text: b.text });
          if (b.type === 'tool_use') {
            const label =
              b.name === 'Bash' ? (b.input?.command || '').slice(0, 120) :
              b.input?.file_path ? path.relative(REPO, String(b.input.file_path)) :
              b.name === 'AskUserQuestion' ? 'asking you…' : '';
            broadcast('tool', { name: b.name, label });
          }
        }
      }
      if (m.type === 'result') {
        broadcast('done', { subtype: m.subtype, cost: m.total_cost_usd ?? null });
      }
    }
  } catch (err) {
    if (!session.abort?.signal.aborted) broadcast('error', { message: String(err?.message || err) });
  } finally {
    session.active = false;
    session.mode = null;
    for (const resolve of session.pending.values()) resolve({ allow: false, answers: {} });
    session.pending.clear();
    broadcast('session', { status: 'idle' });
    stateChanged();
  }
}

const DASHBOARD_PREAMBLE =
  'You are being driven from the Greenlight dashboard, a local UI. The human sees your ' +
  'replies as a live feed. Whenever you need them to decide something, use the ' +
  'AskUserQuestion tool — they answer with buttons. Keep narration short and plain.\n\n';

async function startMode(mode, text) {
  if (session.active) return { error: 'A session is already running. Stop it first.' };
  if (mode === 'chat') { runSession('chat', DASHBOARD_PREAMBLE + text); return {}; }
  const file = mode === 'bootstrap' ? 'prompts/bootstrap.md' : 'prompts/loop.md';
  const prompt = await readIf(path.join(GL_DIR, file));
  if (!prompt) return { error: `${file} not found — is Greenlight installed in this project?` };
  runSession(mode, DASHBOARD_PREAMBLE + prompt);
  return {};
}

// ------------------------------------------------------------------- mock
// GREENLIGHT_MOCK=1 plays a scripted session so the UI can be demoed and
// tested without spending tokens. Not used in normal operation.

async function runMock() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  session.active = true;
  broadcast('session', { status: 'running', mode: 'loop' });
  await sleep(600);
  broadcast('claude', { text: 'Loop 7 — reading CONTROL.md and the ledger tails.' });
  broadcast('tool', { name: 'Read', label: 'greenlight/CONTROL.md' });
  await sleep(900);
  broadcast('tool', { name: 'Bash', label: 'npm test' });
  await sleep(900);
  broadcast('claude', { text: 'Verify rung: F-002 streak counter — all 14 unit tests pass, including the DST spring-forward edge. Promoting to PASSING (2/3) and saving evidence.' });
  await sleep(700);
  const q = await waitForBrowser('question', {
    questions: [{
      question: 'F-005 needs an invite model. Which should I build?',
      header: 'Invites',
      options: [
        { label: 'Share link', description: 'Anyone with the link can pair — simplest.' },
        { label: 'Email invite', description: 'Send an invite to a specific address.' },
      ],
      multiSelect: false,
    }],
  });
  broadcast('question-answered', { answers: q.answers });
  await sleep(600);
  session.review = true;
  const a = await waitForBrowser('approval', { tool: 'Bash', summary: 'git commit -m "loop 7: verify F-002"' });
  broadcast(a.allow ? 'tool' : 'denied', { name: 'Bash', tool: 'Bash', label: 'git commit -m "loop 7: verify F-002"', summary: 'git commit' });
  await sleep(500);
  broadcast('claude', { text: 'Committed. Next action: harden SEC-001 toward 3/3.' });
  broadcast('done', { subtype: 'success', cost: 0.42 });
  session.active = false;
  broadcast('session', { status: 'idle' });
}

// ------------------------------------------------------------------ server

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml' };

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

  if (url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    clients.add(res);
    res.write(`data: ${JSON.stringify({ type: 'hello', data: { history, session: { active: session.active, mode: session.mode, review: session.review } } })}\n\n`);
    snapshotState().then((s) => res.write(`data: ${JSON.stringify({ type: 'state', data: s })}\n\n`));
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST') {
    const b = await body(req);
    if (url.pathname === '/start') {
      if (MOCK) { runMock(); return send(200, {}); }
      return send(200, await startMode(b.mode, b.text || ''));
    }
    if (url.pathname === '/send') {
      if (!session.active) return send(200, await startMode('chat', b.text));
      pushUser(b.text);
      broadcast('you', { text: b.text });
      return send(200, {});
    }
    if (url.pathname === '/answer') {
      const resolve = session.pending.get(b.id);
      if (resolve) { session.pending.delete(b.id); resolve(b); }
      return send(200, {});
    }
    if (url.pathname === '/stop') {
      session.abort?.abort();
      return send(200, {});
    }
    if (url.pathname === '/review') {
      session.review = !!b.on;
      broadcast('session', { status: session.active ? 'running' : 'idle', mode: session.mode, review: session.review });
      return send(200, {});
    }
    return send(404, { error: 'unknown endpoint' });
  }

  // static files
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const fp = path.join(UI_DIR, path.normalize(file));
  if (!fp.startsWith(UI_DIR)) { res.writeHead(403); return res.end(); }
  try {
    const data = await fsp.readFile(fp);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Greenlight dashboard → http://localhost:${PORT}${MOCK ? '   (mock mode)' : ''}`);
});
