const mongoose = require("mongoose");

const UsuarioPinSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    contraseña: {
      type: String,
      required: true,
    },

    // PIN encriptado
    pin: { type: String, default: null },

    // Intentos fallidos
    lockAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Recuperación de contraseña
    resetCode: { type: String, default: null },
    resetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsuarioPin", UsuarioPinSchema);
