import { Instrutor } from "../../src/lib/models/Instrutor.js";

const DADOS = [
  { nome: "João Carlos",    email: "joao@studio.com",  telefone: "(61) 99111-0001", status: "ativo", foto: null, modalidades: [1, 2] },
  { nome: "Maria Luiza",    email: "maria@studio.com", telefone: "(61) 99111-0002", status: "ativo", foto: null, modalidades: [1, 3] },
  { nome: "Ana Paula",      email: "ana@studio.com",   telefone: "(61) 99111-0003", status: "ativo", foto: null, modalidades: [2, 4] },
  { nome: "Pedro Henrique", email: "pedro@studio.com", telefone: "(61) 99111-0004", status: "ativo", foto: null, modalidades: [1] },
];

/**
 * @param {Object} modalidadesById - mapa { legacyId: ObjectId } retornado por seedModalidades()
 * Retorna mapa { nome: ObjectId } para uso em outros seeders.
 */
export async function seedInstrutores(modalidadesById) {
  const docs = await Instrutor.insertMany(
    DADOS.map(i => ({
      ...i,
      modalidades: i.modalidades.map(id => modalidadesById[id]),
    }))
  );
  const byNome = {};
  docs.forEach(doc => { byNome[doc.nome] = doc._id; });
  console.log(`  ✓ ${docs.length} instrutores inseridos`);
  return byNome;
}
