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
  const hit = args.find(a => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  if (args.includes(`--${name}`)) return true;
  return def;
}

const view = getArg('view', 'dashboard');
const windowSize = getArg('window-size', '1440,900');
const outPath = path.resolve(process.cwd(), getArg('out', `scripts/preview-${view}.png`));
const timeBudget = getArg('virtual-time-budget', '2000');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || !path.extname(reqPath)) {
    reqPath = '/index.html';
  }
  
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(__dirname, '..', '.' + req.url.split('?')[0]);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  const targetUrl = `http://127.0.0.1:${port}/?mock=1&view=${view}`;

  console.log(`[Screenshot] Target URL: ${targetUrl}`);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless',
    '--no-sandbox',
    '--hide-scrollbars',
    `--virtual-time-budget=${timeBudget}`,
    `--window-size=${windowSize}`,
    `--screenshot=${outPath}`,
    targetUrl,
  ]);

  chromeProc.stderr.on('data', d => {
    const s = d.toString();
    if (s.includes('CONSOLE') || s.includes('Error')) {
      process.stderr.write(s);
    }
  });

  chromeProc.on('close', code => {
    server.close();
    if (code === 0 && fs.existsSync(outPath)) {
      console.log(`[Screenshot] Saved: ${outPath} (${fs.statSync(outPath).size} bytes)`);
      process.exit(0);
    } else {
      console.error(`[Screenshot] Failed with exit code ${code}`);
      process.exit(1);
    }
  });
});
