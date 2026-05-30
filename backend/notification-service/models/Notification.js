const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true, index: true },
    orderId: { type: String, required: true, trim: true, index: true },
    tipo: { type: String, required: true, trim: true },
    mensaje: { type: String, required: true, trim: true },
    leida: { type: Boolean, default: false },
    enviadaAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Notification', notificationSchema);
