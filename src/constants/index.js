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

