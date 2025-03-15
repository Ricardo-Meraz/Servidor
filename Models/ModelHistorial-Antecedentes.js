const mongoose = require("mongoose");

const HistorialAntecedentesSchema = new mongoose.Schema({
  historial: {
    type: String,
    required: true
  },
  antecedentes: {
    type: String,
    required: true
  }
}, { collection: "Nosotros" }); // Asegura que use la colección correcta

module.exports = mongoose.model("HistorialAntecedentes", HistorialAntecedentesSchema);
