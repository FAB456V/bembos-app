require('dotenv').config();

const cors = require('cors');
const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const {
  processDeliveryUpdate,
  roomFor,
  verifyOrderAccess,
} = require('./controllers/trackingController');
const trackingRoutes = require('./routes/trackingRoutes');

function createServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ service: 'tracking-service', status: 'ok' });
  });

  app.use('/tracking', trackingRoutes);

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno del servidor' });
  });

  io.use((socket, next) => {
    const { token, serviceKey } = socket.handshake.auth || {};

    if (serviceKey && serviceKey === process.env.SERVICE_API_KEY) {
      socket.data.role = 'delivery';
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.role = 'customer';
      socket.data.userId = payload.sub;
      socket.data.token = token;
      return next();
    } catch (_error) {
      return next(new Error('No autorizado'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('order:subscribe', async ({ orderId } = {}, acknowledge = () => {}) => {
      if (!orderId) {
        return acknowledge({ ok: false, message: 'orderId es obligatorio' });
      }

      try {
        await verifyOrderAccess(orderId, socket.data.token);
        socket.join(roomFor(orderId));
        return acknowledge({ ok: true });
      } catch (error) {
        return acknowledge({ ok: false, message: 'No autorizado para seguir este pedido' });
      }
    });

    socket.on('delivery:update', async (payload, acknowledge = () => {}) => {
      if (socket.data.role !== 'delivery') {
        return acknowledge({ ok: false, message: 'Solo delivery puede publicar ubicaciones' });
      }

      try {
        await processDeliveryUpdate(io, payload);
        return acknowledge({ ok: true });
      } catch (error) {
        console.error('Unable to process delivery update:', error.message);
        return acknowledge({ ok: false, message: error.message });
      }
    });
  });

  return { app, io, server };
}

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  if (!process.env.SERVICE_API_KEY) {
    throw new Error('SERVICE_API_KEY is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const port = process.env.PORT || 3003;
  const { server } = createServer();
  server.listen(port, () => {
    console.log(`tracking-service listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Unable to start tracking-service:', error);
    process.exit(1);
  });
}

module.exports = { createServer, start };
