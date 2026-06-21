const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const routes = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/scanner': 'scanner.html',
  '/scanner.html': 'scanner.html',
  '/dashboard': 'dashboard.html',
  '/dashboard.html': 'dashboard.html',
  '/styles.css': 'styles.css',
};

http.createServer((req, res) => {
  const file = routes[new URL(req.url, 'http://localhost').pathname];
  if (!file) return res.writeHead(404).end('Not found');

  fs.readFile(path.join(__dirname, file), (error, data) => {
    if (error) return res.writeHead(500).end('Unable to load page');
    const contentType = file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Kiosco Bembos disponible en http://localhost:${port}`);
});
