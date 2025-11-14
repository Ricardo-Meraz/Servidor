const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({

  // ==========================
  // DATOS BÁSICOS
  // ==========================
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },

  // ============================================
  // CAMPOS DE SEGURIDAD (DEL PRIMER COMPAÑERO)
  // ============================================
  pin: { type: String, default: null },
  cuenta_bloqueada: { type: Boolean, default: false },
  fecha_bloqueo: { type: Date, default: null },
  intentos_fallidos: { type: Number, default: 0 },

  // ===================================================
  // RECUPERACIÓN, VERIFICACIÓN (DEL SEGUNDO COMPAÑERO)
  // ===================================================
  code: { type: String, default: null },
  expiracion: { type: Date, default: null },
  recovery_token: { type: String, default: null },
  recovery_exp: { type: Date, default: null },
  verified: { type: Boolean, default: false },

  // ROL
  rol: { type: String, default: "Cliente" }

}, { timestamps: true });

const Usuario = mongoose.model('Usuario', UsuarioSchema);
module.exports = Usuario;
