require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database'); // Asegúrate de que esta ruta es correcta

// Conectar a la base de datos
conectarDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Importar rutas existentes
const productosRoutes = require('./rutas/RuthProductos');
const usuariosRoutes = require('./rutas/RuthUsuarios');
const misionVisionRoutes = require('./rutas/RuthMisionVision'); // ✅ Ruta de Misión y Visión
const historialAntecedentesRoutes = require("./rutas/RuthHistorial-Antecedentes"); // ✅ Nueva ruta
const preguntaRecuperacionRoutes = require('./rutas/RuthPreguntaRecuperacion');
const politicasRoutes = require('./rutas/RuthPoliticas'); // ✅ Ruta de Políticas
const dispositivosRoutes = require('./rutas/RuthDispositivos');
const empresaRoutes = require('./rutas/RuthEmpresa');
const usuarioinfoRoutes = require('./rutas/RuthUsuarioinfo');
const faqRoutes = require("./rutas/RuthFaq");


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente en Vercel!');
});

// Usar rutas
app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/mision-vision', misionVisionRoutes);
app.use('/historial-antecedentes', historialAntecedentesRoutes);
app.use('/pregunta-recuperacion', preguntaRecuperacionRoutes);
app.use('/politicas', politicasRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/empresa', empresaRoutes);      
app.use('/usuarioinfo', usuarioinfoRoutes); 
app.use("/faq", faqRoutes); 

// Si estás corriendo localmente, inicia el servidor normalmente
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

// **Corrección para Vercel**: exportar `app`
module.exports = app;
