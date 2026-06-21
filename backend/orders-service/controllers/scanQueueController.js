const Order = require('../models/Order');
const { parseQrPayload, toDeviceOrder } = require('./iotController');
const { dequeueScan, enqueueScan } = require('../services/scanQueue');

async function submitScan(req, res, next) {
  try {
    const token = parseQrPayload(req.body?.qrPayload);

    if (!token) {
      return res.status(400).json({ message: 'Codigo QR invalido' });
    }

    const order = await Order.findOne({ qrToken: token });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado para este QR' });
    }

    if (order.estado === 'Entregado') {
      return res.status(409).json({ message: 'El pedido ya fue entregado' });
    }

    if (order.estado !== 'Listo para recoger') {
      return res.status(425).json({ message: 'El pedido aun no esta listo para recoger' });
    }

    const qrPayload = `BEMBOS_ORDER:${token}`;
    const pending = enqueueScan(qrPayload);

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

  if (!qrPayload) {
    return res.status(204).send();
  }

  return res.json({ qrPayload });
}

async function getDashboard(_req, res, next) {
  try {
    const orders = await Order.find({ modalidad: 'Recojo en tienda' })
      .sort({ createdAt: -1 })
      .limit(100);

    const deviceOrders = orders.map(toDeviceOrder);
    const pending = deviceOrders.filter((order) => order.estado !== 'Entregado');
    const delivered = deviceOrders.filter((order) => order.estado === 'Entregado');

    return res.json({
      summary: {
        pending: pending.length,
        delivered: delivered.length,
        total: deviceOrders.length,
      },
      pending,
      delivered,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboard, nextScan, submitScan };
