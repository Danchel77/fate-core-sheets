import { spawn } from 'node:child_process';
const scenarioName = process.argv[2] || 'wizard-skills';
const mod = await import(`./e2e/scenarios/${scenarioName}.mjs`);
const steps = [...mod.default.steps, { eval: 'document.title' }];
const child = spawn(process.execPath, [
  'scripts/interactive-shot.cjs', '--width=1440', '--height=1100', '--url=/?mock=1',
  '--out=scripts/.dbg.png', `--steps=${JSON.stringify(steps)}`,
], { stdio: 'inherit' });
child.on('close', (c) => console.log('exit', c));
