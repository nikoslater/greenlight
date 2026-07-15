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
  // A feature is "waiting on you" while its board row says BLOCKED; the matching
  // DECISIONS blocker entry provides the human-readable ask.
  const asks = [];
  if (!decisions) return asks;
  const blockedIds = board.filter((r) => r.status === 'BLOCKED').map((r) => r.id);
  if (!blockedIds.length) return asks;
  for (const block of decisions.split(/^## /m).slice(1)) {
    const title = block.split('\n')[0].trim();
    const isBlocker = /Type:\s*blocker/i.test(block);
    if (isBlocker && blockedIds.some((id) => block.includes(id))) asks.push(title);
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
  starting: false,          // synchronous guard against a double Start click
  mode: null,               // 'bootstrap' | 'loop' | 'chat'
  review: false,            // true => Edit/Write/Bash wait for an Allow button
  inbox: [],
  wake: null,
  abort: null,
  pending: new Map(),       // id -> resolve(answerPayload)
};

const MUTATING = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Bash']);

let sessionEpoch = 0;

function pushUser(text) {
  session.inbox.push({
    type: 'user',
    message: { role: 'user', content: text },
    parent_tool_use_id: null,
  });
  session.wake?.();
}

async function* userStream(epoch) {
  // The epoch guard keeps a stale generator from a stopped session from ever
  // stealing messages meant for the next one.
  while (session.active && epoch === sessionEpoch) {
    while (session.inbox.length && epoch === sessionEpoch) yield session.inbox.shift();
    await new Promise((r) => (session.wake = r));
  }
}

function waitForBrowser(kind, payload) {
  const id = randomUUID();
  broadcast(kind, { id, ...payload });
  return new Promise((resolve) => session.pending.set(id, resolve));
}

// AskUserQuestion always routes here — surface it as a question card.
async function canUseTool(toolName, input) {
  if (toolName === 'AskUserQuestion') {
    const reply = await waitForBrowser('question', { questions: input.questions || [] });
    broadcast('question-answered', { answers: reply.answers });
    return { behavior: 'allow', updatedInput: { ...input, answers: reply.answers } };
  }
  return { behavior: 'allow', updatedInput: input };
}

// Review-mode gating lives in a PreToolUse hook, NOT canUseTool: hooks run before
// settings allow-rules, so a change waits for the Allow button even when the user's
// Claude settings would otherwise auto-approve the tool. (The SDK itself recommends
// exactly this to "gate every tool call".)
async function preToolUse(inp) {
  if (!session.review || !MUTATING.has(inp.tool_name)) return {};
  const ti = inp.tool_input || {};
  const summary =
    inp.tool_name === 'Bash' ? ti.command :
    ti.file_path ? `${inp.tool_name} ${path.relative(REPO, String(ti.file_path))}` : inp.tool_name;
  const reply = await waitForBrowser('approval', { tool: inp.tool_name, summary });
  broadcast('approval-answered', { allow: !!reply.allow });
  if (!reply.allow) {
    broadcast('denied', { tool: inp.tool_name, summary });
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'The human denied this from the dashboard. Ask them what to do instead.' } };
  }
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow', permissionDecisionReason: 'Approved in the Greenlight dashboard.' } };
}

async function runSession(mode, firstMessage) {
  let query;
  try {
    ({ query } = await import('@anthropic-ai/claude-agent-sdk'));
  } catch {
    session.starting = false;
    broadcast('error', { message: 'Dashboard dependencies missing — rerun ./greenlight/ui/start.sh to install them.' });
    return;
  }
  session.active = true;
  session.starting = false;
  session.mode = mode;
  session.abort = new AbortController();
  const epoch = ++sessionEpoch;
  broadcast('session', { status: 'running', mode });
  pushUser(firstMessage);

  try {
    const q = query({
      prompt: userStream(epoch),
      options: {
        cwd: REPO,
        abortController: session.abort,
        permissionMode: 'default',
        settingSources: ['user', 'project', 'local'],
        canUseTool,
        hooks: { PreToolUse: [{ hooks: [preToolUse] }] },
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
    session.inbox.length = 0;
    session.wake?.();          // wake the generator so it observes the end and returns
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
  if (session.active || session.starting) return { error: 'A session is already running. Stop it first.' };
  session.starting = true;     // synchronous guard: blocks a second click during the awaits below
  if (mode === 'chat') { runSession('chat', DASHBOARD_PREAMBLE + text); return {}; }
  const file = mode === 'bootstrap' ? 'prompts/bootstrap.md' : 'prompts/loop.md';
  const prompt = await readIf(path.join(GL_DIR, file));
  if (!prompt) { session.starting = false; return { error: `${file} not found — is Greenlight installed in this project?` }; }
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
  try {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    return JSON.parse(raw || '{}');
  } catch {
    return {};                 // aborted socket or bad JSON — never crash the server
  }
}

// A local dashboard must refuse commands from other websites open in the browser.
// Same-origin fetches from the served page carry a localhost Origin; block the rest,
// and reject non-local Host headers (DNS-rebinding guard).
function isLocalRequest(req) {
  const host = (req.headers.host || '').split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') return false;
  const origin = req.headers.origin;
  if (!origin) return true;    // curl / native clients send no Origin
  try {
    const h = new URL(origin).hostname;
    return h === 'localhost' || h === '127.0.0.1';
  } catch { return false; }
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
    if (!isLocalRequest(req)) return send(403, { error: 'cross-origin request refused' });
    const b = await body(req);
    if (url.pathname === '/start') {
      if (MOCK) { runMock(); return send(200, {}); }
      const r = await startMode(b.mode, b.text || '');
      if (r.error) broadcast('error', { message: r.error });
      return send(200, r);
    }
    if (url.pathname === '/send') {
      const text = (b.text || '').trim();
      if (!text) return send(200, {});
      if (!session.active) {
        broadcast('you', { text });
        const r = await startMode('chat', text);
        if (r.error) broadcast('error', { message: r.error });
        return send(200, r);
      }
      pushUser(text);
      broadcast('you', { text });
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
