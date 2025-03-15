const express = require("express");
const router = express.Router();
const HistorialAntecedentes = require("../Models/ModelHistorial-Antecedentes");

// 📌 GET: Obtener historial y antecedentes
router.get("/ver", async (req, res) => {
  try {
    const data = await HistorialAntecedentes.findOne();
    if (!data) {
      return res.status(404).json({ mensaje: "No hay información de historial y antecedentes." });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la información", error });
  }
});

// 📌 POST: Agregar historial y antecedentes
router.post("/agregar", async (req, res) => {
  try {
    const { historial, antecedentes } = req.body;

    if (!historial || !antecedentes) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    const nuevoRegistro = new HistorialAntecedentes({
      historial,
      antecedentes
    });

    await nuevoRegistro.save();
    res.json({ mensaje: "Información agregada correctamente.", data: nuevoRegistro });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar la información", error });
  }
});

// 📌 PUT: Actualizar historial y antecedentes
router.put("/actualizar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { historial, antecedentes } = req.body;

    const actualizacion = await HistorialAntecedentes.findByIdAndUpdate(id, { 
      historial, antecedentes 
    }, { new: true });

    if (!actualizacion) {
      return res.status(404).json({ mensaje: "No se encontró el registro." });
    }

    res.json({ mensaje: "Información actualizada correctamente.", data: actualizacion });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la información", error });
  }
});

// 📌 DELETE: Eliminar historial y antecedentes
router.delete("/eliminar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminacion = await HistorialAntecedentes.findByIdAndDelete(id);

    if (!eliminacion) {
      return res.status(404).json({ mensaje: "No se encontró el registro." });
    }

    res.json({ mensaje: "Información eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la información", error });
  }
});

module.exports = router;
