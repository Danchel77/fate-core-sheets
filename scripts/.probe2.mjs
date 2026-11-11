import { spawn } from 'node:child_process';
const steps = [
  { waitFor: 'document.readyState === "complete" && !!document.querySelector("button")', timeout: 15000 },
  { click: 'Создать персонажа' },
  { wait: 1200 },
  { eval: `window.scrollTo(0, 900); 'scrolled'` },
  { wait: 600 },
  { eval: `JSON.stringify((() => { const n = document.querySelector('nav.sticky'); const cs = n && getComputedStyle(n); return { exists: !!n, pos: cs && cs.position, top: cs && cs.top, z: cs && cs.zIndex, rectTop: n && Math.round(n.getBoundingClientRect().top), rectH: n && Math.round(n.getBoundingClientRect().height), scrollY: Math.round(window.scrollY) }; })())` },
];
spawn(process.execPath, ['scripts/interactive-shot.cjs', '--width=1440', '--height=1100', '--url=/?mock=1', '--out=scripts/.probe2.png', `--steps=${JSON.stringify(steps)}`], { stdio: 'inherit' });
