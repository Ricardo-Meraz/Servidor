const express = require('express');
const router = express.Router();
const Dispositivo = require('../models/Dispositivo');

// GET /dispositivos/estado?email=...
// Devuelve el dispositivo asociado al email dado
router.get('/estado', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es obligatorio' });
    }
    
    const dispositivo = await Dispositivo.findOne({ email });
    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }
    
    res.json(dispositivo);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

// POST /dispositivos/vincular
// Vincula (o actualiza) un dispositivo usando los datos enviados en el body
router.post('/vincular', async (req, res) => {
  try {
    const { nombre, email, ip } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ mensaje: 'Nombre y email son obligatorios' });
    }

    let dispositivo = await Dispositivo.findOne({ email });
    if (dispositivo) {
      dispositivo.nombre = nombre;
      dispositivo.ip = ip || dispositivo.ip;
      await dispositivo.save();
    } else {
      dispositivo = new Dispositivo({ nombre, email, ip });
      await dispositivo.save();
    }

    res.json({ mensaje: 'Dispositivo vinculado correctamente', dispositivo });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;
