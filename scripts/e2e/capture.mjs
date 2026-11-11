#!/usr/bin/env node
/**
 * E2E-обвязка: запускает сценарий через проверенный `scripts/interactive-shot.cjs`
 * и превращает его в отчёт с утверждениями.
 *
 * Своего кода для CDP здесь нет намеренно: браузер, сервер над `dist` и шаги
 * (`click`, `waitFor`, `shot`, `eval`) уже умеет interactive-shot. Обвязка
 * добавляет только разбор результата, коды выхода и JSON-отчёт.
 *
 * Коды выхода: 0 — все утверждения верны, 1 — провал сценария или утверждения,
 * 2 — общий таймаут прогона.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPORTS_DIR = path.join(ROOT, 'scripts/e2e/reports');

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

const scenario = (await import(pathToFileURL(scenarioPath).href)).default;
const width = arg('width', '1440');
const height = arg('height', '1100');
const url = arg('url', '/?mock=1');
const out = arg('out', `scripts/e2e/shots/${scenarioName}.png`);
const totalTimeout = Number(arg('total-timeout', '150000'));

const assertions = Array.isArray(scenario.asserts) ? scenario.asserts : [];
const assertsExpression = `JSON.stringify([${assertions
  .map((item) => `{name:${JSON.stringify(item.name)},ok:!!(${item.expr})}`)
  .join(',')}])`;

const steps = [...scenario.steps, { wait: 300 }, { eval: assertsExpression }];

fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(path.resolve(ROOT, out)), { recursive: true });
const reportPath = path.join(REPORTS_DIR, `${scenarioName}.json`);
const startedAt = Date.now();

const writeReport = (payload) => {
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ scenario: scenarioName, elapsedMs: Date.now() - startedAt, ...payload }, null, 2)
  );
};

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
let stderr = '';
child.stdout.on('data', (chunk) => {
  stdout += chunk.toString();
});
child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

const killer = setTimeout(() => {
  child.kill('SIGKILL');
  writeReport({ ok: false, reason: 'total-timeout', assertions: [] });
  console.error(`Прогон дольше ${totalTimeout} мс — прерван.`);
  process.exit(2);
}, totalTimeout);

child.on('close', (code) => {
  clearTimeout(killer);

  if (code !== 0) {
    writeReport({ ok: false, reason: 'process-failed', exitCode: code, assertions: [] });
    console.error(stdout.trim());
    console.error(stderr.trim());
    process.exit(1);
  }

  const evalLines = stdout
    .split('\n')
    .map((line) => line.match(/^\[cdp\] eval: (.*)$/))
    .filter(Boolean)
    .map((match) => match[1]);

  let parsed = null;
  for (let index = evalLines.length - 1; index >= 0; index -= 1) {
    try {
      let value = JSON.parse(evalLines[index]);
      // interactive-shot печатает значение через JSON.stringify, поэтому массив
      // утверждений приходит закодированной строкой — распаковываем второй раз.
      if (typeof value === 'string') value = JSON.parse(value);
      if (Array.isArray(value)) {
        parsed = value;
        break;
      }
    } catch {
      /* строка не JSON — значит это вывод обычного eval-шага, идём дальше */
    }
  }

  if (!parsed) {
    writeReport({ ok: false, reason: 'no-assertions', assertions: [] });
    console.error('Не нашёл в выводе массив утверждений. Вывод:\n' + stdout.trim());
    process.exit(1);
  }

  const failed = parsed.find((item) => !item.ok);
  writeReport({
    ok: !failed,
    assertions: parsed,
    ...(failed ? { failedAssert: failed.name } : {}),
  });

  if (failed) {
    console.error(`Провалено утверждение: ${failed.name}`);
    process.exit(1);
  }
  process.exit(0);
});
