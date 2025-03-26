const mongoose = require('mongoose');

const DispositivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  fecha: { type: String },
  temperatura: { type: Number, default: 0 },
  humedad: { type: Number, default: 0 },
  luz: { type: Number, default: 0 },
  ventilador: { type: Number, default: 0 },
  bomba: { type: Number, default: 0 },
  foco: { type: Number, default: 0 },
  ip: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Dispositivo', DispositivoSchema);
