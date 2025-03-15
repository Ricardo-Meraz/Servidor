const express = require('express');
const router = express.Router();
const HistorialAntecedentes = require('../Models/ModelHistorial-Antecedentes');

// 🔍 Ver Historial y Antecedentes
router.get('/ver', async (req, res) => {
    try {
        const datos = await HistorialAntecedentes.findOne();
        if (!datos) {
            return res.status(404).json({ mensaje: 'No hay información registrada.' });
        }
        res.json(datos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener la información.', error });
    }
});

// ✅ Agregar Historial y Antecedentes
router.post('/agregar', async (req, res) => {
    try {
        const { historial, antecedentes } = req.body;

        if (!historial || !antecedentes) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        const nuevoRegistro = new HistorialAntecedentes({ historial, antecedentes });
        await nuevoRegistro.save();
        res.json({ mensaje: "Historial y Antecedentes guardados correctamente." });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar los datos.", error });
    }
});

// 🔄 Editar Historial y Antecedentes
router.put('/editar/:id', async (req, res) => {
    try {
        const { historial, antecedentes } = req.body;

        const datosActualizados = await HistorialAntecedentes.findByIdAndUpdate(
            req.params.id, 
            { historial, antecedentes },
            { new: true }
        );

        if (!datosActualizados) {
            return res.status(404).json({ mensaje: "No se encontró el registro." });
        }

        res.json({ mensaje: "Información actualizada correctamente.", datosActualizados });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar.", error });
    }
});

// ❌ Eliminar Historial y Antecedentes
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const eliminado = await HistorialAntecedentes.findByIdAndDelete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ mensaje: "No se encontró el registro para eliminar." });
        }
        res.json({ mensaje: "Registro eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar.", error });
    }
});

module.exports = router;
