/* Greenlight dashboard client — renders the live feed and the status board. */

const $ = (id) => document.getElementById(id);
const feed = $('feed');

const post = (path, body) =>
  fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Minimal, safe markdown: paragraphs, fenced code, inline code, bold.
function md(text) {
  const parts = String(text).split(/```/);
  let out = '';
  parts.forEach((part, i) => {
    if (i % 2) { out += `<pre><code>${esc(part.replace(/^\w+\n/, ''))}</code></pre>`; return; }
    out += esc(part)
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .map((p) => `<p>${p
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')}</p>`)
      .join('');
  });
  return out;
}

function scrollFeed() { feed.scrollTop = feed.scrollHeight; }

function add(html, cls) {
  const div = document.createElement('div');
  div.className = cls || '';
  div.innerHTML = html;
  feed.appendChild(div);
  scrollFeed();
  return div;
}

/* ------------------------------------------------------------ feed events */

function settleNewestOpen(kind, label) {
  const cards = [...feed.querySelectorAll(`.ask[data-kind="${kind}"]:not(.settled)`)];
  const card = cards[cards.length - 1];
  if (!card) return;
  card.classList.add('settled');
  const picked = card.querySelector('.picked');
  if (picked) { picked.hidden = false; picked.textContent = label; }
}

function renderEvent(evt) {
  const { type, data } = evt;

  if (type === 'claude') add(md(data.text), 'entry claude');
  if (type === 'you') add(md(data.text), 'entry you');
  if (type === 'question-answered') {
    const first = Object.values(data.answers || {})[0];
    settleNewestOpen('question', first ? `you chose: ${first}` : 'answered');
  }
  if (type === 'approval-answered') settleNewestOpen('approval', data.allow ? 'allowed' : 'denied');
  if (type === 'tool') {
    const label = data.label ? ` <b>${esc(data.label)}</b>` : '';
    add(`<span class="chip">▸ ${esc(data.name)}${label}</span>`, '');
  }
  if (type === 'error') add(`something went wrong: ${esc(data.message)}`, 'sysline err');
  if (type === 'denied') add(`you denied: ${esc(data.summary || data.tool)}`, 'sysline');
  if (type === 'done') {
    const cost = data.cost != null ? ` · $${Number(data.cost).toFixed(2)}` : '';
    add(`session finished (${esc(data.subtype || 'done')}${cost}) — start the loop again anytime`, 'sysline');
  }
  if (type === 'question') renderQuestion(data);
  if (type === 'approval') renderApproval(data);
}

function renderQuestion(data) {
  // AskUserQuestion can carry 1-4 questions, each single- or multi-select.
  const questions = (data.questions || []).length ? data.questions : [{ question: '(question)', options: [] }];
  const card = add('', 'ask');
  card.dataset.kind = 'question';
  const answers = {};
  const doneCount = () => Object.keys(answers).length;

  const finish = () => {
    card.classList.add('settled');
    const picked = card.querySelector('.picked');
    picked.hidden = false;
    picked.textContent = `you chose: ${Object.values(answers).join(' · ')}`;
    post('/answer', { id: data.id, answers });
  };

  questions.forEach((q) => {
    const box = document.createElement('div');
    box.innerHTML = `
      <h3>${esc(q.question)}</h3>
      ${q.header ? `<div class="why">${esc(q.header)}</div>` : ''}
      <div class="opts"></div>`;
    const opts = box.querySelector('.opts');
    const selected = new Set();

    const pick = (label) => {
      if (q.multiSelect) {
        selected.has(label) ? selected.delete(label) : selected.add(label);
        [...opts.children].forEach((b) => b.classList.toggle('on', selected.has(b.dataset.label)));
        answers[q.question] = [...selected].join(', ');
        if (!selected.size) delete answers[q.question];
        return;
      }
      answers[q.question] = label;
      [...opts.children].forEach((b) => b.classList.toggle('on', b.dataset.label === label));
      if (doneCount() === questions.length) finish();
    };

    (q.options || []).forEach((o) => {
      const b = document.createElement('button');
      b.dataset.label = o.label;
      b.innerHTML = `${esc(o.label)}${o.description ? `<small>${esc(o.description)}</small>` : ''}`;
      b.onclick = () => pick(o.label);
      opts.appendChild(b);
    });
    const other = document.createElement('button');
    other.dataset.label = '__other__';
    other.innerHTML = 'Other…<small>type your own answer</small>';
    other.onclick = () => {
      const text = prompt(q.question);
      if (!text) return;
      answers[q.question] = text;
      other.classList.add('on');
      if (!q.multiSelect && doneCount() === questions.length) finish();
    };
    opts.appendChild(other);
    card.appendChild(box);
  });

  // Multi-select (or multi-question with a multiSelect present) needs an explicit submit.
  if (questions.some((q) => q.multiSelect)) {
    const done = document.createElement('button');
    done.className = 'submit';
    done.textContent = 'Send answers';
    done.onclick = () => { if (doneCount() === questions.length) finish(); };
    card.appendChild(done);
  }

  const picked = document.createElement('div');
  picked.className = 'picked';
  picked.hidden = true;
  card.appendChild(picked);
  scrollFeed();
}

function renderApproval(data) {
  const card = add('', 'ask');
  card.dataset.kind = 'approval';
  card.innerHTML = `
    <h3>Allow this?</h3>
    <div class="why mono">${esc(data.summary || data.tool)}</div>
    <div class="opts"></div>
    <div class="picked" hidden></div>`;
  const opts = card.querySelector('.opts');
  const settle = (allow) => {
    card.classList.add('settled');
    const picked = card.querySelector('.picked');
    picked.hidden = false;
    picked.textContent = allow ? 'allowed' : 'denied';
    post('/answer', { id: data.id, allow });
  };
  const yes = document.createElement('button');
  yes.textContent = 'Allow';
  yes.onclick = () => settle(true);
  const no = document.createElement('button');
  no.textContent = 'Deny';
  no.onclick = () => settle(false);
  opts.append(yes, no);
  scrollFeed();
}

/* ------------------------------------------------------------ board panel */

function renderState(s) {
  $('notready').hidden = !!s.bootstrapped;
  $('ready').hidden = !s.bootstrapped;
  if (!s.bootstrapped) {
    $('project').textContent = 'Greenlight';
    $('meta').textContent = s.branch ? `on ${s.branch}` : '';
    return;
  }
  $('project').textContent = s.project;
  $('meta').textContent = `v${s.version} · ${s.status} · loop ${s.loop_count}`;
  $('lamp').classList.toggle('green', !!s.greenlight);

  $('next').textContent = s.nextAction || '—';

  const rows = s.board || [];
  $('feature-count').textContent = rows.length ? `${rows.filter((r) => r.status === 'STABLE').length}/${rows.length} stable` : '';
  $('board').querySelector('tbody').innerHTML = rows
    .map(
      (r) => `<tr>
        <td class="fid">${esc(r.id)}</td>
        <td class="fname">${esc(r.name)}</td>
        <td><span class="pill ${esc(r.status)}">${esc(r.status)}</span></td>
        <td class="passes">${esc(r.passes || '')}</td>
      </tr>`
    )
    .join('');

  const asks = s.openAsks || [];
  $('asks-card').hidden = !asks.length;
  $('asks').innerHTML = asks.map((a) => `<li>${esc(a)}</li>`).join('');

  const sec = s.security || { done: 0, total: 0 };
  $('sec-bar').style.width = sec.total ? `${(100 * sec.done) / sec.total}%` : '0';
  $('sec-label').textContent = sec.total ? `${sec.done} of ${sec.total} checks green` : '';

  $('branch').textContent = s.branch ? `on ${s.branch}` : '';
  $('commits').innerHTML = (s.commits || []).map((c) => `<li>${esc(c)}</li>`).join('');
}

/* -------------------------------------------------------------- controls */

function setRunning(running) {
  $('btn-stop').hidden = !running;
  $('btn-loop').disabled = running;
  $('btn-bootstrap').disabled = running;
  $('lamp').classList.toggle('working', running);
}

$('btn-loop').onclick = () => { post('/start', { mode: 'loop' }); add('starting the loop…', 'sysline'); };
$('btn-bootstrap').onclick = () => { post('/start', { mode: 'bootstrap' }); add('starting bootstrap — it will ask about your idea…', 'sysline'); };
$('btn-stop').onclick = () => post('/stop');
$('review').onchange = (e) => post('/review', { on: e.target.checked });

$('composer').onsubmit = (e) => {
  e.preventDefault();
  const text = $('say').value.trim();
  if (!text) return;
  $('say').value = '';
  post('/send', { text });
};

/* ---------------------------------------------------------------- stream */

const es = new EventSource('/events');
es.onmessage = (e) => {
  const evt = JSON.parse(e.data);
  if (evt.type === 'hello') {
    feed.innerHTML = '';
    (evt.data.history || []).forEach(renderEvent);
    setRunning(!!evt.data.session?.active);
    $('review').checked = !!evt.data.session?.review;
    return;
  }
  if (evt.type === 'state') return renderState(evt.data);
  if (evt.type === 'session') {
    setRunning(evt.data.status === 'running');
    if (typeof evt.data.review === 'boolean') $('review').checked = evt.data.review;
    return;
  }
  renderEvent(evt);
};
es.onerror = () => add('lost connection to the dashboard server — is it still running?', 'sysline err');
