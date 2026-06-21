const crypto = require('crypto');
const mongoose = require('mongoose');

const ORDER_STATUSES = ['En preparacion', 'Listo para recoger', 'Entregado'];
const STORED_ORDER_STATUSES = [...ORDER_STATUSES, 'En camino'];

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
    modalidad: { type: String, default: 'Recojo en tienda', trim: true },
    tiendaRecojo: { type: String, trim: true },
    estado: { type: String, enum: STORED_ORDER_STATUSES, default: 'En preparacion' },
    total: { type: Number, required: true, min: 0 },
    direccionEntrega: { type: String, trim: true },
    qrToken: {
      type: String,
      default: () => crypto.randomBytes(24).toString('hex'),
      immutable: true,
      select: false,
      sparse: true,
      unique: true,
    },
    deliveryId: { type: String, trim: true },
    tiempoEstimado: { type: Number, min: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
