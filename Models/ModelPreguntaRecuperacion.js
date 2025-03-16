const mongoose = require('mongoose');

const PreguntaRecuperacionSchema = new mongoose.Schema({
    pregunta: { type: String, required: true }
});

// 📌 Asegúrate de que el modelo coincida con la colección
const PreguntaRecuperacion = mongoose.model('pregunta-recuperacion', PreguntaRecuperacionSchema, 'pregunta-recuperacion');

module.exports = PreguntaRecuperacion;
