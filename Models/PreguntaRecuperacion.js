const mongoose = require("mongoose");

const PreguntaRecuperacionSchema = new mongoose.Schema({
  pregunta: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("PreguntaRecuperacion", PreguntaRecuperacionSchema);
