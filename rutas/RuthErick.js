const express = require("express");
const ModelErick = require("../Models/ModelErick");

const router = express.Router();

// =========================
// REGISTRO ERICK
// =========================
router.post("/registro", async (req, res) => {
  try {
    const { usuario } = req.body;

    if (!usuario) return res.status(400).json({ mensaje: "usuario obligatorio" });

    const nuevo = await ModelErick.create({
      usuario,
      code: null,
      expiracion: null,
      recovery_token: null,
      recovery_exp: null,
      verified: false
    });

    res.status(201).json({ mensaje: "Registro creado", data: nuevo });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// =========================
// GENERAR CÓDIGO
// =========================
router.post("/generar-code", async (req, res) => {
  try {
    const { usuario } = req.body;

    const data = await ModelErick.findOne({ usuario });
    if (!data) return res.status(404).json({ mensaje: "No encontrado" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    data.code = code;
    data.expiracion = new Date(Date.now() + 5 * 60 * 1000);

    await data.save();

    res.json({ mensaje: "Código generado", code });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// =========================
// VERIFICAR CÓDIGO
// =========================
router.post("/verificar-code", async (req, res) => {
  try {
    const { usuario, code } = req.body;

    const data = await ModelErick.findOne({ usuario });
    if (!data) return res.status(404).json({ mensaje: "No encontrado" });

    if (data.code !== code) {
      return res.status(400).json({ mensaje: "Código incorrecto" });
    }

    if (new Date() > data.expiracion) {
      return res.status(400).json({ mensaje: "Código expirado" });
    }

    data.verified = true;
    data.code = null;
    data.expiracion = null;
    await data.save();

    res.json({ mensaje: "Cuenta verificada" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

// =========================
// LISTAR
// =========================
router.get("/", async (req, res) => {
  try {
    const docs = await ModelErick.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
