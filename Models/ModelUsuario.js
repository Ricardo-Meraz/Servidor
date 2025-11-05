const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', UsuarioSchema);
module.exports = Usuario;
