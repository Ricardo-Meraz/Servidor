const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Usuario = require('../Models/ModelUsuario');

const router = express.Router();

// ==================================================
// FUNCIONES AUXILIARES
// ==================================================

function generarToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: "1h"
  });
}

// ==================================================
// 1. REGISTRO DE USUARIO
// ==================================================

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      nombre,
      email,
      contraseña: hash,
      verified: false,
      rol: "Cliente",
      intentos_fallidos: 0,
      cuenta_bloqueada: false
    });

    await nuevo.save();

    res.status(201).json({ mensaje: "Usuario registrado exitosamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// ==================================================
// 2. LOGIN + BLOQUEO POR INTENTOS / PIN
// ==================================================

router.post('/login', async (req, res) => {
  try {
    const { email, password, pin } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: "Usuario no encontrado" });

    // Bloqueo activo
    if (usuario.cuenta_bloqueada) {
      const ahora = new Date();
      if (usuario.fecha_bloqueo && ahora < usuario.fecha_bloqueo) {
        return res.status(403).json({ mensaje: "Cuenta bloqueada temporalmente" });
      } else {
        usuario.cuenta_bloqueada = false;
        usuario.intentos_fallidos = 0;
      }
    }

    const coincide = await bcrypt.compare(password, usuario.contraseña);
    if (!coincide) {
      usuario.intentos_fallidos += 1;

      if (usuario.intentos_fallidos >= 3) {
        usuario.cuenta_bloqueada = true;
        usuario.fecha_bloqueo = new Date(Date.now() + 5 * 60 * 1000);
      }

      await usuario.save();
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    // Si usa PIN
    if (usuario.pin) {
      if (!pin) return res.status(400).json({ mensaje: "PIN requerido" });
      if (pin !== usuario.pin) return res.status(400).json({ mensaje: "PIN incorrecto" });
    }

    usuario.intentos_fallidos = 0;
    usuario.cuenta_bloqueada = false;
    await usuario.save();

    const token = generarToken(usuario._id);

    res.status(200).json({ mensaje: "Login exitoso", token, usuario });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// ==================================================
// 3. GENERAR CÓDIGO DE VERIFICACIÓN
// ==================================================

router.post('/generar-code', async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    usuario.code = code;
    usuario.expiracion = new Date(Date.now() + 10 * 60 * 1000);

    await usuario.save();

    res.status(200).json({ mensaje: "Código generado", code });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 4. VERIFICAR CÓDIGO / ACTIVAR CUENTA
// ==================================================

router.post('/verificar-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (!usuario.code || usuario.code !== code) {
      return res.status(400).json({ mensaje: "Código incorrecto" });
    }

    if (new Date() > usuario.expiracion) {
      return res.status(400).json({ mensaje: "Código expirado" });
    }

    usuario.verified = true;
    usuario.code = null;
    usuario.expiracion = null;

    await usuario.save();

    res.status(200).json({ mensaje: "Cuenta verificada correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 5. OBTENER PREGUNTA SECRETA
// ==================================================

router.post('/recuperar-pregunta', async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email })
      .populate('pregunta_recuperacion.pre_id');

    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (!usuario.pregunta_recuperacion)
      return res.status(404).json({ mensaje: "El usuario no tiene pregunta secreta" });

    res.status(200).json({
      pregunta: usuario.pregunta_recuperacion.pre_id.pregunta
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 6. VERIFICAR RESPUESTA SECRETA
// ==================================================

router.post('/verificar-respuesta', async (req, res) => {
  try {
    const { email, respuesta } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (!usuario.pregunta_recuperacion)
      return res.status(400).json({ mensaje: "No hay pregunta secreta" });

    if (
      usuario.pregunta_recuperacion.respuesta.trim().toLowerCase() !==
      respuesta.trim().toLowerCase()
    ) {
      return res.status(400).json({ mensaje: "Respuesta incorrecta" });
    }

    res.status(200).json({ mensaje: "Respuesta correcta" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 7. GENERAR TOKEN DE RECUPERACIÓN
// ==================================================

router.post('/generar-recovery', async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const token = crypto.randomUUID();

    usuario.recovery_token = token;
    usuario.recovery_exp = new Date(Date.now() + 10 * 60 * 1000);

    await usuario.save();

    res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 8. CAMBIAR CONTRASEÑA CON TOKEN
// ==================================================

router.post('/cambiar-contrasena', async (req, res) => {
  try {
    const { token, nueva } = req.body;

    const usuario = await Usuario.findOne({ recovery_token: token });
    if (!usuario) return res.status(404).json({ mensaje: "Token inválido" });

    if (new Date() > usuario.recovery_exp) {
      return res.status(400).json({ mensaje: "Token expirado" });
    }

    const hash = await bcrypt.hash(nueva, 10);
    usuario.contraseña = hash;
    usuario.recovery_token = null;
    usuario.recovery_exp = null;

    await usuario.save();

    res.status(200).json({ mensaje: "Contraseña cambiada" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 9. LISTAR USUARIOS
// ==================================================

router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 10. OBTENER USUARIO POR ID
// ==================================================

router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate('pregunta_recuperacion.pre_id');

    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.status(200).json(usuario);

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 11. ACTUALIZAR USUARIO
// ==================================================

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.password) {
      data.contraseña = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, data, { new: true });

    res.status(200).json({ mensaje: "Usuario actualizado", usuario });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// ==================================================
// 12. ELIMINAR USUARIO
// ==================================================

router.delete('/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
