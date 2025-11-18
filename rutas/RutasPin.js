const express = require("express");
const bcrypt = require("bcryptjs");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

// =========================
// VALIDAR PIN (4–6 dígitos y reglas)
// =========================
function esSecuencial(pin) {
  // 1234, 4567, 9876, 4321, etc.
  let asc = true;
  let desc = true;
  for (let i = 1; i < pin.length; i++) {
    const prev = parseInt(pin[i - 1]);
    const cur = parseInt(pin[i]);
    if (cur !== prev + 1) asc = false;
    if (cur !== prev - 1) desc = false;
  }
  return asc || desc;
}

function todosIguales(pin) {
  return pin.split("").every((d) => d === pin[0]);
}

function esPatronRepetido(pin) {
  // 1212, 4545, 7878, etc.
  if (pin.length % 2 !== 0) return false;
  const mitad = pin.length / 2;
  const p1 = pin.slice(0, mitad);
  const p2 = pin.slice(mitad);
  return p1 === p2;
}

function validarPin(pin) {
  if (pin.length < 4 || pin.length > 6) {
    return "El PIN debe tener entre 4 y 6 dígitos.";
  }
  if (!/^\d+$/.test(pin)) {
    return "El PIN solo debe contener números.";
  }
  if (esSecuencial(pin)) {
    return "El PIN no puede ser secuencial (ej. 1234 o 9876).";
  }
  if (todosIguales(pin)) {
    return "El PIN no puede tener todos los dígitos iguales (ej. 1111).";
  }
  if (esPatronRepetido(pin)) {
    return "El PIN no puede ser un patrón repetido (ej. 1212, 4545).";
  }
  return null;
}

// =========================
// REGISTRO (correo + contraseña normal)
// =========================
router.post("/registro", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res
        .status(400)
        .json({ mensaje: "Correo y contraseña son obligatorios." });
    }

    const existe = await UsuarioPin.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "Este correo ya está registrado." });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevo = await UsuarioPin.create({
      email,
      contraseña: hash,
      pinHash: null,
      pinIntentosFallidos: 0,
      pinBloqueadoHasta: null,
    });

    res.status(201).json({ mensaje: "Usuario registrado correctamente.", usuario: nuevo });
  } catch (error) {
    console.error("Error en /auth-pin/registro:", error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
});

// =========================
// LOGIN por correo + contraseña
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    // Si la cuenta está bloqueada por PIN (bloqueo general)
    if (usuario.pinBloqueadoHasta && usuario.pinBloqueadoHasta > new Date()) {
      const restanteMs = usuario.pinBloqueadoHasta - new Date();
      const restanteSeg = Math.ceil(restanteMs / 1000);
      return res.status(403).json({
        mensaje: "La cuenta está bloqueada por intentos fallidos.",
        restante: restanteSeg,
      });
    }

    const ok = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!ok) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas." });
    }

    res.json({
      mensaje: "Login exitoso.",
      usuario: {
        email: usuario.email,
        tienePin: !!usuario.pinHash,
      },
    });
  } catch (error) {
    console.error("Error en /auth-pin/login:", error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
});

// =========================
// CONSULTAR SI TIENE PIN
// =========================
router.post("/tiene-pin", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado.", tienePin: false });
    }

    const tienePin = !!usuario.pinHash;
    res.json({ tienePin });

  } catch (error) {
    console.error("Error en /auth-pin/tiene-pin:", error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
});

// =========================
// CONFIGURAR / CAMBIAR PIN
// =========================
router.post("/configurar-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    const errorPin = validarPin(pin);
    if (errorPin) {
      return res.status(400).json({ mensaje: errorPin });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    usuario.pinHash = pinHash;
    usuario.pinIntentosFallidos = 0;
    usuario.pinBloqueadoHasta = null;
    await usuario.save();

    res.json({
      mensaje: "PIN guardado correctamente.",
      usuario: {
        email: usuario.email,
        tienePin: true,
      },
    });
  } catch (error) {
    console.error("Error en /auth-pin/configurar-pin:", error);
    res.status(500).json({ mensaje: "Error al configurar PIN." });
  }
});

// =========================
// LOGIN POR PIN
// =========================
router.post("/login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    // Bloqueo general (afecta PIN y correo)
    if (usuario.pinBloqueadoHasta && usuario.pinBloqueadoHasta > new Date()) {
      const restanteMs = usuario.pinBloqueadoHasta - new Date();
      const restanteSeg = Math.ceil(restanteMs / 1000);
      return res.status(403).json({
        mensaje: "La cuenta está bloqueada por intentos fallidos.",
        restante: restanteSeg,
      });
    }

    // Si NO tiene PIN configurado
    if (!usuario.pinHash) {
      return res.status(400).json({
        mensaje: "Este usuario aún no tiene un PIN configurado.",
        necesitaConfigPin: true,
      });
    }

    const esValido = await bcrypt.compare(pin, usuario.pinHash);
    if (!esValido) {
      usuario.pinIntentosFallidos = (usuario.pinIntentosFallidos || 0) + 1;

      if (usuario.pinIntentosFallidos >= 3) {
        const ahora = new Date();
        const cincoMinDespues = new Date(ahora.getTime() + 5 * 60 * 1000);
        usuario.pinBloqueadoHasta = cincoMinDespues;
        usuario.pinIntentosFallidos = 0;
        await usuario.save();

        return res.status(403).json({
          mensaje: "Se excedieron los intentos. Cuenta bloqueada por 5 minutos.",
          restante: 5 * 60,
        });
      }

      await usuario.save();
      return res.status(400).json({
        mensaje: "PIN incorrecto.",
        intentosRestantes: 3 - usuario.pinIntentosFallidos,
      });
    }

    // Si el PIN es correcto
    usuario.pinIntentosFallidos = 0;
    await usuario.save();

    res.json({
      mensaje: "Login por PIN exitoso.",
      usuario: {
        email: usuario.email,
        tienePin: !!usuario.pinHash,
      },
    });
  } catch (error) {
    console.error("Error en /auth-pin/login-pin:", error);
    res.status(500).json({ mensaje: "Error en el servidor." });
  }
});

module.exports = router;
