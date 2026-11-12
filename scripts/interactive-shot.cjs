/**
 * Снятие интерактивных скриншотов листа через Chrome DevTools Protocol.
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
const clipArg = getArg('clip', null);
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
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
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
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      const text =
        msg.params?.exceptionDetails?.text ||
        msg.params?.exceptionDetails?.exception?.description ||
        'exception';
      consoleErrors.push(String(text).replace(/\s+/g, ' ').trim());
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
      const argsText = (msg.params.args || [])
        .map((a) => (typeof a.value === 'string' ? a.value : JSON.stringify(a.value)))
        .join(' ');
      consoleErrors.push(argsText.replace(/\s+/g, ' ').trim());
    }
    if (msg.method === 'Log.entryAdded' && msg.params?.entry?.level === 'error') {
      const text = msg.params.entry.text || '';
      consoleErrors.push(String(text).replace(/\s+/g, ' ').trim());
    }

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

  let hasError = false;

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await send('Page.navigate', { url: target });
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
          const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
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

    const capture = async (targetPath, clipValue, regions) => {
      let clipBox;
      if (clipValue) {
        if (typeof clipValue === 'string') {
          const [x, y, w, h] = clipValue.split(',').map(Number);
          clipBox = { x, y, width: w, height: h, scale: 1 };
        } else if (typeof clipValue === 'object') {
          clipBox = { scale: 1, ...clipValue };
        }
      } else {
        const metrics = await send('Page.getLayoutMetrics');
        const contentSize = metrics.cssContentSize || metrics.contentSize;
        clipBox = {
          x: 0,
          y: 0,
          width: Math.round(contentSize.width),
          height: Math.min(Math.round(contentSize.height), 6000),
          scale: 1,
        };
      }

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        ...(clipBox ? { clip: clipBox } : {}),
      });

      const file = path.resolve(process.cwd(), targetPath);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`[cdp] Saved: ${file} (${fs.statSync(file).size} bytes)`);

      if (regions && Array.isArray(regions)) {
        for (let i = 0; i < regions.length; i++) {
          const sel = regions[i];
          const rectRes = await send('Runtime.evaluate', {
            expression: `(() => {
              const el = document.querySelector(${JSON.stringify(sel)});
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
            })()`,
            returnByValue: true,
          });
          const r = rectRes?.result?.value;
          if (!r || r.width <= 0 || r.height <= 0) {
            console.log(`[cdp] region-missing: ${sel}`);
            continue;
          }
          const rClip = {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height),
            scale: 1,
          };
          const rShot = await send('Page.captureScreenshot', {
            format: 'png',
            captureBeyondViewport: true,
            clip: rClip,
          });
          const rFile = file.replace(/\.png$/, `-r${i}.png`);
          fs.writeFileSync(rFile, Buffer.from(rShot.data, 'base64'));
          console.log(`[cdp] Saved region ${sel}: ${rFile}`);
        }
      }
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
            throw new Error(`[cdp] waitFor timeout: ${step.waitFor}`);
          }
          console.log(`[cdp] waitFor ok: ${step.waitFor}`);
        }
        if (step.click) await clickByText(step.click);
        if (step.wait) await sleep(step.wait);
        if (step.shot) await capture(step.shot.out || out, step.shot.clip, step.shot.regions);
      }
    } else {
      if (clickText) await clickByText(clickText);
      await capture(out, clipArg, null);
    }

    console.log(
      `[cdp] console-errors: ${consoleErrors.length}${
        consoleErrors.length > 0 ? ' ' + consoleErrors.slice(0, 5).join(' | ') : ''
      }`
    );
  } catch (err) {
    hasError = true;
    console.error(err.message);
  } finally {
    try {
      ws.close();
    } catch {}
    chrome.kill();
    server.close();
    await sleep(200);
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 120 });
    } catch {}
    if (hasError) {
      process.exit(1);
    }
  }
});
