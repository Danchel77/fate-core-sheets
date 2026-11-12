#!/usr/bin/env node
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPORTS_DIR = path.join(ROOT, 'scripts/e2e/reports');
const SHOTS_DIR = path.join(ROOT, 'scripts/e2e/shots');

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const scenarioName = arg('scenario', '');
if (!scenarioName) {
  console.error('Укажи сценарий: --scenario=<имя>');
  process.exit(1);
}

const scenarioPath = path.join(ROOT, 'scripts/e2e/scenarios', `${scenarioName}.mjs`);
if (!fs.existsSync(scenarioPath)) {
  console.error(`Сценарий не найден: ${scenarioPath}`);
  process.exit(1);
}

// 1. Проверка свежести dist
const distIndex = path.join(ROOT, 'dist/index.html');
if (!fs.existsSync(distIndex)) {
  console.error('dist устарел, запусти npm run build');
  process.exit(3);
}

const getNewestMtime = (dirOrFile) => {
  const stat = fs.statSync(dirOrFile);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let max = stat.mtimeMs;
  for (const entry of fs.readdirSync(dirOrFile, { withFileTypes: true })) {
    const full = path.join(dirOrFile, entry.name);
    const m = getNewestMtime(full);
    if (m > max) max = m;
  }
  return max;
};

const distMtime = fs.statSync(distIndex).mtimeMs;
let newestSourceMtime = 0;

const checkCandidates = ['src', 'index.html'];
for (const file of fs.readdirSync(ROOT)) {
  if (file.startsWith('tailwind.config.') || file.startsWith('vite.config.')) {
    checkCandidates.push(file);
  }
}

for (const candidate of checkCandidates) {
  const p = path.join(ROOT, candidate);
  if (fs.existsSync(p)) {
    const m = getNewestMtime(p);
    if (m > newestSourceMtime) newestSourceMtime = m;
  }
}

if (distMtime < newestSourceMtime) {
  console.error('dist устарел, запусти npm run build');
  process.exit(3);
}

const scenarioModule = await import(pathToFileURL(scenarioPath).href);
const scenario = scenarioModule.default;
const width = arg('width', '1440');
const height = arg('height', '1100');
const url = arg('url', scenario.url || '/?mock=1');
const regionsArg = arg('regions', scenario.regions ? (Array.isArray(scenario.regions) ? scenario.regions.join(',') : scenario.regions) : '');
const regions = regionsArg.split(',').filter(Boolean);
const totalTimeout = Number(arg('total-timeout', '150000'));

// 2. Уникальный путь снимка
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const baseShotName = `${scenarioName}-${width}-${dateStr}`;
const out = path.join(SHOTS_DIR, `${baseShotName}.png`);

import { LINT_SRC } from './lib/lint-src.mjs';

const assertions = Array.isArray(scenario.asserts) ? scenario.asserts : [];
const assertsExpression = `[${assertions
  .map((item) => `{name:${JSON.stringify(item.name)},ok:!!(${item.expr})}`)
  .join(',')}]`;

const steps = [...scenario.steps];
let shotCount = 0;
const totalShots = steps.filter((s) => s.shot).length;

for (const step of steps) {
  if (step.shot) {
    const stepOut =
      totalShots === 1 || shotCount === totalShots - 1
        ? out
        : path.join(SHOTS_DIR, `${baseShotName}-part${shotCount}.png`);
    step.shot = { ...step.shot, out: stepOut };
    if (regions.length > 0) step.shot.regions = regions;
    shotCount++;
  }
}

steps.push({ eval: LINT_SRC });
steps.push({ eval: assertsExpression });

fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(SHOTS_DIR, { recursive: true });
const reportPath = path.join(REPORTS_DIR, `${scenarioName}.json`);
const startedAt = Date.now();

const child = spawn(
  process.execPath,
  [
    path.join(ROOT, 'scripts/interactive-shot.cjs'),
    `--width=${width}`,
    `--height=${height}`,
    `--url=${url}`,
    `--out=${out}`,
    `--steps=${JSON.stringify(steps)}`,
  ],
  { cwd: ROOT }
);

let stdout = '';
child.stdout.on('data', (chunk) => {
  stdout += chunk;
  process.stdout.write(chunk);
});
child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

const killer = setTimeout(() => {
  child.kill('SIGKILL');
  process.exit(2);
}, totalTimeout);

child.on('close', (code) => {
  clearTimeout(killer);

  const lines = stdout.split('\n');
  const consoleErrorsLine = lines.find((l) => l.startsWith('[cdp] console-errors:'));
  const consoleErrors = consoleErrorsLine
    ? Number(consoleErrorsLine.split(':')[1].trim().split(/\s+/)[0])
    : 0;

  const evalLines = lines
    .filter((line) => line.startsWith('[cdp] eval: '))
    .map((line) => line.slice(12));

  let lint = null;
  let parsedAsserts = null;

  for (let i = evalLines.length - 1; i >= 0; i -= 1) {
    try {
      const val = JSON.parse(evalLines[i]);
      if (val && typeof val === 'object' && 'clippedText' in val && !lint) {
        lint = val;
      } else if (Array.isArray(val) && !parsedAsserts) {
        parsedAsserts = val;
      }
    } catch {}
  }

  const failedAsserts = parsedAsserts
    ? parsedAsserts.filter((a) => !a.ok).map((a) => a.name)
    : [];

  const screenshotExists = fs.existsSync(out);
  const screenshotMtime = screenshotExists ? fs.statSync(out).mtimeMs : 0;
  const screenshotOk = screenshotExists && screenshotMtime >= startedAt - 500;

  const sha256 = screenshotExists
    ? crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex')
    : null;

  const regionPngs = fs
    .readdirSync(SHOTS_DIR)
    .filter((f) => f.startsWith(`${baseShotName}-r`) && f.endsWith('.png'))
    .map((f) => path.join(SHOTS_DIR, f));

  const hasLintErrors =
    !lint || Object.values(lint).some((arr) => Array.isArray(arr) && arr.length > 0);

  const ok =
    code === 0 &&
    !hasLintErrors &&
    consoleErrors === 0 &&
    failedAsserts.length === 0 &&
    screenshotOk;

  const report = {
    scenario: scenarioName,
    png: out,
    regionPngs,
    sha256,
    viewport: {
      width: Number(width),
      height: Number(height),
    },
    capturedAt: new Date().toISOString(),
    distBuiltAt: new Date(distMtime).toISOString(),
    consoleErrors,
    asserts: parsedAsserts || [],
    failedAsserts,
    lint,
    ok,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Хранить не больше 20 снимков на сценарий, старые удалять вместе с кропами
  const allShots = fs
    .readdirSync(SHOTS_DIR)
    .filter((f) => f.startsWith(`${scenarioName}-${width}-`) && !f.includes('-r'))
    .sort((a, b) => b.localeCompare(a));

  for (const oldShot of allShots.slice(20)) {
    const baseOld = oldShot.replace(/\.png$/, '');
    try {
      fs.unlinkSync(path.join(SHOTS_DIR, oldShot));
    } catch {}
    for (const crop of fs.readdirSync(SHOTS_DIR)) {
      if (crop.startsWith(`${baseOld}-r`) && crop.endsWith('.png')) {
        try {
          fs.unlinkSync(path.join(SHOTS_DIR, crop));
        } catch {}
      }
    }
  }

  if (!ok) process.exit(1);
  process.exit(0);
});
