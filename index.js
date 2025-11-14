require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database');

// Conectar a la base de datos
conectarDB();

const app = express();

// =======================
//  MIDDLEWARES
// =======================
app.use(express.json());
app.use(cors());

// =======================
//  IMPORTAR RUTAS
// =======================

// 🔹 TUS RUTAS BASE (ya existentes)
const productosRoutes = require('./rutas/RuthProductos');
const usuariosRoutes = require('./rutas/RuthUsuarios'); // SI SIGUE EXISTIENDO ESTA RUTA
const misionVisionRoutes = require('./rutas/RuthMisionVision');
const historialAntecedentesRoutes = require('./rutas/RuthHistorial-Antecedentes');
const politicasRoutes = require('./rutas/RuthPoliticas');
const dispositivosRoutes = require('./rutas/RuthDispositivos');
const empresaRoutes = require('./rutas/RuthEmpresa');
const usuarioinfoRoutes = require('./rutas/RuthUsuarioinfo');
const faqRoutes = require("./rutas/RuthFaq");

// 🔹 RUTAS NUEVAS (Benilde y Erick)
const benildeRoutes = require("./rutas/RuthBenilde");
const erickRoutes = require("./rutas/RuthErick");

// 🔹 Si quieres reemplazar RuthUsuarios por tu nuevo modelo base:
const usuarioBaseRoutes = require("./rutas/RuthUsuarioBase"); 
// (si no lo usas, quítalo)


// =======================
//  RUTA DE PRUEBA
// =======================
app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente en Vercel!');
});


// =======================
//  USAR RUTAS
// =======================

// → Rutas ya existentes
app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes); // puedes quitarla si ya no usas ese modelo

app.use('/mision-vision', misionVisionRoutes);
app.use('/historial-antecedentes', historialAntecedentesRoutes);
app.use('/politicas', politicasRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/empresa', empresaRoutes);
app.use('/usuarioinfo', usuarioinfoRoutes);
app.use("/faq", faqRoutes);

// → Rutas nuevas
app.use("/benilde", benildeRoutes);
app.use("/erick", erickRoutes);
app.use("/usuario-base", usuarioBaseRoutes); // tu modelo principal nuevo


// =======================
//  SERVIDOR LOCAL
// =======================
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

// =======================
//  EXPORTAR PARA VERCEL
// =======================
module.exports = app;
