import { Modalidade } from "../../src/lib/models/Modalidade.js";

const DADOS = [
  { nome: "Aparelho",     descricao: "Pilates com equipamentos",       duracao: 60, cor: "#3b5c3e", capacidade: 4 },
  { nome: "Solo",         descricao: "Pilates no solo",                duracao: 60, cor: "#5c6e7f", capacidade: 6 },
  { nome: "Funcional",    descricao: "Treino funcional completo",      duracao: 45, cor: "#7f5c3e", capacidade: 8 },
  { nome: "Experimental", descricao: "Aula experimental / avaliação", duracao: 45, cor: "#5c3e7f", capacidade: 2 },
];

/**
 * Retorna um mapa { nomeOriginal: ObjectId } para uso nos seeders dependentes.
 * Os nomes coincidem com MODALIDADES_INIT para rastrear a ordem original (1=Aparelho, etc.).
 */
export async function seedModalidades() {
  const docs = await Modalidade.insertMany(DADOS);
  // Mapeia posição (1-indexed) → ObjectId, espelhando os IDs numéricos do MODALIDADES_INIT
  const byLegacyId = {};
  docs.forEach((doc, i) => { byLegacyId[i + 1] = doc._id; });
  console.log(`  ✓ ${docs.length} modalidades inseridas`);
  return byLegacyId;
}
