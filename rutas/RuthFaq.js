const express = require("express");
const router = express.Router();
const Faq = require("../Models/ModelFaq");

// Obtener todas las FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener FAQs", error });
  }
});

// Obtener una FAQ por ID
router.get("/:id", async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ mensaje: "FAQ no encontrada" });
    }
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener FAQ", error });
  }
});

// Agregar una nueva FAQ
router.post("/", async (req, res) => {
  try {
    const nuevaFaq = new Faq(req.body);
    await nuevaFaq.save();
    res
      .status(201)
      .json({ mensaje: "FAQ agregada exitosamente", faq: nuevaFaq });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al agregar FAQ", error });
  }
});

// Editar/Modificar una FAQ por ID
router.put("/:id", async (req, res) => {
  try {
    const faqActualizada = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faqActualizada) {
      return res.status(404).json({ mensaje: "FAQ no encontrada" });
    }
    res.status(200).json({
      mensaje: "FAQ actualizada exitosamente",
      faq: faqActualizada,
    });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar FAQ", error });
  }
});

// Eliminar una FAQ por ID
router.delete("/:id", async (req, res) => {
  try {
    const faqEliminada = await Faq.findByIdAndDelete(req.params.id);
    if (!faqEliminada) {
      return res.status(404).json({ mensaje: "FAQ no encontrada" });
    }
    res.status(200).json({ mensaje: "FAQ eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar FAQ", error });
  }
});

module.exports = router;
