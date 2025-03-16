const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../Models/ModelUsuario');

const router = express.Router();

// ==========================
// Ruta para registrar un usuario
// ==========================
router.post('/registro', async (req, res) => {
    try {
        console.log("📥 Datos recibidos en el backend:", req.body);

        const { 
            nombre, 
            apellidoP, 
            apellidoM, 
            telefono, 
            email, 
            password, 
            sexo, 
            edad, 
            pregunta_recuperacion, 
            respuesta_recuperacion 
        } = req.body;

        if (!nombre || !apellidoP || !telefono || !email || !password || 
            !sexo || !edad || !pregunta_recuperacion || !respuesta_recuperacion) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

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
                pre_id: pre_id_ObjectId, 
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

// ==========================
// Ruta para Login
// ==========================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
        }
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }
        const isMatch = await bcrypt.compare(password, usuario.contraseña);
        if (!isMatch) {
            return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
        }
        // Generar token (configura JWT_SECRET en tus variables de entorno o se usa 'secretkey' por defecto)
        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ mensaje: 'Login exitoso', token, usuario });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

// ==========================
// Ruta para ver (listar) los usuarios
// ==========================
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
});

// ==========================
// Ruta para actualizar (editar) un usuario
// ==========================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }
        // Copiamos los datos que se quieren actualizar
        const updateData = { ...req.body };

        // Si se actualiza la contraseña, se vuelve a hashearla
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.contraseña = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }
        // Si se actualiza la pregunta de recuperación, se espera el ID como string y la respuesta (opcional)
        if (updateData.pregunta_recuperacion) {
            if (!mongoose.Types.ObjectId.isValid(updateData.pregunta_recuperacion)) {
                return res.status(400).json({ mensaje: 'ID de pregunta inválido' });
            }
            updateData.pregunta_recuperacion = {
                pre_id: new mongoose.Types.ObjectId(updateData.pregunta_recuperacion),
                respuesta: updateData.respuesta_recuperacion || ""
            };
            delete updateData.respuesta_recuperacion;
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, updateData, { new: true });
        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json({ mensaje: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error("❌ Error en actualizar usuario:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

// ==========================
// Ruta para eliminar un usuario
// ==========================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);
        if (!usuarioEliminado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

module.exports = router;
