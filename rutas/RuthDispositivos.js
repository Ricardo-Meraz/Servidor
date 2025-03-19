const express = require('express');
const router = express.Router();
const Dispositivo = require('../Models/ModelDispositivo'); // Ajusta la ruta según tu estructura

// --- Endpoints específicos --- //

// 📌 1️⃣ Vincular un dispositivo a un usuario
router.post('/vincular', async (req, res) => {
  try {
    const { mac, nombre, email } = req.body;
    
    if (!mac || !nombre || !email) {
      return res.status(400).json({ mensaje: 'MAC, Nombre y Email son obligatorios' });
    }

    // Verificar si ya hay un dispositivo vinculado al usuario
    const dispositivoExistente = await Dispositivo.findOne({ email });
    if (dispositivoExistente) {
      return res.status(400).json({ mensaje: 'Ya tienes un dispositivo vinculado' });
    }

    // Crear nuevo dispositivo
    const nuevoDispositivo = new Dispositivo({
      mac,
      nombre,
      email,
      fecha: new Date(),
      automatico: 1, // Por defecto en modo automático
      temperatura: 0,
      humedad: 0,
      luz: 0,
      ventilador: 0,
      bomba: 0,
      foco: 0
    });

    await nuevoDispositivo.save();
    res.status(201).json({ mensaje: 'Dispositivo vinculado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al vincular el dispositivo', error });
  }
});

// 📌 2️⃣ Obtener el estado del dispositivo del usuario autenticado
router.get('/estado', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ mensaje: 'Email es obligatorio' });
    }
    
    const dispositivo = await Dispositivo.findOne({ email });
    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'No tienes un dispositivo vinculado' });
    }

    res.json(dispositivo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el estado del dispositivo', error });
  }
});

// 📌 3️⃣ Actualizar el estado del dispositivo (modo, ventilador, bomba, foco)
router.put('/actualizar', async (req, res) => {
  try {
    const { email, automatico, ventilador, bomba, foco } = req.body;
    
    if (!email) {
      return res.status(400).json({ mensaje: 'Email es obligatorio' });
    }

    const dispositivo = await Dispositivo.findOne({ email });
    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'No tienes un dispositivo vinculado' });
    }

    // Actualizar solo los campos enviados
    if (automatico !== undefined) dispositivo.automatico = automatico;
    if (ventilador !== undefined) dispositivo.ventilador = ventilador;
    if (bomba !== undefined) dispositivo.bomba = bomba;
    if (foco !== undefined) dispositivo.foco = foco;

    await dispositivo.save();
    res.json({ mensaje: 'Estado del dispositivo actualizado', dispositivo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado del dispositivo', error });
  }
});

// --- Endpoints CRUD genéricos --- //

// Obtener todos los dispositivos
router.get('/', async (req, res) => {
  try {
    const dispositivos = await Dispositivo.find();
    res.status(200).json(dispositivos);
  } catch (error) {
    console.error('Error al obtener dispositivos:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener un dispositivo por su ID
router.get('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findById(req.params.id);
    if (!dispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }
    res.status(200).json(dispositivo);
  } catch (error) {
    console.error('Error al obtener dispositivo:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Crear un nuevo dispositivo
router.post('/', async (req, res) => {
  try {
    const newDispositivo = new Dispositivo(req.body);
    await newDispositivo.save();
    res.status(201).json({ mensaje: 'Dispositivo creado exitosamente', dispositivo: newDispositivo });
  } catch (error) {
    console.error('Error al crear dispositivo:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Actualizar un dispositivo
router.put('/:id', async (req, res) => {
  try {
    const updatedDispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Dispositivo actualizado exitosamente', dispositivo: updatedDispositivo });
  } catch (error) {
    console.error('Error al actualizar dispositivo:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Eliminar un dispositivo
router.delete('/:id', async (req, res) => {
  try {
    const deletedDispositivo = await Dispositivo.findByIdAndDelete(req.params.id);
    if (!deletedDispositivo) {
      return res.status(404).json({ mensaje: 'Dispositivo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Dispositivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar dispositivo:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
