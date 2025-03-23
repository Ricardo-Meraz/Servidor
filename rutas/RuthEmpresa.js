const express = require("express");
const router = express.Router();

// Importamos el modelo de Empresa
const Empresa = require("../Models/ModelEmpresa");

// CREATE (POST) - Agregar una empresa
router.post("/", async (req, res) => {
  try {
    const nuevaEmpresa = new Empresa(req.body);
    const empresaGuardada = await nuevaEmpresa.save();
    res.status(201).json(empresaGuardada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL (GET) - Ver todas las empresas
router.get("/", async (req, res) => {
  try {
    const empresas = await Empresa.find();
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ by ID (GET) - Ver empresa por ID
router.get("/:id", async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }
    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE (PUT) - Editar empresa por ID
router.put("/:id", async (req, res) => {
  try {
    const empresaActualizada = await Empresa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devuelve el documento ya actualizado
    );
    if (!empresaActualizada) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }
    res.status(200).json(empresaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE (DELETE) - Eliminar empresa por ID
router.delete("/:id", async (req, res) => {
  try {
    const empresaEliminada = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresaEliminada) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }
    res.status(200).json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
