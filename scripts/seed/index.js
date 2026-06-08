#!/usr/bin/env node
/**
 * Seed de desenvolvimento — popula o banco com dados de demonstração.
 *
 * Uso:
 *   node scripts/seed/index.js          — insere se as collections estiverem vazias
 *   node scripts/seed/index.js --reset  — apaga e repopula todas as collections de seed
 *
 * ATENÇÃO: nunca rodar com --reset em produção. O script aborta se NODE_ENV=production.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { seedModalidades } from "./modalidades.js";
import { seedInstrutores }  from "./instrutores.js";
import { seedAlunos }       from "./alunos.js";
import { seedAgendamentos } from "./agendamentos.js";

// Importar models para que os schemas sejam registrados antes de qualquer operação
import "../../src/lib/models/Modalidade.js";
import "../../src/lib/models/Instrutor.js";
import "../../src/lib/models/Aluno.js";
import "../../src/lib/models/Agendamento.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pilates";
const RESET = process.argv.includes("--reset");

// Collections gerenciadas pelo seeder (não toca em planos/configuracoes — são da migration)
const SEED_COLLECTIONS = ["modalidades", "instrutores", "alunos", "agendamentos"];

async function main() {
  if (process.env.NODE_ENV === "production" && RESET) {
    console.error("❌  --reset é proibido em NODE_ENV=production");
    process.exit(1);
  }

  console.log(`\n── Seed ────────────────────────────────────`);
  console.log(`  URI: ${MONGODB_URI.replace(/:\/\/.+@/, "://<credenciais>@")}`);
  console.log(`  Modo: ${RESET ? "reset (apagar + reinserir)" : "insert-if-empty"}\n`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  if (RESET) {
    for (const col of SEED_COLLECTIONS) {
      const { deletedCount } = await db.collection(col).deleteMany({});
      console.log(`  ✗ ${col}: ${deletedCount} documentos removidos`);
    }
    console.log("");
  } else {
    // Verifica se já há dados — aborta se tiver (evita duplicação acidental)
    for (const col of SEED_COLLECTIONS) {
      const count = await db.collection(col).countDocuments();
      if (count > 0) {
        console.log(`  ℹ  Collection "${col}" já tem ${count} documento(s). Use --reset para repopular.`);
        await mongoose.disconnect();
        return;
      }
    }
  }

  // Ordem importa: modalidades → instrutores (FK) → alunos → agendamentos (FK)
  const modalidadesById = await seedModalidades();
  await seedInstrutores(modalidadesById);
  const alunosByNome    = await seedAlunos();
  await seedAgendamentos(alunosByNome);

  console.log("\n  ✓ Seed concluído com sucesso\n");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("\n❌  Erro no seed:", err.message);
  process.exit(1);
});
