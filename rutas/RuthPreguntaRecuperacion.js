const express = require('express');
const PreguntaRecuperacion = require('../Models/ModelPreguntaRecuperacion');

const router = express.Router();

// Obtener todas las preguntas de recuperación
router.get('/ver', async (req, res) => {
    try {
        const preguntas = await PreguntaRecuperacion.find();
        if (preguntas.length === 0) {
            return res.status(404).json({ mensaje: 'No hay preguntas registradas' });
        }
        res.json(preguntas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las preguntas', error });
    }
});

module.exports = router;
