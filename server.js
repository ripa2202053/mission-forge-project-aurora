const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 8080;
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mjs': 'text/javascript; charset=utf-8'
};

function requestHandler(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // 1. Internal Service Binding Proxy for Game Service
  if (GAME_SERVICE_URL && (reqPath.startsWith('/game') || reqPath.startsWith('/src/game/dist'))) {
    try {
      let targetPath = req.url;
      if (targetPath.startsWith('/game')) {
        targetPath = targetPath.replace(/^\/game\/?/, '/') || '/';
      } else if (targetPath.startsWith('/src/game/dist')) {
        targetPath = targetPath.replace(/^\/src\/game\/dist\/?/, '/') || '/';
      }

      const targetUrl = new URL(targetPath, GAME_SERVICE_URL);
      const client = targetUrl.protocol === 'https:' ? https : http;

      const proxyReq = client.request(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host
        }
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('Error proxying to GAME_SERVICE_URL:', err.message);
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('502 Bad Gateway: Game service unreachable');
      });

      req.pipe(proxyReq);
      return;
    } catch (err) {
      console.error('Proxy URL resolution error:', err.message);
    }
  }

  // 2. Static File Serving from Local File System
  const safePath = path.normalize(path.join(__dirname, reqPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
}

const server = http.createServer(requestHandler);

// Only bind to local port when running directly (node server.js)
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`MISSION FORGE server active on port ${PORT}`);
    if (GAME_SERVICE_URL) {
      console.log(`Bound GAME_SERVICE_URL: ${GAME_SERVICE_URL}`);
    }
  });
}

// Export the function handler for Vercel Node runtime & server instance for test suites
module.exports = requestHandler;
module.exports.default = requestHandler;
module.exports.server = server;

