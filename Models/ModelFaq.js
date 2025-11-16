const mongoose = require("mongoose");

const FaqSchema = new mongoose.Schema(
  {
    pregunta: { type: String, required: true },
    respuesta: { type: String, default: "" } // Puedes marcarlo como requerido o no según tu necesidad
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", FaqSchema);
