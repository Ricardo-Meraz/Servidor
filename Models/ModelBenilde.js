const mongoose = require("mongoose");

const ModelBenildeSchema = new mongoose.Schema({

  usuario: { type: String, required: true },   // ✔ AQUÍ SÍ VA USUARIO

  pin: { type: String, default: null },
  cuenta_bloqueada: { type: Boolean, default: false },
  fecha_bloqueo: { type: Date, default: null },
  intentos_fallidos: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("ModelBenilde", ModelBenildeSchema);
