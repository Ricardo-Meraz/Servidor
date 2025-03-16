const PoliticasSchema = new mongoose.Schema({
    politicaDeUso: { type: String, required: true },
    politicaDePrivacidad: { type: String, required: true },
    terminosYCondiciones: { type: String, required: true }
  }, { collection: "Politicas" }); // <-- Forzar nombre exacto
  
  const Politicas = mongoose.model("Politicas", PoliticasSchema);
  module.exports = Politicas;
  