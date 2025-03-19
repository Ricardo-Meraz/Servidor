const mongoose = require('mongoose');

const DispositivoSchema = new mongoose.Schema({
  mac: { type: String, required: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  fecha: { type: String, required: true }, // Puedes cambiar a Date si lo prefieres
  automatico: { type: Number, default: 0 },
  temperatura: { type: Number, default: 0 },
  humedad: { type: Number, default: 0 },
  luz: { type: Number, default: 0 },
  ventilador: { type: Number, default: 0 },
  bomba: { type: Number, default: 0 },
  foco: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Dispositivo', DispositivoSchema);
