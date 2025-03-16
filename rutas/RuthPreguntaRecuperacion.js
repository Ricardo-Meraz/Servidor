const express = require('express');
const PreguntaRecuperacion = require('../Models/ModelPreguntaRecuperacion');

const router = express.Router();

// ✅ Obtener todas las preguntas
router.get('/ver', async (req, res) => {
    try {
        const preguntas = await PreguntaRecuperacion.find();
        res.json(preguntas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las preguntas', error });
    }
});

// ✅ Agregar una nueva pregunta
router.post('/agregar', async (req, res) => {
    try {
        const { pregunta } = req.body;

        if (!pregunta) {
            return res.status(400).json({ mensaje: 'La pregunta es obligatoria' });
        }

        const nuevaPregunta = new PreguntaRecuperacion({ pregunta });
        await nuevaPregunta.save();
        res.status(201).json({ mensaje: 'Pregunta agregada correctamente', nuevaPregunta });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al agregar la pregunta', error });
    }
});

// ✅ Eliminar una pregunta por ID
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const preguntaEliminada = await PreguntaRecuperacion.findByIdAndDelete(id);

        if (!preguntaEliminada) {
            return res.status(404).json({ mensaje: 'Pregunta no encontrada' });
        }

        res.json({ mensaje: 'Pregunta eliminada correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar la pregunta', error });
    }
});

module.exports = router;
