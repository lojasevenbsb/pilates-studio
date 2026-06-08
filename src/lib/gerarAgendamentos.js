import { proxHora } from "../utils/format.js";

/**
 * Gera agendamentos recorrentes para um aluno a partir dos dados de matrícula.
 * Retorna array de objetos prontos para Agendamento.insertMany().
 */
export function gerarAgendamentos(aluno) {
  if (!aluno.dataInicio || !aluno.dataTermino || !aluno.diasSemana?.length) return [];

  const horarios = aluno.horariosPorDia || {};
  const novos    = [];
  const end      = new Date(aluno.dataTermino + "T12:00");
  const cur      = new Date(aluno.dataInicio  + "T12:00");

  while (cur <= end) {
    const dow = cur.getDay();
    if (aluno.diasSemana.includes(dow)) {
      const horaI = horarios[String(dow)] || aluno.horario || "08:00";
      novos.push({
        alunoId:   aluno._id,
        alunoNome: aluno.nome,
        data:      cur.toISOString().split("T")[0],
        horaInicio:horaI,
        horaFim:   proxHora(horaI),
        instrutor: "",
        tipo:      "Aparelho",
        status:    "pendente",
        obs:       "Gerado automaticamente na matrícula",
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return novos;
}
