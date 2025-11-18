// rutas/RutasPin.js
const express = require("express");
const bcrypt = require("bcryptjs");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

// ===========================================
// VALIDACIÓN DE PIN (NO SECUENCIAL, NO REPETIDO)
// ===========================================
function validarPin(pin) {
  if (!/^\d{4,6}$/.test(pin)) return false;

  if (/^(\d)\1+$/.test(pin)) return false;

  if ("0123456789".includes(pin) || "9876543210".includes(pin)) return false;

  if (/(\d)(\d)\1\2/.test(pin)) return false;

  return true;
}

// ===========================================
// REGISTRO USUARIO
// ===========================================
router.post("/registro", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const existe = await UsuarioPin.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: "El correo ya está registrado" });

    const passHash = bcrypt.hashSync(contraseña, 10);

    const nuevo = await UsuarioPin.create({
      email,
      contraseña: passHash,
    });

    res.json({ mensaje: "Registro exitoso", usuario: nuevo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en servidor" });
  }
});

// ===========================================
// LOGIN NORMAL (CORREO + CONTRASEÑA)
// ===========================================
router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  const usuario = await UsuarioPin.findOne({ email });
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  // Bloqueo general por intentos con PIN
  if (usuario.pinBloqueadoHasta && usuario.pinBloqueadoHasta > new Date()) {
    const restante = Math.ceil((usuario.pinBloqueadoHasta - new Date()) / 1000);
    return res.status(403).json({
      mensaje: "Cuenta temporalmente bloqueada",
      restante,
    });
  }

  const coincide = bcrypt.compareSync(contraseña, usuario.contraseña);
  if (!coincide) return res.status(400).json({ mensaje: "Contraseña incorrecta" });

  res.json({
    mensaje: "Login exitoso",
    usuario: {
      email: usuario.email,
      tienePin: usuario.pinHash ? true : false,
    },
  });
});

// ===========================================
// LOGIN POR PIN
// ===========================================
router.post("/login-pin", async (req, res) => {
  const { email, pin } = req.body;

  const usuario = await UsuarioPin.findOne({ email });
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  // 🔥 Si NO tiene PIN configurado
  if (!usuario.pinHash) {
    return res.status(400).json({
      requierePin: true,
      mensaje: "Para iniciar sesión con PIN primero necesitas configurarlo.",
    });
  }

  // 🔥 bloqueo temporal
  if (usuario.pinBloqueadoHasta && usuario.pinBloqueadoHasta > new Date()) {
    const restante = Math.ceil((usuario.pinBloqueadoHasta - new Date()) / 1000);

    return res.status(403).json({
      mensaje: "PIN bloqueado por intentos fallidos.",
      restante,
    });
  }

  const coincide = bcrypt.compareSync(pin, usuario.pinHash);
  if (!coincide) {
    usuario.pinIntentosFallidos += 1;

    if (usuario.pinIntentosFallidos >= 3) {
      usuario.pinBloqueadoHasta = new Date(Date.now() + 5 * 60 * 1000);
      usuario.pinIntentosFallidos = 0;
    }

    await usuario.save();
    return res.status(400).json({ mensaje: "PIN incorrecto" });
  }

  // Si el PIN es correcto
  usuario.pinIntentosFallidos = 0;
  await usuario.save();

  res.json({
    mensaje: "Login exitoso",
    usuario: {
      email: usuario.email,
      tienePin: true,
    },
  });
});

// ===========================================
// CONFIGURAR NUEVO PIN
// ===========================================
router.post("/configurar-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!validarPin(pin)) {
      return res.status(400).json({
        mensaje:
          "PIN inválido. No puede ser repetitivo, secuencial o patrón 1212.",
      });
    }

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    usuario.pinHash = bcrypt.hashSync(pin, 10);
    usuario.pinIntentosFallidos = 0;
    usuario.pinBloqueadoHasta = null;

    await usuario.save();

    res.json({ mensaje: "PIN configurado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al configurar PIN" });
  }
});

module.exports = router;
