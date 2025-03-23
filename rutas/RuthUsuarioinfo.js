const express = require("express");
const router = express.Router();

// Importamos el modelo de Usuario
const Usuario = require("../Models/ModelUsuarioinfo");

// Middleware de ejemplo para verificar que el usuario es admin.
// En un caso real, usarías JWT o sesiones, pero aquí se usa un simple chequeo.
const isAdmin = (req, res, next) => {
    // Supongamos que el middleware establece req.user con la información del usuario.
    // En este ejemplo, verificamos que req.user.role sea "admin".
    if (req.user && req.user.role === "Admin") {
      return next();
    }
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  };
  
  // Ruta GET para que el admin vea todos los usuarios y sus mensajes.
  router.get("/usuarios", isAdmin, async (req, res) => {
    try {
      // Recupera todos los documentos del modelo de Usuario
      const usuarios = await Usuario.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// CREATE (POST) - Agregar un usuario
router.post("/", async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL (GET) - Ver todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ by ID (GET) - Ver usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE (PUT) - Editar usuario por ID
router.put("/:id", async (req, res) => {
  try {
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devuelve el documento ya actualizado
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE (DELETE) - Eliminar usuario por ID
router.delete("/:id", async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
