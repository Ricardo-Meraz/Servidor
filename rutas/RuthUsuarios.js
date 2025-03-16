const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../Models/ModelUsuario');
const PreguntaRecuperacion = require('../Models/ModelPreguntaRecuperacion'); // ✅ Importar modelo de preguntas

const router = express.Router();

// Obtener todos los usuarios con su pregunta referenciada
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().populate('pregunta_recuperacion'); // ✅ Ahora referencia la pregunta correctamente
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los usuarios', error });
    }
});

// Registrar un usuario con pregunta de recuperación referenciada
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellidoP, apellidoM, telefono, email, password, sexo, edad, pregunta_recuperacion, respuesta_recuperacion } = req.body;

        if (!nombre || !apellidoP || !telefono || !email || !password || !sexo || !edad || !pregunta_recuperacion || !respuesta_recuperacion) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        // Verificar si la pregunta de recuperación existe en la base de datos
        const preguntaExiste = await PreguntaRecuperacion.findById(pregunta_recuperacion);
        if (!preguntaExiste) {
            return res.status(400).json({ mensaje: 'La pregunta de recuperación no es válida' });
        }

        // Verificar si el email ya está registrado
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo ya está registrado' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear nuevo usuario con la referencia correcta
        const nuevoUsuario = new Usuario({
            nombre,
            apellidoP,
            apellidoM,
            telefono,
            email,
            contraseña: passwordHash,
            sexo,
            edad,
            pregunta_recuperacion, // 🔥 Guardamos el ObjectId de la pregunta
            respuesta_recuperacion,
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
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email }).populate('pregunta_recuperacion'); // ✅ Traer la pregunta referenciada

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
