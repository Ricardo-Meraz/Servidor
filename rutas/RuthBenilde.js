const express = require("express");
const ModelBenilde = require("../Models/ModelBenilde");

const router = express.Router();

// =========================
// REGISTRO BENILDE
// =========================
router.post("/registro", async (req, res) => {
  try {
    const { usuario } = req.body;
    if (!usuario) return res.status(400).json({ mensaje: "usuario es obligatorio" });

    const nuevo = await ModelBenilde.create({
      usuario,
      pin: null,
      cuenta_bloqueada: false,
      fecha_bloqueo: null,
      intentos_fallidos: 0
    });

    res.status(201).json({ mensaje: "Registro creado", data: nuevo });

  } catch (error) {
    res.status(500).json({ mensaje: "Error en servidor" });
  }
});

// =========================
// LOGIN BENILDE (PIN + BLOQUEOS)
// =========================
router.post("/login", async (req, res) => {
  try {
    const { usuario, pin } = req.body;

    const data = await ModelBenilde.findOne({ usuario });
    if (!data) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (data.cuenta_bloqueada) {
      return res.status(403).json({ mensaje: "Cuenta bloqueada" });
    }

    if (data.pin !== pin) {
      data.intentos_fallidos += 1;

      if (data.intentos_fallidos >= 3) {
        data.cuenta_bloqueada = true;
      }

      await data.save();
      return res.status(400).json({ mensaje: "PIN incorrecto" });
    }

    // Resetear intentos
    data.intentos_fallidos = 0;
    data.cuenta_bloqueada = false;
    await data.save();

    res.json({ mensaje: "Login exitoso", data });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// =========================
// LISTAR
// =========================
router.get("/", async (req, res) => {
  try {
    const docs = await ModelBenilde.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
