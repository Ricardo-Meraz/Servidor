require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); 

// Conectar a MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json()); // Permitir JSON en requests
app.use(cors()); // Habilitar CORS

// Rutas de ejemplo
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando! 🚀');
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
