/**
 * Снятие интерактивных скриншотов листа через Chrome DevTools Protocol.
 * Обычный scripts/screenshot.cjs не умеет кликать по элементам, поэтому для
 * проверки тултипов и поповеров используется этот скрипт.
 *
 * Примеры:
 *   node scripts/interactive-shot.cjs --out=scripts/tooltip.png --click="ОЧКИ СУДЬБЫ"
 *   node scripts/interactive-shot.cjs --out=scripts/block.png --clip=700,100,680,230
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = path.resolve(
  '/home/deck/HarnessProjects/Budget/chrome-headless-shell/linux-156.0.8078.80/chrome-headless-shell-linux64/chrome-headless-shell'
);

const args = process.argv.slice(2);
function getArg(name, def = null) {
  const prefix = `--${name}=`;
  const hit = args.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  if (args.includes(`--${name}`)) return true;
  return def;
}

const width = Number(getArg('width', '1440'));
const height = Number(getArg('height', '1000'));
const urlPath = getArg('url', '/?mock=1&view=sheet');
const out = path.resolve(process.cwd(), getArg('out', 'scripts/interactive.png'));
const clickText = getArg('click', null);
const clip = getArg('clip', null);
const scroll = Number(getArg('scroll', '0'));
const settle = Number(getArg('wait', '600'));
const timeBudget = Number(getArg('load-wait', '2500'));
const evalExpr = getArg('eval', null);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};
const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || !path.extname(reqPath)) reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('not found');
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const target = `http://127.0.0.1:${port}${urlPath}`;
  // Уникальный профиль на запуск: параллельные снимки не мешают друг другу.
  const profile = path.join(distDir, `../.cdp-profile-${process.pid}`);
  const debugPort = 9300 + Math.floor(Math.random() * 500);

  const chrome = spawn(CHROME_PATH, [
    '--headless',
    '--no-sandbox',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    target,
  ]);

  const base = `http://127.0.0.1:${debugPort}`;
  let ready = false;
  for (let i = 0; i < 100 && !ready; i += 1) {
    try {
      const probe = await fetch(`${base}/json/version`);
      ready = probe.ok;
    } catch {
      await sleep(100);
    }
  }
  if (!ready) {
    console.error('[cdp] DevTools endpoint not reachable');
    chrome.kill();
    server.close();
    process.exit(1);
  }

  const targets = await (await fetch(`${base}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) {
    console.error('[cdp] No page target');
    chrome.kill();
    server.close();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await send('Page.navigate', { url: target });
    // Ждём загрузку шрифтов и данных мока; virtual-time-budget несовместим с CDP.
    await sleep(timeBudget + settle);

    if (evalExpr) {
      const evaluated = await send('Runtime.evaluate', {
        expression: String(evalExpr),
        returnByValue: true,
      });
      console.log('[cdp] eval:', JSON.stringify(evaluated.result.value));
    }

    if (scroll) {
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scroll})` });
      await sleep(300);
    }

    const clickByText = async (text) => {
      const clicked = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const norm = (s) => s.replace(/\\s+/g, ' ').trim().toLowerCase();
          const want = ${JSON.stringify(String(text).toLowerCase())};
          const buttons = [...document.querySelectorAll('button')];
          const el = buttons.find((b) => norm(b.textContent) === want)
            || buttons.find((b) => norm(b.textContent).includes(want));
          if (!el) return 'not-found';
          el.click();
          return 'clicked';
        })()`,
      });
      console.log(`[cdp] click "${text}": ${clicked.result.value}`);
      await sleep(settle);
    };

    const capture = async (targetPath, clipValue) => {
      let clipBox;
      if (clipValue) {
        const [x, y, w, h] = String(clipValue).split(',').map(Number);
        clipBox = { x, y, width: w, height: h, scale: 1 };
      }
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: Boolean(clipBox),
        ...(clipBox ? { clip: clipBox } : {}),
      });
      const file = path.resolve(process.cwd(), targetPath);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`[cdp] Saved: ${file} (${fs.statSync(file).size} bytes)`);
    };

    const stepsRaw = getArg('steps', null);
    if (stepsRaw) {
      const steps = JSON.parse(stepsRaw);
      for (const step of steps) {
        if (step.eval) {
          const evaluated = await send('Runtime.evaluate', {
            expression: String(step.eval),
            returnByValue: true,
          });
          if (evaluated.result.value === undefined && evaluated.exceptionDetails) {
            const detail =
              evaluated.exceptionDetails.exception?.description ||
              evaluated.exceptionDetails.text ||
              'unknown';
            console.log('[cdp] eval-error:', String(detail).replace(/\s+/g, ' ').slice(0, 300));
          } else {
            console.log('[cdp] eval:', JSON.stringify(evaluated.result.value));
          }
        }
        if (step.waitFor) {
          const deadline = Date.now() + (step.timeout || 8000);
          let ok = false;
          while (Date.now() < deadline) {
            const check = await send('Runtime.evaluate', {
              expression: String(step.waitFor),
              returnByValue: true,
            });
            if (check.result.value === true) {
              ok = true;
              break;
            }
            await sleep(100);
          }
          if (!ok) {
            console.error(`[cdp] waitFor timeout: ${step.waitFor}`);
            process.exit(1);
          }
          console.log(`[cdp] waitFor ok: ${step.waitFor}`);
        }
        if (step.click) await clickByText(step.click);
        if (step.wait) await sleep(step.wait);
        if (step.shot) await capture(step.shot.out, step.shot.clip);
      }
    } else {
      if (clickText) await clickByText(clickText);
      await capture(getArg('out', 'scripts/interactive.png'), clip);
    }
  } finally {
    try {
      ws.close();
    } catch {
      /* соединение уже закрыто */
    }
    chrome.kill();
    server.close();
    // Chrome отпускает файлы профиля не мгновенно, поэтому чистим с повторами.
    await sleep(200);
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 120 });
    } catch {
      /* профиль остался в каталоге сборки — не повод ронять прогон */
    }
  }
});
