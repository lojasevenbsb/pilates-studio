import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const mensalidadeSchema = new Schema({
  mes:       { type: String, required: true },
  vencimento:{ type: String, required: true },
  valor:     { type: Number, required: true },
  pago:      { type: Boolean, default: false },
  dataPag:   { type: String, default: null },
  formaPag:  { type: String, default: null },
}, { _id: false });

const frequenciaSchema = new Schema({
  data:     { type: String, required: true },
  presente: { type: Boolean, required: true },
}, { _id: false });

const alunoSchema = new Schema({
  nome:            { type: String, required: true, trim: true },
  telefone:        { type: String, default: "" },
  email:           { type: String, lowercase: true, trim: true, default: "" },
  cpf:             { type: String, default: "" },
  planoId:         { type: String, default: "" },
  periodicidade:   { type: String, default: "" },
  frequencia:      { type: String, default: "" },
  valorPlano:      { type: Number, default: 0 },
  diaVencimento:   { type: String, default: "10" },
  dataInicio:      { type: String, default: "" },
  dataTermino:     { type: String, default: "" },
  diasSemana:      [{ type: Number }],
  horario:         { type: String, default: "" },
  ativo:           { type: Boolean, default: true },
  mensalidades:    [mensalidadeSchema],
  frequencias:     [frequenciaSchema],
  formasPagamento: [{ type: String }],
  // Chaves são o dia da semana (0-6) como string, valor é horário "HH:MM"
  horariosPorDia:  { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

alunoSchema.index({ ativo: 1, nome: 1 });
alunoSchema.index({ "mensalidades.mes": 1, "mensalidades.pago": 1 });

export const Aluno = models.Aluno || model("Aluno", alunoSchema);
