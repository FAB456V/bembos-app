require('dotenv').config();

const cors = require('cors');
const express = require('express');
const http = require('http');
const { createRoutes, createSocketProxy } = require('./routes');

function createServer() {
  const app = express();
  const server = http.createServer(app);
  const socketProxy = createSocketProxy();

  app.use(cors());

  app.get('/health', (_req, res) => {
    res.json({ service: 'api-gateway', status: 'ok' });
  });

  app.use('/socket.io', (req, _res, next) => {
    req.url = '/socket.io' + req.url;
    next();
  }, socketProxy);
  app.use('/', createRoutes());

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });

  server.on('upgrade', socketProxy.upgrade);

  return { app, server };
}

function start() {
  const port = process.env.PORT || 3000;
  const { server } = createServer();

  server.listen(port, () => {
    console.log(`api-gateway listening on port ${port}`);
  });
}

if (require.main === module) {
  try {
    start();
  } catch (error) {
    console.error('Unable to start api-gateway:', error);
    process.exit(1);
  }
}

module.exports = { createServer, start };
