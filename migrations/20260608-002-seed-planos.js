/**
 * Migration: Insere os planos de mensalidade.
 * Planos são dados de configuração de negócio (não dados demo), portanto vivem
 * em migration — não em seeder. Upsert garante idempotência.
 */

const PLANOS = [
  { slug: "1x_mensal",  freq: 1, duracao: "Mensal",     meses: 1, valor: 180 },
  { slug: "1x_trimest", freq: 1, duracao: "Trimestral", meses: 3, valor: 162 },
  { slug: "1x_semest",  freq: 1, duracao: "Semestral",  meses: 6, valor: 144 },
  { slug: "2x_mensal",  freq: 2, duracao: "Mensal",     meses: 1, valor: 280 },
  { slug: "2x_trimest", freq: 2, duracao: "Trimestral", meses: 3, valor: 252 },
  { slug: "2x_semest",  freq: 2, duracao: "Semestral",  meses: 6, valor: 224 },
  { slug: "3x_mensal",  freq: 3, duracao: "Mensal",     meses: 1, valor: 360 },
  { slug: "3x_trimest", freq: 3, duracao: "Trimestral", meses: 3, valor: 324 },
  { slug: "3x_semest",  freq: 3, duracao: "Semestral",  meses: 6, valor: 288 },
];

export async function up(db) {
  const col = db.collection("planos");
  const now = new Date();
  for (const plano of PLANOS) {
    await col.updateOne(
      { slug: plano.slug },
      { $setOnInsert: { ...plano, ativo: true, createdAt: now, updatedAt: now } },
      { upsert: true }
    );
  }
  console.log(`  ${PLANOS.length} planos inseridos/verificados`);
}

export async function down(db) {
  const slugs = PLANOS.map(p => p.slug);
  const result = await db.collection("planos").deleteMany({ slug: { $in: slugs } });
  console.log(`  ${result.deletedCount} planos removidos`);
}
