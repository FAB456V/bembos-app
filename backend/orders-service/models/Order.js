const mongoose = require('mongoose');

const ORDER_STATUSES = ['En preparacion', 'En camino', 'Entregado'];

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    productos: {
      type: [productSchema],
      required: true,
      validate: {
        validator: (products) => products.length > 0,
        message: 'El pedido debe incluir al menos un producto',
      },
    },
    estado: { type: String, enum: ORDER_STATUSES, default: 'En preparacion' },
    total: { type: Number, required: true, min: 0 },
    direccionEntrega: { type: String, required: true, trim: true },
    deliveryId: { type: String, trim: true },
    tiempoEstimado: { type: Number, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
