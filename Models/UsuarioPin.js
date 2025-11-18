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

    // ---- PIN real que Mongo está usando ----
    pin: { type: String, default: null }, // almacenará el hash

    // ---- Intentos y bloqueo ----
    lockAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsuarioPin", UsuarioPinSchema);
