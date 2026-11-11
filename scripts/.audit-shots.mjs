import { spawn } from 'node:child_process';
import { HELPERS } from './e2e/lib/helpers.mjs';
import { WIZARD_SRC } from './e2e/lib/wizard-src.mjs';

const targets = [
  { name: 'audit-concept', stopAt: 'concept', height: 900 },
  { name: 'audit-backstory', stopAt: 'backstory', height: 900 },
];

for (const target of targets) {
  const steps = [
    { waitFor: 'document.readyState === "complete" && !!document.querySelector("button")', timeout: 15000 },
    { eval: HELPERS + WIZARD_SRC + `__t.run('${target.name}', async () => { await fillWizard(window.__t, { stopAt: '${target.stopAt}' }); });` },
    { waitFor: `document.title === "${target.name}:done" || document.title.startsWith("${target.name}:error:")`, timeout: 60000 },
    { shot: { out: `scripts/${target.name}.png` } },
  ];
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [
      'scripts/interactive-shot.cjs',
      '--width=1440',
      `--height=${target.height}`,
      '--url=/?mock=1',
      `--out=scripts/${target.name}.png`,
      `--steps=${JSON.stringify(steps)}`,
    ], { stdio: 'inherit' });
    child.on('close', resolve);
  });
  console.log(target.name, 'exit', code);
}
