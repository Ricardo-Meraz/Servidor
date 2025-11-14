require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/database');

// Conectar BD
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

// EXISTENTES
const productosRoutes = require('./rutas/RuthProductos');
const misionVisionRoutes = require('./rutas/RuthMisionVision');
const historialAntecedentesRoutes = require('./rutas/RuthHistorial-Antecedentes');
const politicasRoutes = require('./rutas/RuthPoliticas');
const dispositivosRoutes = require('./rutas/RuthDispositivos');
const empresaRoutes = require('./rutas/RuthEmpresa');
const usuarioinfoRoutes = require('./rutas/RuthUsuarioinfo');
const faqRoutes = require("./rutas/RuthFaq");

// NUEVAS
const benildeRoutes = require("./rutas/RuthBenilde");
const erickRoutes = require("./rutas/RuthErick");
const usuarioBaseRoutes = require("./rutas/RuthusuarioBase"); 
// OJO: aquí va con u minúscula, como se llama en el repo

// =======================
//  RUTA DE PRUEBA
// =======================
app.get('/', (req, res) => {
    res.send('✅ Servidor funcionando correctamente en Vercel!');
});

// =======================
//  USO DE RUTAS
// =======================
app.use('/productos', productosRoutes);
app.use('/mision-vision', misionVisionRoutes);
app.use('/historial-antecedentes', historialAntecedentesRoutes);
app.use('/politicas', politicasRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/empresa', empresaRoutes);
app.use('/usuarioinfo', usuarioinfoRoutes);
app.use('/faq', faqRoutes);

app.use('/benilde', benildeRoutes);
app.use('/erick', erickRoutes);
app.use('/usuario-base', usuarioBaseRoutes);

// =======================
//  SERVER LOCAL
// =======================
if (pro
