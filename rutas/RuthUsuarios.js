const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../Models/ModelUsuario');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().populate('pregunta_recuperacion.pre_id'); // 🔥 Obtiene detalles de la pregunta
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los usuarios', error });
    }
});

router.post('/registro', async (req, res) => {
    try {
        console.log("📥 Datos recibidos en el backend:", req.body); // 👀 Verificar qué datos llegan

        const { nombre, apellidoP, apellidoM, telefono, email, password, sexo, edad, pregunta_recuperacion, respuesta_recuperacion } = req.body;

        if (!nombre || !apellidoP || !telefono || !email || !password || !sexo || !edad || !pregunta_recuperacion || !respuesta_recuperacion) {
            console.log("❌ Campos faltantes:", { nombre, apellidoP, telefono, email, password, sexo, edad, pregunta_recuperacion, respuesta_recuperacion });
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            console.log("⚠️ Correo ya registrado:", email);
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
            contraseña: passwordHash,
            sexo,
            edad,
            pregunta_recuperacion: { pre_id: pregunta_recuperacion, respuesta: respuesta_recuperacion },
            rol: "Cliente"
        });

        await nuevoUsuario.save();
        console.log("✅ Usuario registrado exitosamente");
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error("🔥 Error en el servidor:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const esValida = await bcrypt.compare(password, usuario.contraseña);
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
