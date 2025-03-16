const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    apellidoP: { type: String, required: true },
    apellidoM: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // 🔥 Se cambió "contraseña" a "password" para evitar errores en la API
    sexo: { type: String, enum: ["masculino", "femenino"], required: true },
    edad: { type: Number, required: true },

    // 🔥 Referencia a la colección de Preguntas de Recuperación
    pregunta_recuperacion: {
      type: mongoose.Schema.Types.ObjectId, // ✅ Referencia a la colección PreguntaRecuperacion
      ref: "PreguntaRecuperacion",
      required: true,
    },

    respuesta_recuperacion: { type: String, required: true }, // ✅ Se separa la respuesta para que el usuario la escriba
    rol: { type: String, enum: ["Cliente", "Admin"], default: "Cliente" },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", UsuarioSchema);
module.exports = Usuario;
