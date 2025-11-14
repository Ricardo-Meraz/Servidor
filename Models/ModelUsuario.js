const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  // ==========================
  // DATOS BÁSICOS (LOS TUYOS)
  // ==========================
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },

  // ============================================
  // CAMPOS DE SEGURIDAD (DEL PRIMER COMPAÑERO)
  // ============================================
  pin: { type: String, default: null },               // PIN opcional
  cuenta_bloqueada: { type: Boolean, default: false }, // Bloqueo por intentos
  fecha_bloqueo: { type: Date, default: null },       // Fecha del bloqueo
  intentos_fallidos: { type: Number, default: 0 },    // Intentos de login fallidos

  // ===================================================
  // RECUPERACIÓN, VERIFICACIÓN (DEL SEGUNDO COMPAÑERO)
  // ===================================================
  code: { type: String, default: null },              // Código enviado por email/SMS
  expiracion: { type: Date, default: null },          // Expiración del código
  recovery_token: { type: String, default: null },    // Token de recuperación
  recovery_exp: { type: Date, default: null },        // Fecha de expiración del token
  verified: { type: Boolean, default: false },        // Verificación de correo

  // ===================================================
  // PREGUNTA DE RECUPERACIÓN (TU SISTEMA ACTUAL)
  // ===================================================
  pregunta_recuperacion: {
    type: {
      pre_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PreguntasSecretas' },
      respuesta: { type: String }
    },
    default: null
    // Si no usas pregunta secreta, simplemente se queda en null
  },

  // ROL POR DEFAULT
  rol: {
    type: String,
    default: "Cliente"
  }

}, { timestamps: true });

const Usuario = mongoose.model('Usuario', UsuarioSchema);
module.exports = Usuario;
