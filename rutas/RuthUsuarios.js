const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../Models/ModelUsuario');

const router = express.Router();

// 🔥 Ruta para registrar un usuario
router.post('/registro', async (req, res) => {
    try {
        console.log("📥 Datos recibidos en el backend:", req.body); // ✅ Depuración

        const { nombre, apellidoP, apellidoM, telefono, email, password, sexo, edad, pregunta_recuperacion, respuesta_recuperacion } = req.body;

        if (!nombre || !apellidoP || !telefono || !email || !password || !sexo || !edad || !pregunta_recuperacion || !respuesta_recuperacion) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        // ✅ Convertimos `pre_id` a un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(pregunta_recuperacion)) {
            return res.status(400).json({ mensaje: 'ID de pregunta inválido' });
        }
        const pre_id_ObjectId = new mongoose.Types.ObjectId(pregunta_recuperacion);

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
            contraseña: passwordHash,
            sexo,
            edad,
            pregunta_recuperacion: {
                pre_id: pre_id_ObjectId, // ✅ Ahora es un ObjectId válido
                respuesta: respuesta_recuperacion
            },
            rol: "Cliente"
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error("❌ Error en el backend:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

module.exports = router;
