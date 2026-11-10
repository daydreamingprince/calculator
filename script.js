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
