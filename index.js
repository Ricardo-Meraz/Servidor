require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./Config/database'); 

// Importar rutas
const productosRoutes = require('./rutas/RuthProductos');
const usuariosRoutes = require('./rutas/RuthUsuarios');

// Conectar a la base de datos
conectarDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente!');
});

// Usar rutas
app.use('/productos', productosRoutes); // Todas las rutas de productos ahora son /productos
app.use('/usuarios', usuariosRoutes); // Todas las rutas de usuarios ahora son /usuarios

// Definir puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
