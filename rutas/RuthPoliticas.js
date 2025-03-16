const express = require("express");
const router = express.Router();
const Politicas = require("../Models/ModelPoliticas");

// 📌 Obtener las políticas
router.get("/ver", async (req, res) => {
  try {
    const politicas = await Politicas.findOne();
    if (!politicas) {
      return res.status(404).json({ mensaje: "No se encontraron políticas." });
    }
    res.status(200).json(politicas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las políticas.", error });
  }
});

// 📌 Agregar nuevas políticas
router.post("/agregar", async (req, res) => {
  try {
    const { politicaDeUso, politicaDePrivacidad, terminosYCondiciones } = req.body;
    if (!politicaDeUso || !politicaDePrivacidad || !terminosYCondiciones) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }
    const nuevasPoliticas = new Politicas({
      politicaDeUso,
      politicaDePrivacidad,
      terminosYCondiciones
    });
    await nuevasPoliticas.save();
    res.status(201).json({ mensaje: "Políticas agregadas correctamente.", politicas: nuevasPoliticas });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al agregar políticas.", error });
  }
});

// 📌 Actualizar las políticas por ID
router.put("/actualizar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { politicaDeUso, politicaDePrivacidad, terminosYCondiciones } = req.body;
    if (!politicaDeUso || !politicaDePrivacidad || !terminosYCondiciones) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }
    const politicasActualizadas = await Politicas.findByIdAndUpdate(
      id,
      { politicaDeUso, politicaDePrivacidad, terminosYCondiciones },
      { new: true, runValidators: true }
    );
    if (!politicasActualizadas) {
      return res.status(404).json({ mensaje: "Políticas no encontradas." });
    }
    res.status(200).json({ mensaje: "Políticas actualizadas correctamente.", politicas: politicasActualizadas });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar las políticas.", error });
  }
});

// 📌 Eliminar las políticas por ID
router.delete("/eliminar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const politicasEliminadas = await Politicas.findByIdAndDelete(id);
    if (!politicasEliminadas) {
      return res.status(404).json({ mensaje: "Políticas no encontradas." });
    }
    res.status(200).json({ mensaje: "Políticas eliminadas correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar las políticas.", error });
  }
});

module.exports = router;
