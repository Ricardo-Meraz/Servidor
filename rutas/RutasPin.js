const express = require("express");
const bcrypt = require("bcryptjs");
const UsuarioPin = require("../Models/UsuarioPin");

const router = express.Router();

/* ============================================================
   🔐 VALIDACIONES DE PIN
=============================================================== */

function esSecuenciaAscendente(pin) {
  for (let i = 1; i < pin.length; i++) {
    if (Number(pin[i]) - Number(pin[i - 1]) !== 1) return false;
  }
  return true;
}

function esSecuenciaDescendente(pin) {
  for (let i = 1; i < pin.length; i++) {
    if (Number(pin[i - 1]) - Number(pin[i]) !== 1) return false;
  }
  return true;
}

function esMismoNumero(pin) {
  return /^(\d)\1+$/.test(pin); // 1111, 4444, etc
}

function esPatronRepetido(pin) {
  const len = pin.length;
  if (len % 2 === 0) {
    const mitad = len / 2;
    const sub = pin.slice(0, mitad);
    if (sub.repeat(2) === pin) return true;
  }
  return false;
}

function validarPin(pin) {
  if (!/^\d{4,6}$/.test(pin)) {
    return { ok: false, msg: "El PIN debe tener entre 4 y 6 dígitos." };
  }
  if (esSecuenciaAscendente(pin) || esSecuenciaDescendente(pin)) {
    return { ok: false, msg: "No se permiten secuencias (1234, 9876)." };
  }
  if (esMismoNumero(pin)) {
    return { ok: false, msg: "No se permiten números repetidos (1111)." };
  }
  if (esPatronRepetido(pin)) {
    return { ok: false, msg: "No se permiten patrones repetidos (1212)." };
  }
  return { ok: true };
}

/* ============================================================
   🟦 REGISTRO (email + contraseña)
=============================================================== */

router.post("/registro", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ mensaje: "Faltan datos." });
    }

    const existe = await UsuarioPin.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "El email ya está registrado." });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    await UsuarioPin.create({
      email,
      contraseña: hash,
    });

    res.json({ mensaje: "Usuario registrado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno en registro." });
  }
});

/* ============================================================
   🟦 LOGIN (correo + contraseña)
=============================================================== */

router.post("/login", async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Email no registrado." });
    }

    const ok = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!ok) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta." });
    }

    res.json({
      mensaje: "Login correcto.",
      usuario: {
        email: usuario.email,
        tienePin: !!usuario.pinHash,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en login." });
  }
});

/* ============================================================
   🟦 SABER SI EL USUARIO YA TIENE PIN CONFIGURADO
=============================================================== */

router.get("/tiene-pin", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ mensaje: "Se requiere email." });
    }

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    res.json({ tienePin: !!usuario.pinHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al verificar PIN." });
  }
});

/* ============================================================
   🟦 CONFIGURAR O CAMBIAR PIN
=============================================================== */

router.post("/configurar-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    // VALIDAR PIN
    const validacion = validarPin(pin);
    if (!validacion.ok) {
      return res.status(400).json({ mensaje: validacion.msg });
    }

    const hash = await bcrypt.hash(pin, 10);

    usuario.pinHash = hash;
    usuario.pinIntentosFallidos = 0;
    usuario.pinBloqueadoHasta = null;

    await usuario.save();

    res.json({ mensaje: "PIN configurado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al configurar PIN." });
  }
});

/* ============================================================
   🟦 LOGIN POR PIN
   - 3 intentos fallidos → bloquear 5 min
=============================================================== */

router.post("/login-pin", async (req, res) => {
  try {
    const { email, pin } = req.body;

    const usuario = await UsuarioPin.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    // ¿Está bloqueado?
    if (usuario.pinBloqueadoHasta && usuario.pinBloqueadoHasta > Date.now()) {
      const minutos = Math.ceil((usuario.pinBloqueadoHasta - Date.now()) / 60000);
      return res.status(403).json({
        mensaje: `Cuenta bloqueada. Intenta en ${minutos} minuto(s).`,
      });
    }

    // Validar PIN
    const ok = await bcrypt.compare(pin, usuario.pinHash || "");

    if (!ok) {
      usuario.pinIntentosFallidos++;

      // ¿Bloqueo?
      if (usuario.pinIntentosFallidos >= 3) {
        usuario.pinBloqueadoHasta = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
        usuario.pinIntentosFallidos = 0;
        await usuario.save();
        return res.status(403).json({
          mensaje: "PIN incorrecto. Cuenta bloqueada por 5 minutos.",
        });
      }

      await usuario.save();

      return res.status(400).json({
        mensaje: `PIN incorrecto. Intentos fallidos: ${usuario.pinIntentosFallidos}/3`,
      });
    }

    // Si el PIN es correcto
    usuario.pinIntentosFallidos = 0;
    usuario.pinBloqueadoHasta = null;
    await usuario.save();

    res.json({
      mensaje: "Login por PIN exitoso.",
      usuario: {
        email: usuario.email,
        tienePin: !!usuario.pinHash,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en login por PIN." });
  }
});

/* ============================================================
   EXPORTAR RUTAS
=============================================================== */

module.exports = router;
