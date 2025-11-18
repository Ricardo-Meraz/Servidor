const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

// ======== VALIDACIONES DE PIN ========
const esSecuencial = (pin) => {
  const asc = "0123456789";
  const desc = "9876543210";
  return asc.includes(pin) || desc.includes(pin);
};

const esRepetitivo = (pin) => /^(\d)\1+$/.test(pin);

const esPatronRepetido = (pin) => pin === pin.slice(0, 2).repeat(pin.length / 2);

// ======== REGISTRO ========
router.post("/registro", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const existe = await UsuarioPin.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const hashPass = await bcrypt.hash(contraseña, 10);

    await UsuarioPin.create({ email, contraseña: hashPass });

    res.json({ mensaje: "Usuario registrado correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});

// ======== LOGIN NORMAL ========
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (usuario.lockUntil && usuario.lockUntil > Date.now()) {
      const restante = Math.ceil((usuario.lockUntil - Date.now()) / 1000);
      return res.status(403).json({ mensaje: "Cuenta bloqueada", restante });
    }

    const correcta = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!correcta) {
      usuario.lockAttempts += 1;

      if (usuario.lockAttempts >= 3) {
        usuario.lockUntil = Date.now() + 5 * 60 * 1000;
        usuario.lockAttempts = 0;
      }

      await usuario.save();
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    usuario.lockAttempts = 0;
    usuario.lockUntil = null;
    await usuario.save();

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        email: usuario.email,
        tienePin: usuario.pin ? true : false,
      },
    });
  } catch {
    res.status(500).json({ mensaje: "Error en login" });
  }
});

// ======== LOGIN POR PIN ========
router.post("/login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (!usuario.pin)
      return res.status(400).json({
        mensaje: "Para iniciar por PIN primero necesitas configurarlo.",
        requierePin: true,
      });

    if (usuario.lockUntil && usuario.lockUntil > Date.now()) {
      const restante = Math.ceil((usuario.lockUntil - Date.now()) / 1000);
      return res.status(403).json({ mensaje: "Cuenta bloqueada", restante });
    }

    const correcto = await bcrypt.compare(pin, usuario.pin);
    if (!correcto) {
      usuario.lockAttempts += 1;

      if (usuario.lockAttempts >= 3) {
        usuario.lockUntil = Date.now() + 5 * 60 * 1000;
        usuario.lockAttempts = 0;
      }

      await usuario.save();
      return res.status(400).json({ mensaje: "PIN incorrecto" });
    }

    usuario.lockAttempts = 0;
    usuario.lockUntil = null;
    await usuario.save();

    res.json({
      mensaje: "Login por PIN correcto",
      usuario: {
        email: usuario.email,
        tienePin: true,
      },
    });
  } catch {
    res.status(500).json({ mensaje: "Error al ingresar por PIN" });
  }
});

// ======== CONFIGURAR PIN ========
router.post("/configurar-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (pin.length < 4 || pin.length > 6)
      return res.status(400).json({ mensaje: "El PIN debe ser de 4 a 6 dígitos" });

    if (esSecuencial(pin))
      return res.status(400).json({ mensaje: "El PIN no puede ser secuencial" });

    if (esRepetitivo(pin))
      return res.status(400).json({ mensaje: "El PIN no puede ser repetitivo" });

    if (pin.length % 2 === 0 && esPatronRepetido(pin))
      return res.status(400).json({ mensaje: "El PIN no puede ser un patrón repetido" });

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const hash = await bcrypt.hash(pin, 10);
    usuario.pin = hash;

    await usuario.save();

    res.json({ mensaje: "PIN configurado correctamente" });
  } catch {
    res.status(500).json({ mensaje: "Error al configurar PIN" });
  }
});

// ========= RECUPERAR CONTRASEÑA =========
router.post("/recuperar", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Correo no registrado" });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    usuario.resetCode = codigo;
    usuario.resetExpires = Date.now() + 5 * 60 * 1000;
    await usuario.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "Soporte <no-reply@app.com>",
      to: email,
      subject: "Código para restablecer contraseña",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código es:</p>
        <h1 style="font-size:40px; letter-spacing:4px;">${codigo}</h1>
        <p>Expira en 5 minutos.</p>
      `,
    });

    res.json({ mensaje: "Código enviado al correo." });
  } catch {
    res.status(500).json({ mensaje: "Error al enviar código." });
  }
});

// ========= VERIFICAR CÓDIGO =========
router.post("/verificar-codigo", async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const usuario = await UsuarioPin.findOne({
      email,
      resetCode: codigo,
      resetExpires: { $gt: Date.now() },
    });

    if (!usuario)
      return res.status(400).json({ mensaje: "Código inválido o expirado" });

    res.json({ mensaje: "Código válido" });
  } catch {
    res.status(500).json({ mensaje: "Error al verificar código" });
  }
});

// ========= RESTABLECER CONTRASEÑA =========
router.post("/restablecer", async (req, res) => {
  try {
    const { email, nueva } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const hash = await bcrypt.hash(nueva, 10);

    usuario.contraseña = hash;
    usuario.resetCode = null;
    usuario.resetExpires = null;

    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ mensaje: "Error al actualizar contraseña" });
  }
});

module.exports = router;
