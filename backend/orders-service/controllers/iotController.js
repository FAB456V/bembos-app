const Order = require('../models/Order');

const QR_PREFIX = 'BEMBOS_ORDER:';
const QR_TOKEN_PATTERN = /^[a-f0-9]{48}$/i;

function parseQrPayload(qrPayload) {
  if (typeof qrPayload !== 'string' || !qrPayload.startsWith(QR_PREFIX)) {
    return null;
  }

  const qrToken = qrPayload.slice(QR_PREFIX.length);
  return QR_TOKEN_PATTERN.test(qrToken) ? qrToken.toLowerCase() : null;
}

function toDeviceOrder(order) {
  return {
    id: order._id.toString(),
    numeroPedido: order._id.toString().slice(-6).toUpperCase(),
    estado: order.estado,
    productos: order.productos.map(({ productId, nombre, cantidad }) => ({
      productId,
      nombre,
      cantidad,
    })),
    total: order.total,
    direccionEntrega: order.direccionEntrega,
    createdAt: order.createdAt,
  };
}

async function scanOrder(req, res, next) {
  try {
    const qrToken = parseQrPayload(req.body?.qrPayload);

    if (!qrToken) {
      return res.status(400).json({ message: 'Codigo QR invalido' });
    }

    const order = await Order.findOne({ qrToken });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado para este QR' });
    }

    return res.json({ order: toDeviceOrder(order) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { parseQrPayload, scanOrder, toDeviceOrder };
