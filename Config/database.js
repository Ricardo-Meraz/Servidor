const mongoose = require("mongoose");
console.log("🔍 URI de conexión:", process.env.MONGO_URI);


const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB Atlas:", error);
    process.exit(1); // Finaliza el proceso si hay un error
  }
};

module.exports = conectarDB;