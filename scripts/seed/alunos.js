import { Aluno } from "../../src/lib/models/Aluno.js";

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const daysAgo = n => new Date(today - 86400000 * n).toISOString().split("T")[0];

const DADOS = [
  {
    nome: "Ana Beatriz Silva", telefone: "(11) 99999-1111", email: "ana@email.com", cpf: "111.222.333-44",
    planoId: "3x_mensal", periodicidade: "mensal", frequencia: "3", valorPlano: 360, diaVencimento: "10",
    dataInicio: "2024-01-10", diasSemana: [1, 3, 5], horario: "08:00", ativo: true,
    mensalidades: [
      { mes: "2026-05", vencimento: "2026-05-10", valor: 360, pago: true,  dataPag: "2026-05-05", formaPag: "Pix" },
      { mes: "2026-06", vencimento: "2026-06-10", valor: 360, pago: false, dataPag: null, formaPag: null },
    ],
    frequencias: [
      { data: daysAgo(2), presente: true  },
      { data: daysAgo(5), presente: true  },
      { data: daysAgo(7), presente: false },
    ],
    formasPagamento: ["Pix", "Cartão de Crédito"],
  },
  {
    nome: "Carlos Eduardo Matos", telefone: "(11) 98888-2222", email: "carlos@email.com", cpf: "222.333.444-55",
    planoId: "2x_trimest", periodicidade: "trimestral", frequencia: "2", valorPlano: 252, diaVencimento: "10",
    dataInicio: "2026-03-01", diasSemana: [2, 4], horario: "07:00", ativo: true,
    mensalidades: [
      { mes: "2026-04", vencimento: "2026-04-10", valor: 252, pago: true,  dataPag: "2026-04-02", formaPag: "Dinheiro" },
      { mes: "2026-05", vencimento: "2026-05-10", valor: 252, pago: true,  dataPag: "2026-05-03", formaPag: "Pix" },
      { mes: "2026-06", vencimento: "2026-06-10", valor: 252, pago: false, dataPag: null, formaPag: null },
    ],
    frequencias: [
      { data: daysAgo(1), presente: true },
      { data: daysAgo(3), presente: true },
    ],
    formasPagamento: ["Pix", "Dinheiro"],
  },
  {
    nome: "Fernanda Costa Lima", telefone: "(11) 97777-3333", email: "fernanda@email.com", cpf: "333.444.555-66",
    planoId: "1x_semest", periodicidade: "semestral", frequencia: "1", valorPlano: 144, diaVencimento: "10",
    dataInicio: "2026-01-15", diasSemana: [3], horario: "10:00", ativo: true,
    mensalidades: [
      { mes: "2026-05", vencimento: "2026-05-10", valor: 144, pago: true,  dataPag: "2026-05-01", formaPag: "Cartão de Crédito" },
      { mes: "2026-06", vencimento: "2026-06-10", valor: 144, pago: false, dataPag: null, formaPag: null },
    ],
    frequencias: [],
    formasPagamento: ["Cartão de Crédito"],
  },
  {
    nome: "Rodrigo Alves Pinto", telefone: "(11) 96666-4444", email: "rodrigo@email.com", cpf: "444.555.666-77",
    planoId: "2x_mensal", periodicidade: "mensal", frequencia: "2", valorPlano: 280, diaVencimento: "10",
    dataInicio: "2026-02-01", diasSemana: [1, 4], horario: "19:00", ativo: true,
    mensalidades: [
      { mes: "2026-05", vencimento: "2026-05-10", valor: 280, pago: true,  dataPag: "2026-05-04", formaPag: "Dinheiro" },
      { mes: "2026-06", vencimento: "2026-06-10", valor: 280, pago: false, dataPag: null, formaPag: null },
    ],
    frequencias: [],
    formasPagamento: ["Dinheiro", "Pix"],
  },
];

/**
 * Retorna mapa { nome: ObjectId } para uso no seeder de agendamentos.
 */
export async function seedAlunos() {
  const docs = await Aluno.insertMany(DADOS);
  const byNome = {};
  docs.forEach(doc => { byNome[doc.nome] = doc._id; });
  console.log(`  ✓ ${docs.length} alunos inseridos`);
  return byNome;
}
