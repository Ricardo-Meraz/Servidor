const express = require("express");
const bcrypt = require("bcryptjs");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

/* =====================================================
   📌 VALIDAR PIN (no secuencias, no repetidos, no patrones)
===================================================== */
function validarPin(pin) {
  if (!/^\d{4,6}$/.test(pin)) return false;

  const asc = "0123456789";
  const desc = "9876543210";

  if (asc.includes(pin)) return false;
  if (desc.includes(pin)) return false;

  if (/^(\d)\1+$/.test(pin)) return false;

  if (/^(\d\d)\1+$/.test(pin)) return false;

  return true;
}

/* =====================================================
   📌 REGISTRO
===================================================== */
router.post("/registro", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const existe = await UsuarioPin.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    await UsuarioPin.create({
      email,
      contraseña: hash,
      pin: null,
      lockAttempts: 0,
      lockUntil: null,
    });

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});

/* =====================================================
   📌 LOGIN NORMAL
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const user = await UsuarioPin.findOne({ email });
    if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const coincide = await bcrypt.compare(contraseña, user.contraseña);
    if (!coincide) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        email: user.email,
        tienePin: user.pin ? true : false,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en login" });
  }
});

/* =====================================================
   📌 CONFIGURAR PIN
===================================================== */
router.post("/configurar-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!validarPin(pin)) {
      return res.status(400).json({
        mensaje: "PIN inválido (no secuencias, no repetidos, 4-6 dígitos).",
      });
    }

    const user = await UsuarioPin.findOne({ email });
    if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    user.pin = await bcrypt.hash(pin, 10);
    user.lockAttempts = 0;
    user.lockUntil = null;

    await user.save();

    res.json({ mensaje: "PIN configurado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al configurar el PIN" });
  }
});

/* =====================================================
   📌 LOGIN POR PIN
===================================================== */
router.post("/login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const user = await UsuarioPin.findOne({ email });
    if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // ⛔ Si no tiene PIN
    if (!user.pin) {
      return res.status(400).json({
        mensaje: "Para iniciar sesión por PIN primero debes configurarlo.",
        necesitaPin: true,
      });
    }

    // ⛔ Verificar si está bloqueado
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const restante = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return res.status(403).json({
        mensaje: "Cuenta bloqueada por intentos fallidos.",
        restante,
      });
    }

    // Verificar PIN
    const coincide = await bcrypt.compare(pin, user.pin);

    if (!coincide) {
      user.lockAttempts += 1;

      // Si llega a 3 → bloquear 5 min
      if (user.lockAttempts >= 3) {
        user.lockUntil = Date.now() + 5 * 60 * 1000;
        user.lockAttempts = 0;
      }

      await user.save();
      return res.status(400).json({ mensaje: "PIN incorrecto" });
    }

    // 🔥 PIN CORRECTO
    user.lockAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({
      mensaje: "Login por PIN exitoso",
      usuario: {
        email: user.email,
        tienePin: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en login por PIN" });
  }
});

module.exports = router;
