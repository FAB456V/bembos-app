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
    modalidad: order.modalidad || 'Recojo en tienda',
    tiendaRecojo: order.tiendaRecojo || order.direccionEntrega || 'Tienda no disponible',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
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

    if (order.estado === 'Entregado') {
      return res.status(409).json({ message: 'El pedido ya fue recogido' });
    }

    if (order.estado !== 'Listo para recoger') {
      return res.status(425).json({ message: 'El pedido aun no esta listo para recoger' });
    }

    return res.json({ order: toDeviceOrder(order) });
  } catch (error) {
    return next(error);
  }
}

async function confirmPickup(req, res, next) {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, estado: 'Listo para recoger' },
      { estado: 'Entregado' },
      { new: true, runValidators: true }
    );

    if (order) {
      return res.json({ message: 'Recojo confirmado', order: toDeviceOrder(order) });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (existingOrder.estado === 'Entregado') {
      return res.status(409).json({ message: 'El pedido ya fue recogido' });
    }
    return res.status(425).json({ message: 'El pedido aun no esta listo para recoger' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Id de pedido invalido' });
    return next(error);
  }
}

module.exports = { confirmPickup, parseQrPayload, scanOrder, toDeviceOrder };
