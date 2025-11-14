require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database');

// Conectar BD
conectarDB();

const app = express();

app.use(express.json());
app.use(cors());

// --- SOLO LAS RUTAS QUE USAS ---
const benildeRoutes = require("./rutas/RuthBenilde");
const erickRoutes = require("./rutas/RuthErick");
const usuarioBaseRoutes = require("./rutas/RuthUsuarioBase");

app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente en Vercel!');
});

app.use("/benilde", benildeRoutes);
app.use("/erick", erickRoutes);
app.use("/usuario-base", usuarioBaseRoutes);

// SERVIDOR LOCAL
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local en http://localhost:${PORT}`);
    });
}

// EXPORT PARA VERCEL
module.exports = app;
