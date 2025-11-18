const express = require("express");
const bcrypt = require("bcryptjs");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

/* ============================================================
   FUNCIONES DE APOYO
============================================================ */

// Ver si está bloqueado
const estaBloqueado = (usuario) => {
  if (!usuario.lockUntil) return false;
  return usuario.lockUntil > Date.now();
};

// Registrar intento fallido (PIN o contraseña)
const intentoFallido = async (usuario) => {
  usuario.lockAttempts++;

  if (usuario.lockAttempts >= 3) {
    usuario.lockUntil = Date.now() + 5 * 60 * 1000; // 5 min
    usuario.lockAttempts = 0;
  }

  await usuario.save();
};

// Limpiar bloqueo al iniciar sesión
const limpiarBloqueo = async (usuario) => {
  usuario.lockAttempts = 0;
  usuario.lockUntil = null;
  await usuario.save();
};

/* ============================================================
   REGISTRO
============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const existe = await UsuarioPin.findOne({ email });
    if (existe)
      return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevo = await UsuarioPin.create({
      email,
      contraseña: hash,
    });

    res.json({ mensaje: "Usuario registrado correctamente", usuario: nuevo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/* ============================================================
   LOGIN NORMAL
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // Cuenta bloqueada
    if (estaBloqueado(usuario)) {
      return res.status(403).json({
        mensaje: "Cuenta bloqueada por intentos fallidos. Intenta en 5 minutos.",
      });
    }

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) {
      await intentoFallido(usuario);
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    await limpiarBloqueo(usuario);

    res.json({ mensaje: "Login exitoso", usuario });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/* ============================================================
   LOGIN POR PIN
============================================================ */
router.post("/login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // Bloqueado
    if (estaBloqueado(usuario)) {
      return res.status(403).json({
        mensaje: "Cuenta bloqueada por intentos fallidos. Intenta en 5 minutos.",
      });
    }

    // NO tiene PIN configurado
    if (!usuario.pin) {
      return res.status(403).json({
        necesitaConfigurarPin: true,
        mensaje: "Para iniciar sesión con PIN primero necesitas configurarlo.",
      });
    }

    const coincide = await bcrypt.compare(pin, usuario.pin);
    if (!coincide) {
      await intentoFallido(usuario);
      return res.status(400).json({ mensaje: "PIN incorrecto" });
    }

    await limpiarBloqueo(usuario);

    res.json({ mensaje: "Login PIN exitoso", usuario });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/* ============================================================
   CONFIGURAR O CAMBIAR PIN
============================================================ */
router.post("/config-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (pin.length < 4 || pin.length > 6)
      return res.status(400).json({ mensaje: "El PIN debe ser de 4 a 6 dígitos." });

    // secuencias tipo 1234 o 9876
    const asc = "0123456789";
    const desc = "9876543210";
    if (asc.includes(pin) || desc.includes(pin))
      return res.status(400).json({ mensaje: "El PIN no puede ser secuencial." });

    // repetidos tipo 1111
    if (pin.split("").every((d) => d === pin[0]))
      return res
        .status(400)
        .json({ mensaje: "El PIN no puede tener todos los dígitos iguales." });

    // patrones repetidos 1212, 4545
    const repetido = /^(\d)(\d)\1\2$/;
    if (repetido.test(pin))
      return res
        .status(400)
        .json({ mensaje: "El PIN no puede ser un patrón repetido." });

    const hash = await bcrypt.hash(pin, 10);
    usuario.pin = hash;
    await usuario.save();

    res.json({ mensaje: "PIN configurado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

module.exports = router;
