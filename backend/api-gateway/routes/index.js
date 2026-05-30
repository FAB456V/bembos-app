const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function createHttpProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error(error, _req, res) {
        console.error(`Proxy error for ${target}:`, error.message);

        if (!res.headersSent) {
          res.status(502).json({ message: 'Servicio temporalmente no disponible' });
        }
      },
    },
  });
}

function createRoutes() {
  const router = express.Router();
  const authServiceUrl = requireEnv('AUTH_SERVICE_URL');
  const ordersServiceUrl = requireEnv('ORDERS_SERVICE_URL');
  const trackingServiceUrl = requireEnv('TRACKING_SERVICE_URL');

  router.use('/auth', createHttpProxy(authServiceUrl, { '^/auth': '' }));
  router.use('/orders', createHttpProxy(ordersServiceUrl, (path) => `/orders${path}`));
  router.use('/tracking', createHttpProxy(trackingServiceUrl, (path) => `/tracking${path}`));

  return router;
}

function createSocketProxy() {
  return createProxyMiddleware({
    target: requireEnv('TRACKING_SERVICE_URL'),
    changeOrigin: true,
    ws: true,
    on: {
      error(error) {
        console.error('Socket proxy error:', error.message);
      },
    },
  });
}

module.exports = { createRoutes, createSocketProxy };
