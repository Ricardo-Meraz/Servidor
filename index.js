require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database');

// Conectar BD
conectarDB();

const app = express();

app.use(express.json());
app.use(cors());

// === RUTAS DE PRODUCTOS Y USUARIOS ORIGINALES ===
const productosRoutes = require('./rutas/RuthProductos');
const usuariosRoutes = require('./rutas/RuthUsuarios');

// === RUTAS DE BENILDE, ERICK Y USUARIO BASE ===
const benildeRoutes = require("./rutas/RuthBenilde");
const erickRoutes = require("./rutas/RuthErick");
const usuarioBaseRoutes = require("./rutas/RuthUsuarioBase");

app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente en Vercel!');
});

// === USO DE TODAS LAS RUTAS ===
app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes);
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
