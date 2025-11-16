const express = require("express");
const router = express.Router();
const HistorialAntecedentes = require("../Models/ModelHistorial-Antecedentes");

// 📌 Obtener los datos de historial y antecedentes
router.get("/ver", async (req, res) => {
    try {
        const datos = await HistorialAntecedentes.findOne();
        if (!datos) {
            return res.status(404).json({ mensaje: "No hay información registrada." });
        }
        res.json(datos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la información.", error });
    }
});

// 📌 Agregar nuevo historial y antecedentes
router.post("/agregar", async (req, res) => {
    try {
        const { historial, antecedentes } = req.body;
        const nuevoRegistro = new HistorialAntecedentes({ historial, antecedentes });
        await nuevoRegistro.save();
        res.json({ mensaje: "Registro agregado exitosamente." });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al agregar la información.", error });
    }
});

// 📌 Actualizar historial y antecedentes
router.put("/actualizar/:id", async (req, res) => {
    try {
        const { historial, antecedentes } = req.body;
        const actualizado = await HistorialAntecedentes.findByIdAndUpdate(
            req.params.id,
            { historial, antecedentes },
            { new: true }
        );
        if (!actualizado) {
            return res.status(404).json({ mensaje: "Registro no encontrado." });
        }
        res.json({ mensaje: "Actualizado correctamente.", actualizado });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la información.", error });
    }
});

// 📌 Eliminar historial y antecedentes
router.delete("/eliminar/:id", async (req, res) => {
    try {
        const eliminado = await HistorialAntecedentes.findByIdAndDelete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ mensaje: "Registro no encontrado." });
        }
        res.json({ mensaje: "Eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la información.", error });
    }
});

module.exports = router;
