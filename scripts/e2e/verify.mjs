#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const scenarioName = arg('scenario');
if (!scenarioName) {
  console.log('FAIL');
  console.log('1. Укажи сценарий: --scenario=<имя>');
  process.exit(1);
}

const allowedArg = arg('allowed', '');
const allowedList = allowedArg
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const failures = [];

// 0. Гейт фундамента. Проверяем его первым: остальные проверки экрана ничего
// не стоят, если токены не сгенерированы и общие компоненты разошлись с DESIGN.md.
// Сценарий foundation сам себя не проверяет, иначе получится рекурсия.
const FOUNDATION_SCENARIO = 'foundation';
const foundationReportPath = path.join(
  ROOT,
  'scripts/e2e/reports',
  `${FOUNDATION_SCENARIO}.json`
);

const newestMtime = (target) => {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let max = stat.mtimeMs;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const m = newestMtime(path.join(target, entry.name));
    if (m > max) max = m;
  }
  return max;
};

if (scenarioName !== FOUNDATION_SCENARIO) {
  if (!fs.existsSync(foundationReportPath)) {
    failures.push(
      `Фундамент не проверен: нет отчёта ${foundationReportPath}. Сначала выполни: node scripts/e2e/capture.mjs --scenario=foundation`
    );
  } else {
    let foundationReport = null;
    try {
      foundationReport = JSON.parse(fs.readFileSync(foundationReportPath, 'utf8'));
    } catch (err) {
      failures.push(`Отчёт фундамента не читается: ${err.message}`);
    }

    if (foundationReport) {
      const failedAsserts = Array.isArray(foundationReport.failedAsserts)
        ? foundationReport.failedAsserts
        : [];
      const lintIssues = [];
      if (foundationReport.lint && typeof foundationReport.lint === 'object') {
        for (const [key, val] of Object.entries(foundationReport.lint)) {
          if (Array.isArray(val) && val.length > 0) {
            lintIssues.push(`${key} (${val.length} шт.)`);
          }
        }
      }

      if (
        foundationReport.ok !== true ||
        failedAsserts.length > 0 ||
        lintIssues.length > 0
      ) {
        const reasons = [];
        if (failedAsserts.length > 0) {
          reasons.push(`провалены ассерты: ${failedAsserts.join(', ')}`);
        }
        if (lintIssues.length > 0) {
          reasons.push(`lint не пуст: ${lintIssues.join('; ')}`);
        }
        if (reasons.length === 0) {
          reasons.push('в отчёте ok: false');
        }
        failures.push(
          `Фундамент не на месте — ${reasons.join('; ')}. Почини tailwind.config.js или компонент из src/components/common/ и пересобери.`
        );
      }

      const distBuiltMs = new Date(foundationReport.distBuiltAt).getTime();
      let newestSourceMs = 0;
      for (const candidate of ['src', 'tailwind.config.js', 'index.html']) {
        newestSourceMs = Math.max(newestSourceMs, newestMtime(path.join(ROOT, candidate)));
      }
      if (!Number.isFinite(distBuiltMs) || distBuiltMs < newestSourceMs) {
        failures.push(
          `Фундамент проверен на устаревшей сборке: distBuiltAt (${foundationReport.distBuiltAt}) старее ${new Date(
            newestSourceMs
          ).toISOString()}. Пересобери и повтори node scripts/e2e/capture.mjs --scenario=foundation`
        );
      }
    }
  }
}

// 1. Отчёт есть, ok: true, утверждений >= 1, lint пуст
const reportPath = path.join(ROOT, 'scripts/e2e/reports', `${scenarioName}.json`);
const scenarioPath = path.join(ROOT, 'scripts/e2e/scenarios', `${scenarioName}.mjs`);

if (!fs.existsSync(reportPath)) {
  failures.push(`Отчёт не найден: ${reportPath}`);
}

let report = null;
if (fs.existsSync(reportPath)) {
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (err) {
    failures.push(`Ошибка парсинга отчёта: ${err.message}`);
  }
}

let scenario = null;
if (fs.existsSync(scenarioPath)) {
  try {
    const mod = await import(pathToFileURL(scenarioPath).href);
    scenario = mod.default;
  } catch (err) {
    failures.push(`Ошибка загрузки сценария: ${err.message}`);
  }
} else {
  failures.push(`Сценарий не найден: ${scenarioPath}`);
}

if (report) {
  if (report.ok !== true) {
    failures.push(
      `Отчёт содержит ok: false (failedAsserts: ${JSON.stringify(report.failedAsserts)})`
    );
  }

  const assertsCount = Array.isArray(scenario?.asserts) ? scenario.asserts.length : 0;
  if (assertsCount < 1) {
    failures.push(`В сценарии утверждений < 1 (найдено: ${assertsCount})`);
  }

  if (!report.lint || typeof report.lint !== 'object') {
    failures.push('В отчёте отсутствует поле lint');
  } else {
    for (const [key, val] of Object.entries(report.lint)) {
      if (Array.isArray(val) && val.length > 0) {
        failures.push(
          `В lint.${key} обнаружены замечания (${val.length} шт.): ${val.slice(0, 2).join('; ')}`
        );
      }
    }
  }

  // 2. PNG из png существует, SHA-256 совпадает с отчётом, mtime позже distBuiltAt
  if (!report.png || !fs.existsSync(report.png)) {
    failures.push(`PNG-файл снимка не существует: ${report.png}`);
  } else {
    const fileBytes = fs.readFileSync(report.png);
    const hash = crypto.createHash('sha256').update(fileBytes).digest('hex');
    if (hash !== report.sha256) {
      failures.push(`SHA-256 не совпадает: в отчёте ${report.sha256}, у файла ${hash}`);
    }
    const pngMtime = fs.statSync(report.png).mtimeMs;
    const distBuiltMs = new Date(report.distBuiltAt).getTime();
    if (pngMtime < distBuiltMs) {
      failures.push(
        `mtime PNG (${new Date(pngMtime).toISOString()}) раньше distBuiltAt (${report.distBuiltAt})`
      );
    }
  }

  // 3. distBuiltAt не старее самого нового файла в src/
  const getNewestMtime = (dir) => {
    let max = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const m = getNewestMtime(full);
        if (m > max) max = m;
      } else {
        const m = fs.statSync(full).mtimeMs;
        if (m > max) max = m;
      }
    }
    return max;
  };

  const srcDir = path.join(ROOT, 'src');
  if (fs.existsSync(srcDir)) {
    const newestSrcMtime = getNewestMtime(srcDir);
    const distBuiltMs = new Date(report.distBuiltAt).getTime();
    if (distBuiltMs < newestSrcMtime) {
      failures.push(
        `distBuiltAt (${report.distBuiltAt}) старее самого нового файла в src/ (${new Date(
          newestSrcMtime
        ).toISOString()})`
      );
    }
  }
}

// 4. git diff --name-only и неотслеживаемые файлы ⊆ --allowed ∪ scripts/e2e/**
const changedFiles = new Set();
try {
  const diffOutput = execSync('git diff --name-only HEAD', { cwd: ROOT, encoding: 'utf8' });
  diffOutput
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((f) => changedFiles.add(f));
} catch {
  try {
    const diff1 = execSync('git diff --name-only', { cwd: ROOT, encoding: 'utf8' });
    diff1
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((f) => changedFiles.add(f));
    const diff2 = execSync('git diff --staged --name-only', { cwd: ROOT, encoding: 'utf8' });
    diff2
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((f) => changedFiles.add(f));
  } catch {}
}

try {
  const statusOutput = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
  statusOutput.split('\n').forEach((line) => {
    if (!line.trim()) return;
    const f = line.slice(3).trim();
    if (f) changedFiles.add(f);
  });
} catch {}

const isAllowed = (filePath) => {
  const norm = filePath.replace(/\\/g, '/');
  if (allowedList.includes(norm)) return true;
  if (norm.startsWith('scripts/e2e/')) return true;
  return false;
};

const disallowed = [];
for (const file of changedFiles) {
  if (!isAllowed(file)) {
    disallowed.push(file);
  }
}

if (disallowed.length > 0) {
  failures.push(
    `Изменённые/неотслеживаемые файлы не входят в --allowed или scripts/e2e/**: ${disallowed.join(
      ', '
    )}`
  );
}

// 5. В изменённых файлах src/ нет TODO, FIXME, console.log
const forbiddenRegex = /\b(TODO|FIXME)\b|console\.log/;
for (const file of changedFiles) {
  const norm = file.replace(/\\/g, '/');
  if (norm.startsWith('src/')) {
    const fullPath = path.join(ROOT, norm);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (forbiddenRegex.test(lines[i])) {
          failures.push(`Запрещённый паттерн в ${norm}:${i + 1}: ${lines[i].trim()}`);
        }
      }
    }
  }
}

if (failures.length === 0) {
  console.log('PASS');
  process.exit(0);
} else {
  console.log('FAIL');
  failures.forEach((f, idx) => console.log(`${idx + 1}. ${f}`));
  process.exit(1);
}
