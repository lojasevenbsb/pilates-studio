import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const instrutorSchema = new Schema({
  nome:        { type: String, required: true, trim: true },
  email:       { type: String, lowercase: true, trim: true, default: "" },
  telefone:    { type: String, default: "" },
  status:      { type: String, enum: ["ativo", "inativo"], default: "ativo" },
  foto:        { type: String, default: null },
  modalidades: [{ type: Schema.Types.ObjectId, ref: "Modalidade" }],
}, { timestamps: true });

instrutorSchema.index({ status: 1 });

export const Instrutor = models.Instrutor || model("Instrutor", instrutorSchema);
