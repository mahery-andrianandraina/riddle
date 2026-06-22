const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  // Normalize request path
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);

  // Check if file exists inside current directory (security check)
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileSize = stats.size;

    // Handle range requests for video/audio streaming (Chrome/Safari require 206 Partial Content)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate bounds
      if (start >= fileSize || end >= fileSize || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
        res.end();
        return;
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      fileStream.on('error', (streamErr) => {
        console.error('Stream Error:', streamErr);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end();
        }
      });

      fileStream.pipe(res);
    } else {
      // Standard full-file request
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Cache-Control': 'max-age=3600'
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (streamErr) => {
        console.error('Stream Error:', streamErr);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end();
        }
      });
      fileStream.pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎮 SERVEUR DE JEU DÉMARRÉ AVEC SUCCÈS !`);
  console.log(`👉 Jouez en local sur : http://localhost:${PORT}`);
  console.log(`=======================================================`);
  console.log(`(Appuyez sur Ctrl+C pour arrêter le serveur)`);
});
