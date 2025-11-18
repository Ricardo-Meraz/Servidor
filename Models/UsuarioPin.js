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
    pinHash: { type: String, default: null },
    pinIntentosFallidos: { type: Number, default: 0 },
    pinBloqueadoHasta: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsuarioPin", UsuarioPinSchema);
