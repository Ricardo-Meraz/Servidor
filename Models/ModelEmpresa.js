const mongoose = require("mongoose");

const EmpresaSchema = new mongoose.Schema(
  {
    emailInvernaTech: { type: String, required: true },
    telefonoInvernaTech: { type: String, required: true },
    direccionInvernaTech: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
  },
  { collection: "contactanos" }
);

module.exports = mongoose.model("Empresa", EmpresaSchema);
