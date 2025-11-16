const mongoose = require("mongoose");

const UsuarioBaseSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  contraseña: { type: String, required: true },

  // Campos para recuperación
  tokenRecuperacion: { type: String },
  expiraToken: { type: Date }
  
}, { timestamps: true });

module.exports = mongoose.model("UsuarioBase", UsuarioBaseSchema);
