const mongoose = require("mongoose");

const PoliticasSchema = new mongoose.Schema({
  politicaDeUso: { type: String, required: true },
  politicaDePrivacidad: { type: String, required: true },
  terminosYCondiciones: { type: String, required: true }
}, { timestamps: true });

const Politicas = mongoose.model("Politicas", PoliticasSchema);
module.exports = Politicas;
