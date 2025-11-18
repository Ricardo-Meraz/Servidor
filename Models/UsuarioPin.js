const mongoose = require("mongoose");

const UsuarioPinSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },

    contraseña: {
      type: String,
      required: true,
    },

    // --- PIN ---
    pin: { type: String, default: null },  // PIN cifrado

    // --- BLOQUEO GENERAL (PIN + contraseña) ---
    lockAttempts: { type: Number, default: 0 },  // Intentos fallidos totales
    lockUntil: { type: Date, default: null },    // Bloqueado por 5 minutos
    

  },
  { timestamps: true }
);

module.exports = mongoose.model("UsuarioPin", UsuarioPinSchema);

