const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String,
    categoria: String,
    precio: Number,
    stock: Number,
    imagenUrl: String
});

const Producto = mongoose.model('Producto', ProductoSchema);

module.exports = Producto;
