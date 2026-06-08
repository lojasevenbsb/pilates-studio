/**
 * Migration: Cria índices de consulta nas 4 collections principais.
 * Idempotente — MongoDB ignora createIndex se o índice já existir.
 */

export async function up(db) {
  // alunos: listagem filtrada por ativo + ordenação por nome
  await db.collection("alunos").createIndex({ ativo: 1, nome: 1 });
  // alunos: consulta de inadimplentes por mês
  await db.collection("alunos").createIndex({ "mensalidades.mes": 1, "mensalidades.pago": 1 });

  // agendamentos: agenda diária e semanal
  await db.collection("agendamentos").createIndex({ data: 1, horaInicio: 1 });
  // agendamentos: histórico por aluno
  await db.collection("agendamentos").createIndex({ alunoId: 1, data: 1 });

  // instrutores: listagem por status
  await db.collection("instrutores").createIndex({ status: 1 });

  // planos: lookup por slug (campo de negócio, não o _id)
  await db.collection("planos").createIndex({ slug: 1 }, { unique: true });
}

export async function down(db) {
  await db.collection("alunos").dropIndex("ativo_1_nome_1").catch(() => {});
  await db.collection("alunos").dropIndex("mensalidades.mes_1_mensalidades.pago_1").catch(() => {});
  await db.collection("agendamentos").dropIndex("data_1_horaInicio_1").catch(() => {});
  await db.collection("agendamentos").dropIndex("alunoId_1_data_1").catch(() => {});
  await db.collection("instrutores").dropIndex("status_1").catch(() => {});
  await db.collection("planos").dropIndex("slug_1").catch(() => {});
}
