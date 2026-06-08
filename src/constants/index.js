// ── Datas ────────────────────────────────────────────────────────────────────
export const today    = new Date();
export const todayStr = today.toISOString().split("T")[0];
export const todayDow = today.getDay();

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ── Planos ───────────────────────────────────────────────────────────────────
export const PLANOS = [
  { id:"1x_mensal",  freq:1, duracao:"Mensal",     meses:1, valor:180 },
  { id:"1x_trimest", freq:1, duracao:"Trimestral", meses:3, valor:162 },
  { id:"1x_semest",  freq:1, duracao:"Semestral",  meses:6, valor:144 },
  { id:"2x_mensal",  freq:2, duracao:"Mensal",     meses:1, valor:280 },
  { id:"2x_trimest", freq:2, duracao:"Trimestral", meses:3, valor:252 },
  { id:"2x_semest",  freq:2, duracao:"Semestral",  meses:6, valor:224 },
  { id:"3x_mensal",  freq:3, duracao:"Mensal",     meses:1, valor:360 },
  { id:"3x_trimest", freq:3, duracao:"Trimestral", meses:3, valor:324 },
  { id:"3x_semest",  freq:3, duracao:"Semestral",  meses:6, valor:288 },
];

export const PERIODICIDADES = { mensal: 1, trimestral: 3, semestral: 6 };

export const FORMAS_PAGAMENTO = [
  "Pix", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Dinheiro",
];

export const ICONES_FORMA = {
  "Pix":              "⚡",
  "Cartão de Crédito":"💳",
  "Cartão de Débito": "💳",
  "Boleto":           "📄",
  "Dinheiro":         "💵",
};

export const DIAS_VENCIMENTO = [
  "5","10","15","20","25","30",
];

export const TIPOS_AULA_PADRAO = [
  "Aparelho", "Solo", "Experimental", "Reabilitação", "Funcional",
];

export const PRESET_CORES = [
  "#3b5c3e","#5c6e7f","#7f5c3e","#5c3e7f","#7f3e5c",
  "#3e5c7f","#5c7f3e","#7f6e3e","#3e7f6e","#c47a0a",
];

export const DURACOES_AULA = [30, 45, 60, 75, 90];

// ── Dados iniciais ────────────────────────────────────────────────────────────
export const INSTRUTORES_INIT = [
  { id:1, nome:"João Carlos",    email:"joao@studio.com",  telefone:"(61) 99111-0001", status:"ativo", foto:null, modalidades:[1,2] },
  { id:2, nome:"Maria Luiza",    email:"maria@studio.com", telefone:"(61) 99111-0002", status:"ativo", foto:null, modalidades:[1,3] },
  { id:3, nome:"Ana Paula",      email:"ana@studio.com",   telefone:"(61) 99111-0003", status:"ativo", foto:null, modalidades:[2,4] },
  { id:4, nome:"Pedro Henrique", email:"pedro@studio.com", telefone:"(61) 99111-0004", status:"ativo", foto:null, modalidades:[1]   },
];

export const MODALIDADES_INIT = [
  { id:1, nome:"Aparelho",     descricao:"Pilates com equipamentos",       duracao:60, cor:"#3b5c3e", capacidade:4 },
  { id:2, nome:"Solo",         descricao:"Pilates no solo",                duracao:60, cor:"#5c6e7f", capacidade:6 },
  { id:3, nome:"Funcional",    descricao:"Treino funcional completo",      duracao:45, cor:"#7f5c3e", capacidade:8 },
  { id:4, nome:"Experimental", descricao:"Aula experimental / avaliação", duracao:45, cor:"#5c3e7f", capacidade:2 },
];

export const HORARIO_ESTUDIO_INIT = [
  { dia:1, label:"Seg", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:2, label:"Ter", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:3, label:"Qua", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:4, label:"Qui", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:5, label:"Sex", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:6, label:"Sáb", ativo:true,  abertura:"08:00", fechamento:"14:00", intervalo:60 },
  { dia:0, label:"Dom", ativo:false, abertura:"08:00", fechamento:"12:00", intervalo:60 },
];

const _fmt = d => d.toISOString().split("T")[0];

export const ALUNOS_INIT = [
  { id:1, nome:"Ana Beatriz Silva",    telefone:"(11) 99999-1111", email:"ana@email.com",      cpf:"111.222.333-44",
    planoId:"3x_mensal",  periodicidade:"mensal",  frequencia:"3", valorPlano:360, diaVencimento:"10",
    dataInicio:"2024-01-10", diasSemana:[1,3,5], horario:"08:00", ativo:true,
    mensalidades:[
      { mes:"2026-05", vencimento:"2026-05-10", valor:360, pago:true,  dataPag:"2026-05-05", formaPag:"Pix" },
      { mes:"2026-06", vencimento:"2026-06-10", valor:360, pago:false, dataPag:null, formaPag:null },
    ],
    frequencias:[
      { data:_fmt(new Date(today - 86400000*2)), presente:true  },
      { data:_fmt(new Date(today - 86400000*5)), presente:true  },
      { data:_fmt(new Date(today - 86400000*7)), presente:false },
    ],
    formasPagamento:["Pix","Cartão de Crédito"],
  },
  { id:2, nome:"Carlos Eduardo Matos", telefone:"(11) 98888-2222", email:"carlos@email.com",   cpf:"222.333.444-55",
    planoId:"2x_trimest", periodicidade:"trimestral", frequencia:"2", valorPlano:252, diaVencimento:"10",
    dataInicio:"2026-03-01", diasSemana:[2,4], horario:"07:00", ativo:true,
    mensalidades:[
      { mes:"2026-04", vencimento:"2026-04-10", valor:252, pago:true,  dataPag:"2026-04-02", formaPag:"Dinheiro" },
      { mes:"2026-05", vencimento:"2026-05-10", valor:252, pago:true,  dataPag:"2026-05-03", formaPag:"Pix" },
      { mes:"2026-06", vencimento:"2026-06-10", valor:252, pago:false, dataPag:null, formaPag:null },
    ],
    frequencias:[
      { data:_fmt(new Date(today - 86400000*1)), presente:true },
      { data:_fmt(new Date(today - 86400000*3)), presente:true },
    ],
    formasPagamento:["Pix","Dinheiro"],
  },
  { id:3, nome:"Fernanda Costa Lima",  telefone:"(11) 97777-3333", email:"fernanda@email.com", cpf:"333.444.555-66",
    planoId:"1x_semest",  periodicidade:"semestral", frequencia:"1", valorPlano:144, diaVencimento:"10",
    dataInicio:"2026-01-15", diasSemana:[3], horario:"10:00", ativo:true,
    mensalidades:[
      { mes:"2026-05", vencimento:"2026-05-10", valor:144, pago:true,  dataPag:"2026-05-01", formaPag:"Cartão de Crédito" },
      { mes:"2026-06", vencimento:"2026-06-10", valor:144, pago:false, dataPag:null, formaPag:null },
    ],
    frequencias:[], formasPagamento:["Cartão de Crédito"],
  },
  { id:4, nome:"Rodrigo Alves Pinto",  telefone:"(11) 96666-4444", email:"rodrigo@email.com",  cpf:"444.555.666-77",
    planoId:"2x_mensal",  periodicidade:"mensal",  frequencia:"2", valorPlano:280, diaVencimento:"10",
    dataInicio:"2026-02-01", diasSemana:[1,4], horario:"19:00", ativo:true,
    mensalidades:[
      { mes:"2026-05", vencimento:"2026-05-10", valor:280, pago:true,  dataPag:"2026-05-04", formaPag:"Dinheiro" },
      { mes:"2026-06", vencimento:"2026-06-10", valor:280, pago:false, dataPag:null, formaPag:null },
    ],
    frequencias:[], formasPagamento:["Dinheiro","Pix"],
  },
];

export const AGENDAMENTOS_INIT = [
  { id:1, alunoNome:"Ana Beatriz Silva",    data:todayStr, horaInicio:"08:00", horaFim:"09:00", instrutor:"João Carlos",    tipo:"Aparelho",     status:"confirmado", obs:"" },
  { id:2, alunoNome:"Carlos Eduardo Matos", data:todayStr, horaInicio:"07:00", horaFim:"08:00", instrutor:"Maria Luiza",    tipo:"Solo",         status:"confirmado", obs:"" },
  { id:3, alunoNome:"Fernanda Costa Lima",  data:todayStr, horaInicio:"10:00", horaFim:"11:00", instrutor:"João Carlos",    tipo:"Aparelho",     status:"pendente",   obs:"Confirmação pendente" },
  { id:4, alunoNome:"Rodrigo Alves Pinto",  data:todayStr, horaInicio:"19:00", horaFim:"20:00", instrutor:"Ana Paula",      tipo:"Funcional",    status:"confirmado", obs:"" },
  { id:5, alunoNome:"Juliana Ramos",        data:todayStr, horaInicio:"09:00", horaFim:"10:00", instrutor:"Maria Luiza",    tipo:"Experimental", status:"pendente",   obs:"Primeira aula" },
  { id:6, alunoNome:"Marcos Vieira",        data:todayStr, horaInicio:"18:00", horaFim:"19:00", instrutor:"Pedro Henrique", tipo:"Solo",         status:"confirmado", obs:"" },
];
