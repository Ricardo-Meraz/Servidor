const mongoose = require("mongoose");

const HistorialAntecedentesSchema = new mongoose.Schema({
    historial: { type: String, required: true },
    antecedentes: { type: String, required: true }
}, { collection: "HistorialyAntecedentes" }); // Se asegura que use la nueva colección

module.exports = mongoose.model("HistorialAntecedentes", HistorialAntecedentesSchema);
