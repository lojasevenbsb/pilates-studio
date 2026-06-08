/**
 * Migration: Insere o documento singleton de configuração do estúdio.
 * Upsert garante idempotência — nunca sobrescreve dados existentes.
 */

const HORARIO_ESTUDIO = [
  { dia: 1, label: "Seg", ativo: true,  abertura: "07:00", fechamento: "21:00", intervalo: 60 },
  { dia: 2, label: "Ter", ativo: true,  abertura: "07:00", fechamento: "21:00", intervalo: 60 },
  { dia: 3, label: "Qua", ativo: true,  abertura: "07:00", fechamento: "21:00", intervalo: 60 },
  { dia: 4, label: "Qui", ativo: true,  abertura: "07:00", fechamento: "21:00", intervalo: 60 },
  { dia: 5, label: "Sex", ativo: true,  abertura: "07:00", fechamento: "21:00", intervalo: 60 },
  { dia: 6, label: "Sáb", ativo: true,  abertura: "08:00", fechamento: "14:00", intervalo: 60 },
  { dia: 0, label: "Dom", ativo: false, abertura: "08:00", fechamento: "12:00", intervalo: 60 },
];

export async function up(db) {
  const now = new Date();
  await db.collection("configuracoes").updateOne(
    { _id: "estudio" },
    { $setOnInsert: { _id: "estudio", horario: HORARIO_ESTUDIO, createdAt: now, updatedAt: now } },
    { upsert: true }
  );
  console.log("  Configuração do estúdio inserida/verificada");
}

export async function down(db) {
  await db.collection("configuracoes").deleteOne({ _id: "estudio" });
  console.log("  Configuração do estúdio removida");
}
