import { Agendamento } from "../../src/lib/models/Agendamento.js";

const todayStr = new Date().toISOString().split("T")[0];

// "Juliana Ramos" e "Marcos Vieira" não estão em ALUNOS_INIT — alunoId fica null
const DADOS = [
  { alunoNome: "Ana Beatriz Silva",    data: todayStr, horaInicio: "08:00", horaFim: "09:00", instrutor: "João Carlos",    tipo: "Aparelho",     status: "confirmado", obs: "" },
  { alunoNome: "Carlos Eduardo Matos", data: todayStr, horaInicio: "07:00", horaFim: "08:00", instrutor: "Maria Luiza",    tipo: "Solo",         status: "confirmado", obs: "" },
  { alunoNome: "Fernanda Costa Lima",  data: todayStr, horaInicio: "10:00", horaFim: "11:00", instrutor: "João Carlos",    tipo: "Aparelho",     status: "pendente",   obs: "Confirmação pendente" },
  { alunoNome: "Rodrigo Alves Pinto",  data: todayStr, horaInicio: "19:00", horaFim: "20:00", instrutor: "Ana Paula",      tipo: "Funcional",    status: "confirmado", obs: "" },
  { alunoNome: "Juliana Ramos",        data: todayStr, horaInicio: "09:00", horaFim: "10:00", instrutor: "Maria Luiza",    tipo: "Experimental", status: "pendente",   obs: "Primeira aula" },
  { alunoNome: "Marcos Vieira",        data: todayStr, horaInicio: "18:00", horaFim: "19:00", instrutor: "Pedro Henrique", tipo: "Solo",         status: "confirmado", obs: "" },
];

/**
 * @param {Object} alunosByNome - mapa { nome: ObjectId } retornado por seedAlunos()
 */
export async function seedAgendamentos(alunosByNome) {
  const docs = await Agendamento.insertMany(
    DADOS.map(ag => ({
      ...ag,
      alunoId: alunosByNome[ag.alunoNome] ?? null,
    }))
  );
  console.log(`  ✓ ${docs.length} agendamentos inseridos`);
}
