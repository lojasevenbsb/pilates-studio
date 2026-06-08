#!/usr/bin/env node
/**
 * Migration runner customizado (ESM, sem dependências externas além do mongoose).
 *
 * Uso:
 *   node scripts/migrate.js status   — lista migrations aplicadas e pendentes
 *   node scripts/migrate.js up       — aplica todas as migrations pendentes
 *   node scripts/migrate.js down     — reverte a última migration aplicada
 */
import "dotenv/config";
import mongoose from "mongoose";
import { readdir } from "fs/promises";
import { pathToFileURL } from "url";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(__dirname, "../migrations");
const CHANGELOG_COLLECTION = "_migrations";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pilates";

async function loadMigrations() {
  const files = (await readdir(MIGRATIONS_DIR))
    .filter(f => f.endsWith(".js"))
    .sort();
  return files;
}

async function getApplied(changelog) {
  const docs = await changelog.find({}).toArray();
  return new Set(docs.map(d => d.name));
}

async function run() {
  const mode = process.argv[2] || "up";

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const changelog = db.collection(CHANGELOG_COLLECTION);

  const files = await loadMigrations();
  const applied = await getApplied(changelog);

  if (mode === "status") {
    console.log("\n── Migrations ──────────────────────────────");
    for (const f of files) {
      const state = applied.has(f) ? "✓ aplicada" : "○ pendente";
      console.log(`  ${state}  ${f}`);
    }
    const pending = files.filter(f => !applied.has(f));
    console.log(`\n  ${applied.size} aplicada(s) · ${pending.length} pendente(s)`);

  } else if (mode === "up") {
    const pending = files.filter(f => !applied.has(f));
    if (!pending.length) {
      console.log("Nenhuma migration pendente.");
    }
    for (const file of pending) {
      const mod = await import(pathToFileURL(resolve(MIGRATIONS_DIR, file)).href);
      console.log(`→ Aplicando: ${file}`);
      await mod.up(db);
      await changelog.insertOne({ name: file, appliedAt: new Date() });
      console.log(`  ✓ Concluída`);
    }

  } else if (mode === "down") {
    const appliedList = (await changelog.find({}).sort({ appliedAt: -1 }).limit(1).toArray());
    if (!appliedList.length) {
      console.log("Nenhuma migration para reverter.");
    } else {
      const last = appliedList[0];
      const mod = await import(pathToFileURL(resolve(MIGRATIONS_DIR, last.name)).href);
      console.log(`→ Revertendo: ${last.name}`);
      await mod.down(db);
      await changelog.deleteOne({ name: last.name });
      console.log(`  ✓ Revertida`);
    }

  } else {
    console.error(`Comando desconhecido: "${mode}". Use: status | up | down`);
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log("");
}

run().catch(err => {
  console.error("Erro na migration:", err.message);
  process.exit(1);
});
