const express = require("express");
const PreguntaRecuperacion = require("../Models/PreguntaRecuperacion");

const router = express.Router();

// 🔥 Obtener todas las preguntas de recuperación
router.get("/ver", async (req, res) => {
  try {
    const preguntas = await PreguntaRecuperacion.find();
    res.json(preguntas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener preguntas de recuperación", error });
  }
});

module.exports = router;
