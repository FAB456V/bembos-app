const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    deliveryId: { type: String, required: true, trim: true },
    coordenadas: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: Number(process.env.LOCATION_TTL_SECONDS) || 604800 });
locationSchema.index({ orderId: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);
