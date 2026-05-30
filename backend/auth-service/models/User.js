const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    etiqueta: { type: String, trim: true },
    direccion: { type: String, required: true, trim: true },
    referencia: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    telefono: { type: String, trim: true },
    direcciones: { type: [addressSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    telefono: this.telefono,
    direcciones: this.direcciones,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
