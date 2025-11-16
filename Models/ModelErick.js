const mongoose = require("mongoose");

const ModelErickSchema = new mongoose.Schema({

  usuario: { type: String, required: true },   // ✔ AQUÍ TAMBIÉN

  code: { type: String, default: null },
  expiracion: { type: Date, default: null },
  recovery_token: { type: String, default: null },
  recovery_exp: { type: Date, default: null },
  verified: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("ModelErick", ModelErickSchema);
