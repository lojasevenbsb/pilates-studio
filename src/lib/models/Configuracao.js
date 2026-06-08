import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const horarioDiaSchema = new Schema({
  dia:        { type: Number, required: true },
  label:      { type: String, required: true },
  ativo:      { type: Boolean, default: true },
  abertura:   { type: String, default: "07:00" },
  fechamento: { type: String, default: "21:00" },
  intervalo:  { type: Number, default: 60 },
}, { _id: false });

// Documento singleton — _id fixo como "estudio"
const configuracaoSchema = new Schema({
  _id:     { type: String },
  horario: [horarioDiaSchema],
}, { timestamps: true });

export const Configuracao = models.Configuracao || model("Configuracao", configuracaoSchema);
