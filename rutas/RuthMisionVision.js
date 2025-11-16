const express = require("express");
const router = express.Router();
const MisionVision = require("../Models/ModelMisionVision");

// 📌 Obtener la información de Misión, Visión y Valores
router.get("/ver", async (req, res) => {
    try {
        const data = await MisionVision.findOne();
        if (!data) {
            return res.status(404).json({ mensaje: "No hay información registrada." });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener la información.", error });
    }
});

// 📌 Agregar un nuevo registro de Misión, Visión y Valores
router.post("/agregar", async (req, res) => {
    try {
        const { mision, vision, valores } = req.body;
        if (!mision || !vision || !valores) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        const nuevoRegistro = new MisionVision({ mision, vision, valores });
        await nuevoRegistro.save();
        res.status(201).json({ mensaje: "Información creada correctamente.", datos: nuevoRegistro });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar la información.", error });
    }
});

// 📌 Actualizar Misión, Visión y Valores por ID
router.put("/actualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { mision, vision, valores } = req.body;

        if (!mision || !vision || !valores) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
        }

        const datosActualizados = await MisionVision.findByIdAndUpdate(id, { mision, vision, valores }, { new: true });

        if (!datosActualizados) {
            return res.status(404).json({ mensaje: "Registro no encontrado." });
        }

        res.json({ mensaje: "Información actualizada correctamente.", datos: datosActualizados });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la información.", error });
    }
});

// 📌 Eliminar un registro por ID
router.delete("/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await MisionVision.findByIdAndDelete(id);

        if (!eliminado) {
            return res.status(404).json({ mensaje: "Registro no encontrado." });
        }

        res.json({ mensaje: "Registro eliminado correctamente." });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la información.", error });
    }
});

module.exports = router;
