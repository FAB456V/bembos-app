const axios = require('axios');
const Location = require('../models/Location');

const ORDER_STATUSES = ['En preparacion', 'En camino', 'Entregado'];

function roomFor(orderId) {
  return `order:${orderId}`;
}

function isFiniteCoordinate(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateDeliveryUpdate(payload = {}) {
  const { orderId, deliveryId, lat, lng, status } = payload;

  if (!orderId || !deliveryId) {
    return 'orderId y deliveryId son obligatorios';
  }

  if (!isFiniteCoordinate(lat) || lat < -90 || lat > 90) {
    return 'lat debe estar entre -90 y 90';
  }

  if (!isFiniteCoordinate(lng) || lng < -180 || lng > 180) {
    return 'lng debe estar entre -180 y 180';
  }

  if (status && !ORDER_STATUSES.includes(status)) {
    return `status debe ser uno de: ${ORDER_STATUSES.join(', ')}`;
  }

  return null;
}

async function verifyOrderAccess(orderId, token) {
  if (!process.env.ORDERS_SERVICE_URL) {
    throw new Error('ORDERS_SERVICE_URL is required');
  }

  await axios.get(`${process.env.ORDERS_SERVICE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function saveLocation({ orderId, deliveryId, lat, lng }) {
  return Location.create({
    orderId,
    deliveryId,
    coordenadas: { lat, lng },
  });
}

async function syncOrderStatus(orderId, status) {
  if (!status || !process.env.ORDERS_SERVICE_URL) {
    return;
  }

  await axios.put(
    `${process.env.ORDERS_SERVICE_URL}/orders/${orderId}/status`,
    { status },
    { headers: { 'X-Service-Key': process.env.SERVICE_API_KEY } }
  );
}

async function notifyStatusChange(orderId, status) {
  if (!status || !process.env.NOTIFICATION_SERVICE_URL) {
    return;
  }

  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/notify`,
      { orderId, tipo: 'order:status-update', mensaje: `Tu pedido ahora esta: ${status}` },
      { headers: { 'X-Service-Key': process.env.SERVICE_API_KEY } }
    );
  } catch (error) {
    console.error('Unable to notify status change:', error.message);
  }
}

async function processDeliveryUpdate(io, payload) {
  const validationError = validateDeliveryUpdate(payload);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const { orderId, deliveryId, lat, lng, status } = payload;
  const location = await saveLocation({ orderId, deliveryId, lat, lng });

  io.to(roomFor(orderId)).emit('location:update', {
    orderId,
    deliveryId,
    lat,
    lng,
    timestamp: location.timestamp,
  });

  if (status) {
    await syncOrderStatus(orderId, status);
    io.to(roomFor(orderId)).emit('order:status-update', { orderId, status });
    await notifyStatusChange(orderId, status);
  }

  return location;
}

async function getLatestLocation(req, res, next) {
  try {
    const token = req.headers.authorization.slice('Bearer '.length);
    await verifyOrderAccess(req.params.orderId, token);
    const location = await Location.findOne({ orderId: req.params.orderId }).sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({ message: 'Ubicacion no encontrada' });
    }

    return res.json({ location });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return next(error);
  }
}

module.exports = {
  getLatestLocation,
  processDeliveryUpdate,
  roomFor,
  validateDeliveryUpdate,
  verifyOrderAccess,
};
