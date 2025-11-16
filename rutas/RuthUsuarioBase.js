const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UsuarioBase = require("../Models/UsuarioBase");

const router = express.Router();

// =========================
// REGISTRO BASE
// =========================
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const existe = await UsuarioBase.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: "El email ya existe" });

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevo = await UsuarioBase.create({
      nombre,
      email,
      contraseña: hash
    });

    res.status(201).json({ mensaje: "Usuario registrado", usuario: nuevo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await UsuarioBase.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) return res.status(400).json({ mensaje: "Contraseña incorrecta" });

    res.status(200).json({ mensaje: "Login exitoso", usuario });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});


// =========================
// ENVIAR CÓDIGO OTP
// =========================
router.post("/recuperar", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await UsuarioBase.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Correo no registrado" });

    // Código OTP de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    usuario.codigoOTP = codigo;
    usuario.expiraOTP = Date.now() + 5 * 60 * 1000; // 5 minutos
    await usuario.save();

    // Transportador Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      from: "Soporte <noreply@miapp.com>",
      to: usuario.email,
      subject: "Tu código de recuperación",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código para recuperar tu cuenta es:</p>
        <h1 style="font-size: 38px; letter-spacing: 6px;">${codigo}</h1>
        <p>Este código expira en 5 minutos.</p>
      `
    });

    res.json({ mensaje: "Código enviado a tu correo." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al enviar el código" });
  }
});


// =========================
// VERIFICAR OTP Y CAMBIAR CONTRASEÑA
// =========================
router.post("/verificar-otp", async (req, res) => {
  try {
    const { email, codigo, nuevaContraseña } = req.body;

    const usuario = await UsuarioBase.findOne({
      email,
      codigoOTP: codigo,
      expiraOTP: { $gt: Date.now() }
    });

    if (!usuario)
      return res.status(400).json({ mensaje: "Código inválido o expirado" });

    const hash = await bcrypt.hash(nuevaContraseña, 10);

    usuario.contraseña = hash;
    usuario.codigoOTP = undefined;
    usuario.expiraOTP = undefined;

    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar la contraseña" });
  }
});


// =========================
// LISTAR USUARIOS
// =========================
router.get("/", async (req, res) => {
  try {
    const usuarios = await UsuarioBase.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en servidor" });
  }
});

module.exports = router;
