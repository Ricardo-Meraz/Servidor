const mongoose = require("mongoose");

// Verifica si la URI está disponible
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI no está definido en las variables de entorno.");
  process.exit(1);
}

console.log("🔍 Intentando conectar a MongoDB Atlas...");

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB Atlas:", error.message);
    console.error("🔎 Asegúrate de que MONGO_URI es correcta:", process.env.MONGO_URI);
    process.exit(1);
  }
};

module.exports = conectarDB;
