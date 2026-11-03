'use strict';
const byId = (id) => document.getElementById(id);
let steps = [];
let current = 0;
let timer = null;
function stopReplay() {
  clearInterval(timer);
  timer = null;
  byId('play-demo').textContent = 'Play steps';
  byId('play-demo').setAttribute('aria-pressed', 'false');
}
function renderStep(index) {
  if (!steps.length) return;
  current = (index + steps.length) % steps.length;
  const step = steps[current];
  byId('step-number').textContent = String(current + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
  byId('step-title').textContent = step.title;
  byId('demo-command').textContent = step.command;
  const output = byId('demo-output');
  output.replaceChildren();
  for (const line of Array.isArray(step.output) ? step.output : [step.output]) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line || '';
    output.append(paragraph);
  }
  byId('result-label').textContent = step.verified ? 'Verified with a synthetic fixture · original unchanged' : 'Synthetic fixture · see evidence for verification scope';
  document.querySelectorAll('#step-dots button').forEach((button, i) => {
    button.classList.toggle('active', i === current);
    button.setAttribute('aria-current', i === current ? 'step' : 'false');
  });
}
for (const [id, delta] of [['previous-step', -1], ['next-step', 1]]) {
  byId(id).addEventListener('click', () => { stopReplay(); renderStep(current + delta); });
}
byId('play-demo').addEventListener('click', () => {
  if (timer) { stopReplay(); return; }
  if (!steps.length) return;
  byId('play-demo').textContent = 'Pause steps';
  byId('play-demo').setAttribute('aria-pressed', 'true');
  timer = setInterval(() => {
    if (current === steps.length - 1) { stopReplay(); return; }
    renderStep(current + 1);
  }, 3600);
  if (current === steps.length - 1) renderStep(0);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopReplay(); });
fetch('./demo.json').then((response) => {
  if (!response.ok) throw new Error('Demo evidence unavailable');
  return response.json();
}).then((data) => {
  if (data.kind !== 'synthetic' || !Array.isArray(data.steps) || !data.steps.length) throw new Error('Invalid evidence');
  steps = data.steps.slice();
  if (data.fixture && steps[0]) {
    steps[0] = { ...steps[0], output: steps[0].output.concat([
      '', 'History inside this fixture:',
      'Superseded draft: ' + data.fixture.initial_decision,
      'Latest decision: ' + data.fixture.corrected_decision,
      'Fact from a historical tool result: ' + data.fixture.tool_only_fact,
    ]) };
  }
  if (data.live && data.live.status === 'passed' && data.live.answer) {
    steps.push({
      id: 'live', title: 'The new session recalls the latest decisions',
      command: 'codex exec resume --all NEW_SESSION_UUID "Return the latest release, database and fixture_serial from history."',
      output: ['Recorded model response:', JSON.stringify(data.live.answer, null, 2),
        'ZIP handoff + Claude → Codex: 2/2 verified continuations.',
        'Model: ' + data.live.model + ' · zero tools executed.'],
      verified: true,
    });
  }
  steps.forEach((step, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = ({export: 'Export', inspect: 'Inspect', import: 'Import', convert: 'Convert', live: 'Continue'})[step.id] || 'Step ' + (index + 1);
    button.setAttribute('aria-label', 'Step ' + (index + 1) + ': ' + step.title);
    button.addEventListener('click', () => { stopReplay(); renderStep(index); });
    byId('step-dots').append(button);
  });
  renderStep(0);
}).catch(() => {
  byId('step-title').textContent = 'Evidence unavailable';
  byId('demo-command').textContent = 'Open the source repository for the reproducible demo.';
  byId('result-label').textContent = 'This preview does not run commands or access your sessions.';
  for (const id of ['previous-step', 'next-step', 'play-demo']) byId(id).disabled = true;
});
let toastTimer;
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = byId(button.dataset.copy).textContent;
    const status = byId('copy-status');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Commands copied. Review before running.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(byId(button.dataset.copy));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Commands selected. Use your browser’s copy command.';
    }
    clearTimeout(toastTimer);
    status.classList.add('visible');
    toastTimer = setTimeout(() => status.classList.remove('visible'), 3200);
  });
});
