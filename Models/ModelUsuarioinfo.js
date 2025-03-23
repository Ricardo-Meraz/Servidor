const mongoose = require("mongoose");

const conctUsuario = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    mensaje: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
  },
  { collection: "contactanos" }
);

module.exports = mongoose.model("Usuario", conctUsuario);
