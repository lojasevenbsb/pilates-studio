import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const agendamentoSchema = new Schema({
  // alunoId pode ser null para agendamentos de alunos não cadastrados (experimentais)
  alunoId:    { type: Schema.Types.ObjectId, ref: "Aluno", default: null },
  alunoNome:  { type: String, required: true },
  data:       { type: String, required: true },
  horaInicio: { type: String, required: true },
  horaFim:    { type: String, required: true },
  instrutor:  { type: String, default: "" },
  tipo:       { type: String, default: "Aparelho" },
  status:     { type: String, enum: ["confirmado", "pendente", "cancelado"], default: "confirmado" },
  obs:        { type: String, default: "" },
}, { timestamps: true });

agendamentoSchema.index({ data: 1, horaInicio: 1 });
agendamentoSchema.index({ alunoId: 1, data: 1 });

export const Agendamento = models.Agendamento || model("Agendamento", agendamentoSchema);
