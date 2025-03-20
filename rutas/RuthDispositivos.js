const express = require('express');
const router = express.Router();
const Dispositivo = require('../Models/ModelDispositivo'); // Ajusta la ruta según tu estructura

// GET /dispositivos/estado?email=...
// Devuelve el dispositivo asociado al email dado
router.get('/estado', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ mensaje: 'El email es obligatorio' });
    
    const dispositivo = await Dispositivo.findOne({ email });
    if (!dispositivo) return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    
    res.json(dispositivo);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

// POST /dispositivos/vincular
// Vincula (o actualiza) un dispositivo usando los datos enviados en el body
router.post('/vincular', async (req, res) => {
  try {
    const { nombre, mac, email, ip } = req.body;
    if (!nombre || !mac || !email) {
      return res.status(400).json({ mensaje: 'Nombre, MAC y email son obligatorios' });
    }

    // Si ya existe un dispositivo vinculado a ese email, lo actualizamos
    let dispositivo = await Dispositivo.findOne({ email });
    if (dispositivo) {
      dispositivo.nombre = nombre;
      dispositivo.ip = ip || dispositivo.ip;
      // Aquí podrías actualizar otros campos según necesites
      await dispositivo.save();
    } else {
      // Si no existe, lo creamos
      dispositivo = new Dispositivo({ nombre, email, ip });
      await dispositivo.save();
    }

    res.json({ mensaje: 'Dispositivo vinculado correctamente', dispositivo });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;
