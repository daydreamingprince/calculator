'use strict';
const display = document.querySelector('#display');
const history = document.querySelector('#history');
let input = '0', stored = null, operator = null, fresh = false, failed = false;
const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const format = value => String(Number(value.toPrecision(12)));
function render() { display.textContent = input; }
function clear() {
  input = '0'; stored = null; operator = null; fresh = false; failed = false;
  history.textContent = 'Ready when you are'; render();
}
function error(message) {
  input = 'Error'; stored = null; operator = null; fresh = true; failed = true;
  history.textContent = message; render();
}
function digit(value) {
  if (failed) clear();
  if (fresh) { input = '0'; fresh = false; }
  if (input.replace(/[-.]/g, '').length >= 12) return;
  input = input === '0' ? value : input + value; render();
}
function decimal() {
  if (failed) clear();
  if (fresh) { input = '0'; fresh = false; }
  if (!input.includes('.') && !input.includes('e')) input += '.';
  render();
}
function calculate(a, b, op) {
  if (op === '/' && b === 0) { error('Cannot divide by zero · C to reset'); return null; }
  const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b;
  if (!Number.isFinite(result)) { error('Result out of range · C to reset'); return null; }
  return result;
}
function chooseOperator(next) {
  if (failed) return;
  const value = Number(input);
  if (operator && !fresh) {
    const result = calculate(stored, value, operator);
    if (result === null) return;
    input = format(result); stored = Number(input);
  } else if (stored === null || !operator) stored = value;
  operator = next; fresh = true;
  history.textContent = `${format(stored)} ${symbols[next]}`; render();
}
function equals() {
  if (failed || !operator || fresh) return;
  const right = Number(input), left = stored, op = operator;
  const result = calculate(left, right, op);
  if (result === null) return;
  history.textContent = `${format(left)} ${symbols[op]} ${format(right)} =`;
  input = format(result); stored = null; operator = null; fresh = true; render();
}
function percent() {
  if (failed) return;
  input = format(Number(input) / 100); fresh = false; render();
}
function backspace() {
  if (failed) { clear(); return; }
  if (fresh && operator) return;
  if (fresh) { fresh = false; history.textContent = 'Editing result'; }
  input = input.includes('e') ? '0' : input.slice(0, -1);
  if (!input || input === '-') input = '0'; render();
}
const actions = { clear, backspace, percent, decimal, equals };
document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.digit !== undefined) digit(button.dataset.digit);
  else if (button.dataset.op) chooseOperator(button.dataset.op);
  else actions[button.dataset.action]?.();
});
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key;
  let action;
  if (/^[0-9]$/.test(key)) action = () => digit(key);
  else if (['+', '-', '*', '/'].includes(key)) action = () => chooseOperator(key);
  else if (key === '.') action = decimal;
  else if (key === '%' ) action = percent;
  else if (key === 'Enter' || key === '=') action = equals;
  else if (key === 'Backspace') action = backspace;
  else if (['Escape', 'Delete', 'c', 'C'].includes(key)) action = clear;
  if (action) { event.preventDefault(); action(); }
});
render();

// Theme controls are isolated from the calculator's arithmetic and keyboard logic.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try { saved = localStorage.getItem('calculator-theme'); } catch (_) {}
  let explicit = saved === 'light' || saved === 'dark';
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    toggle.textContent = dark ? '☀ Light' : '☾ Dark';
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    toggle.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#16130f' : '#f7f2e9';
  }
  applyTheme(explicit ? saved : preference.matches ? 'dark' : 'light');
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    explicit = true;
    applyTheme(theme);
    try { localStorage.setItem('calculator-theme', theme); } catch (_) {}
  });
  preference.addEventListener('change', event => {
    if (!explicit) applyTheme(event.matches ? 'dark' : 'light');
  });
})();
// Sound feedback is appended: calculator and theme logic above remain untouched.
(() => {
  const toggle = document.querySelector('#sound-toggle');
  const screen = document.querySelector('#display');
  const storageKey = 'calculator-sound';
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch (_) {}
  let snd = null;
  let ready = false;
  if (typeof Snd === 'function') {
    // No automatic class listeners: one sound per delegated interaction.
    snd = new Snd({ easySetup: false, preloadSoundKit: null });
    snd.load(Snd.KITS.SND01).then(() => { ready = true; }).catch(() => {
      // Sound is progressive enhancement; offline calculators still work.
      ready = false;
    });
  }
  function updateToggle() {
    toggle.dataset.muted = String(!enabled);
    toggle.setAttribute('aria-pressed', String(!enabled));
    const label = enabled ? 'Mute sounds' : 'Unmute sounds';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }
  function play(key) {
    if (!enabled || !ready || !snd) return;
    try { snd.play(key, { volume: 0.25 }); } catch (_) {}
  }
  function stopSounds() {
    if (!snd || typeof Snd === 'undefined') return;
    // Stop tails of previous notes, but let the off confirmation finish.
    Object.values(Snd.SOUNDS).forEach(key => {
      try { snd.stop(key); } catch (_) {}
    });
  }
  updateToggle();
  toggle.addEventListener('click', () => {
    if (enabled) {
      stopSounds();
      play('toggle_off'); // Audible confirmation BEFORE disabling future sounds.
      enabled = false;
    } else {
      enabled = true;
      play('toggle_on');
    }
    updateToggle();
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch (_) {}
  });
  // Run after existing calculator/theme listeners, including the library's
  // window click initializer. Error feedback replaces the normal key sound.
  function feedback(key, wasError) {
    const isError = screen.textContent === 'Error';
    play(isError && !wasError ? 'caution' : key);
  }
  let wasError = false;
  document.addEventListener('click', () => {
    wasError = screen.textContent === 'Error';
  }, true);
  window.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button === toggle) return;
    if (button.id === 'theme-toggle') {
      play(document.documentElement.dataset.theme === 'light' ? 'toggle_on' : 'toggle_off');
      return;
    }
    if (!button.closest('.keys')) return;
    const action = button.dataset.action;
    const key = button.dataset.digit !== undefined || action === 'decimal' ? 'tap'
      : button.dataset.op || ['percent', 'sign', 'negate'].includes(action) ? 'button'
      : action === 'equals' ? 'notification'
      : action === 'clear' ? 'toggle_off'
      : action === 'backspace' ? 'tap' : null;
    if (key) feedback(key, wasError);
  });
  // Capture the prior display without intercepting or changing keyboard input.
  let keyWasError = false;
  document.addEventListener('keydown', () => {
    keyWasError = screen.textContent === 'Error';
  }, true);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key;
    const sound = /^[0-9.]$/.test(key) || key === 'Backspace' ? 'tap'
      : ['+', '-', '*', '/', '%'].includes(key) ? 'button'
      : ['Enter', '='].includes(key) ? 'notification'
      : ['Escape', 'Delete', 'c', 'C'].includes(key) ? 'toggle_off' : null;
    if (sound) feedback(sound, keyWasError);
  });
})();
