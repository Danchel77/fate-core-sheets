import { spawn } from 'node:child_process';
const steps = [
  { waitFor: 'document.readyState === "complete" && !!document.querySelector("button")', timeout: 15000 },
  { click: 'Создать персонажа' },
  { wait: 1200 },
  { eval: `JSON.stringify((() => { const out = []; let el = document.querySelector('nav.sticky'); while (el && el !== document.documentElement) { const cs = getComputedStyle(el); out.push({ tag: el.tagName + '.' + (el.className || '').toString().slice(0, 40), overflow: cs.overflow, display: cs.display, position: cs.position, contain: cs.contain, height: Math.round(el.getBoundingClientRect().height) }); el = el.parentElement; } return out; })())` },
];
spawn(process.execPath, ['scripts/interactive-shot.cjs', '--width=1440', '--height=1100', '--url=/?mock=1', '--out=scripts/.probe3.png', `--steps=${JSON.stringify(steps)}`], { stdio: 'inherit' });
