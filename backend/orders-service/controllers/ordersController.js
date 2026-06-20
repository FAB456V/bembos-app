const mongoose = require('mongoose');
const Order = require('../models/Order');
const { ORDER_STATUSES } = require('../models/Order');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildQrPayload(qrToken) {
  return 'BEMBOS_ORDER:' + qrToken;
}

function orderResponse(order) {
  const data = order.toObject();
  const qrToken = data.qrToken;
  delete data.qrToken;

  return { ...data, qrPayload: buildQrPayload(qrToken) };
}

async function createOrder(req, res, next) {
  try {
    const { productos, direccionEntrega, deliveryId, tiempoEstimado } = req.body || {};

    if (!Array.isArray(productos) || productos.length === 0 || !direccionEntrega) {
      return res.status(400).json({
        message: 'productos y direccionEntrega son obligatorios',
      });
    }

    const validProducts = productos.every(
      ({ productId, nombre, cantidad, precioUnitario }) =>
        productId &&
        nombre &&
        Number.isInteger(cantidad) &&
        cantidad > 0 &&
        Number.isFinite(precioUnitario) &&
        precioUnitario >= 0
    );

    if (!validProducts) {
      return res.status(400).json({ message: 'Los productos no son validos' });
    }

    const total = productos.reduce(
      (sum, product) => sum + product.cantidad * product.precioUnitario,
      0
    );

    const order = await Order.create({
      userId: req.auth.userId,
      productos,
      total,
      direccionEntrega,
      deliveryId,
      tiempoEstimado,
    });

    const orderWithQr = await Order.findById(order._id).select('+qrToken');
    return res.status(201).json({ order: orderResponse(orderWithQr) });
  } catch (error) {
    return next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Id de pedido invalido' });
    }

    const order = await Order.findById(req.params.id).select('+qrToken');

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (order.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'No autorizado para ver este pedido' });
    }

    return res.json({ order: orderResponse(order) });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, estado } = req.body || {};
    const nextStatus = status || estado;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Id de pedido invalido' });
    }

    if (!ORDER_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: `estado debe ser uno de: ${ORDER_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { estado: nextStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    if (req.params.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'No autorizado para ver este historial' });
    }

    const orders = await Order.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createOrder, getHistory, getOrder, updateStatus };
