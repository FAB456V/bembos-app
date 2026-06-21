const axios = require('axios');
const Order = require('../models/Order');
const { parseQrPayload, toDeviceOrder } = require('./iotController');
const { dequeueScan, enqueueScan } = require('../services/scanQueue');

async function submitScan(req, res, next) {
  try {
    const token = parseQrPayload(req.body?.qrPayload);
    if (!token) return res.status(400).json({ message: 'Codigo QR invalido' });

    const order = await Order.findOne({ qrToken: token });
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado para este QR' });
    if (order.estado === 'Entregado') return res.status(409).json({ message: 'El pedido ya fue entregado' });
    if (order.estado !== 'Listo para recoger') {
      return res.status(425).json({ message: 'El pedido aun no esta listo para recoger' });
    }

    const pending = enqueueScan(`BEMBOS_ORDER:${token}`);
    return res.status(202).json({
      message: 'QR enviado al kiosco',
      pending,
      order: toDeviceOrder(order),
    });
  } catch (error) {
    return next(error);
  }
}

function nextScan(_req, res) {
  const qrPayload = dequeueScan();
  if (!qrPayload) return res.status(204).send();
  return res.json({ qrPayload });
}

async function getDashboard(_req, res, next) {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100);
    const deviceOrders = orders.map(toDeviceOrder);
    const pending = deviceOrders.filter((order) => order.estado !== 'Entregado');
    const delivered = deviceOrders.filter((order) => order.estado === 'Entregado');

    return res.json({
      summary: { pending: pending.length, delivered: delivered.length, total: deviceOrders.length },
      pending,
      delivered,
    });
  } catch (error) {
    return next(error);
  }
}

async function notifyReadyOrder(order) {
  if (!order.expoPushToken) {
    return { sent: false, reason: 'missing_push_token' };
  }
  if (!process.env.NOTIFICATION_SERVICE_URL) {
    return { sent: false, reason: 'missing_notification_service_url' };
  }

  try {
    const number = order._id.toString().slice(-6).toUpperCase();
    const response = await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/notify`,
      {
        userId: order.userId,
        orderId: order._id.toString(),
        tipo: 'order:ready-for-pickup',
        mensaje: `Tu pedido #${number} esta listo para recogerlo en ${order.tiendaRecojo || 'Bembos'}.`,
        expoPushToken: order.expoPushToken,
      },
      { headers: { 'X-Service-Key': process.env.SERVICE_API_KEY } }
    );
    return response.data.push;
  } catch (error) {
    console.error('Unable to send ready notification:', error.message);
    return { sent: false, reason: 'notification_service_error' };
  }
}

async function markReady(req, res, next) {
  try {
    const updatedQuery = Order.findOneAndUpdate(
      { _id: req.params.id, estado: 'En preparacion' },
      { estado: 'Listo para recoger' },
      { new: true, runValidators: true }
    );
    const order = await updatedQuery.select('+expoPushToken');

    if (order) {
      const notification = await notifyReadyOrder(order);
      return res.json({
        message: 'Pedido listo para recoger',
        order: toDeviceOrder(order),
        notification,
      });
    }

    const existingOrder = await Order.findById(req.params.id).select('+expoPushToken');
    if (!existingOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (existingOrder.estado === 'Entregado') {
      return res.status(409).json({ message: 'El pedido ya fue entregado' });
    }
    if (existingOrder.estado === 'Listo para recoger') {
      return res.json({
        message: 'El pedido ya estaba listo para recoger',
        order: toDeviceOrder(existingOrder),
        notification: { sent: false, reason: 'already_ready' },
      });
    }
    return res.status(409).json({ message: `No se puede preparar un pedido en estado ${existingOrder.estado}` });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Id de pedido invalido' });
    return next(error);
  }
}

module.exports = { getDashboard, markReady, nextScan, notifyReadyOrder, submitScan };
