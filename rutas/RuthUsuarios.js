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
    // Generar token (usa JWT_SECRET en tus variables de entorno o 'secretkey' por defecto)
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

    // Depuración: muestra el objeto recibido
    console.log("🔄 Datos a actualizar:", updateData);

    // Si se actualiza la contraseña, hashearla y eliminar el campo original
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.contraseña = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    // Manejo condicional de la pregunta de recuperación:
    // Solo actualizamos si viene un string no vacío
    if (typeof updateData.pregunta_recuperacion === 'string') {
      if (updateData.pregunta_recuperacion.trim() === "") {
        delete updateData.pregunta_recuperacion;
        delete updateData.respuesta_recuperacion;
      } else {
        if (!mongoose.Types.ObjectId.isValid(updateData.pregunta_recuperacion)) {
          return res.status(400).json({ mensaje: 'ID de pregunta inválido' });
        }
        updateData.pregunta_recuperacion = {
          pre_id: new mongoose.Types.ObjectId(updateData.pregunta_recuperacion),
          respuesta: updateData.respuesta_recuperacion || ""
        };
        delete updateData.respuesta_recuperacion;
      }
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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


// Endpoint para recuperar la pregunta secreta según el email del usuario
router.post('/recuperar-pregunta', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
    }
    // Buscar el usuario y popular la pregunta secreta
    const usuario = await Usuario.findOne({ email })
      .populate('pregunta_recuperacion.pre_id');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    const pregunta = usuario.pregunta_recuperacion.pre_id?.pregunta;
    if (!pregunta) {
      return res.status(404).json({ mensaje: 'No se encontró la pregunta secreta.' });
    }
    res.status(200).json({ pregunta });
  } catch (error) {
    console.error("❌ Error en recuperar-pregunta:", error);
    res.status(500).json({ mensaje: 'Error al obtener la pregunta secreta.', error });
  }
});

router.post('/cambiar-contraseña', async (req, res) => {
  try {
    const { email, nuevaContraseña } = req.body;
    if (!email || !nuevaContraseña) {
      return res.status(400).json({ mensaje: 'Email y nueva contraseña son obligatorios.' });
    }
    // Buscar al usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaContraseña, salt);
    usuario.contraseña = passwordHash;
    // Guardar el usuario con la contraseña actualizada
    await usuario.save();
    res.status(200).json({ success: true, mensaje: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error("❌ Error en cambiar-contraseña:", error);
    res.status(500).json({ mensaje: 'Error al actualizar la contraseña.', error });
  }
});

router.post('/verificar-respuesta', async (req, res) => {
  try {
    const { email, respuesta } = req.body;
    if (!email || !respuesta) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Buscar al usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Comparar la respuesta almacenada con la que envía el usuario, de forma tolerante
    if (
      usuario.pregunta_recuperacion.respuesta.trim().toLowerCase() !==
      respuesta.trim().toLowerCase()
    ) {
      return res.status(400).json({ mensaje: 'Respuesta incorrecta.' });
    }

    res.status(200).json({ success: true, mensaje: 'Respuesta correcta.' });
  } catch (error) {
    console.error("❌ Error en verificar-respuesta:", error);
    res.status(500).json({ mensaje: 'Error al verificar la respuesta secreta.', error });
  }
});


module.exports = router;
