import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// "slug" é o identificador textual (ex: "3x_mensal"). O campo "id" é reservado pelo
// Mongoose como virtual de _id, por isso usamos "slug" internamente.
// A API REST expõe como { id: slug, ... } para manter compatibilidade com o frontend.
const planoSchema = new Schema({
  slug:     { type: String, required: true, unique: true },
  freq:     { type: Number, required: true },
  duracao:  { type: String, required: true },
  meses:    { type: Number, required: true },
  valor:    { type: Number, required: true },
  ativo:    { type: Boolean, default: true },
}, { timestamps: true });

export const Plano = models.Plano || model("Plano", planoSchema);
