const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../Models/ModelUsuario');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().populate('pregunta_recuperacion.pre_id'); // 🔥 Trae la pregunta asociada
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los usuarios', error });
    }
});

// Registrar un usuario
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellidoP, apellidoM, telefono, email, password, sexo, edad, pregunta_recuperacion, respuesta_recuperacion } = req.body;

        if (!nombre || !apellidoP || !telefono || !email || !password || !sexo || !edad || !pregunta_recuperacion || !respuesta_recuperacion) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            nombre,
            apellidoP,
            apellidoM,
            telefono,
            email,
            contraseña: passwordHash, // Se mantiene como "contraseña" en la base de datos
            sexo,
            edad,
            pregunta_recuperacion: {
                pre_id: new mongoose.Types.ObjectId(pregunta_recuperacion), // 🔥 Convierte el ID en ObjectId
                respuesta: respuesta_recuperacion
            },
            rol: "Cliente"
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        console.log(req.body); // 👀 Ver qué datos recibe el backend

        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email }).populate('pregunta_recuperacion.pre_id'); // 🔥 Muestra la pregunta de recuperación

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const esValida = await bcrypt.compare(password, usuario.contraseña); // ✅ Corrección aquí
        if (!esValida) {
            return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: usuario._id, email: usuario.email }, 'secreto123', { expiresIn: '1h' });

        res.json({ mensaje: 'Inicio de sesión exitoso', token, usuario });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

module.exports = router;
