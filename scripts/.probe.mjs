import { spawn } from 'node:child_process';
import { HELPERS } from './e2e/lib/helpers.mjs';
import { WIZARD_SRC } from './e2e/lib/wizard-src.mjs';
const expression = HELPERS + WIZARD_SRC + `
__t.run('probe', async () => {
  const t = window.__t;
  await fillWizard(t, { stopAt: 'skills' });
});
`;
const steps = [
  { waitFor: 'document.readyState === "complete" && !!document.querySelector("button")', timeout: 15000 },
  { eval: expression },
  { waitFor: 'document.title === "probe:done" || document.title.startsWith("probe:error:")', timeout: 60000 },
  { eval: `JSON.stringify({locks: document.querySelectorAll('svg.lucide-lock').length, text: document.body.textContent.match(/\\d+\\s*\\/\\s*4/g), swatches: document.body.textContent.includes('Выберите навык справа')})` },
];
spawn(process.execPath, ['scripts/interactive-shot.cjs', '--width=1440', '--height=1100', '--url=/?mock=1', '--out=scripts/.probe.png', `--steps=${JSON.stringify(steps)}`], { stdio: 'inherit' });
