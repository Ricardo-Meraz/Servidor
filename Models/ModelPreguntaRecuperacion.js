const mongoose = require('mongoose');

const PreguntaRecuperacionSchema = new mongoose.Schema({
    pregunta: { type: String, required: true }
});

const PreguntaRecuperacion = mongoose.model('PreguntaRecuperacion', PreguntaRecuperacionSchema);

module.exports = PreguntaRecuperacion;
