import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const modalidadeSchema = new Schema({
  nome:       { type: String, required: true, trim: true },
  descricao:  { type: String, default: "" },
  duracao:    { type: Number, required: true, enum: [30, 45, 60, 75, 90] },
  cor:        { type: String, required: true },
  capacidade: { type: Number, required: true, min: 1 },
}, { timestamps: true });

export const Modalidade = models.Modalidade || model("Modalidade", modalidadeSchema);
