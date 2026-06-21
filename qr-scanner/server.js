const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const indexPath = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  if (req.url !== '/' && req.url !== '/index.html') {
    res.writeHead(404).end('Not found');
    return;
  }

  fs.readFile(indexPath, (error, data) => {
    if (error) {
      res.writeHead(500).end('Unable to load scanner');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Escaner QR disponible en http://localhost:${port}`);
});
