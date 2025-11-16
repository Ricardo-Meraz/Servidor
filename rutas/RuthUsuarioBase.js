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
// SOLICITAR RECUPERACIÓN
// =========================
router.post("/recuperar", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await UsuarioBase.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Correo no registrado" });

    // Crear token seguro
    const token = crypto.randomBytes(32).toString("hex");

    usuario.tokenRecuperacion = token;
    usuario.expiraToken = Date.now() + 60 * 60 * 1000; // 1 hora
    await usuario.save();

    // LINK hacia tu frontend
    const link = `https://mi-app.vercel.app/reset-password/${token}`;

    // Transportador Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // CORREGIDO: el "from" DEBE SER IGUAL A EMAIL_USER
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: usuario.email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}">${link}</a>
        <p>Este enlace expira en 1 hora.</p>
      `
    });

    res.json({ mensaje: "Correo enviado. Revisa tu bandeja." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// =========================
// RESTABLECER CONTRASEÑA
// =========================
router.post("/restablecer/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevaContraseña } = req.body;

    const usuario = await UsuarioBase.findOne({
      tokenRecuperacion: token,
      expiraToken: { $gt: Date.now() }
    });

    if (!usuario)
      return res.status(400).json({ mensaje: "Token inválido o expirado" });

    const hash = await bcrypt.hash(nuevaContraseña, 10);

    usuario.contraseña = hash;
    usuario.tokenRecuperacion = undefined;
    usuario.expiraToken = undefined;

    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
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
