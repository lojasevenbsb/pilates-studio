/** Formata valor em BRL: R$ 1.234 */
export const brl = v =>
  `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** "2026-06" → "06/2026" */
export const mesLabel = m => {
  const [y, mo] = m.split("-");
  return `${mo}/${y}`;
};

/** Date → "YYYY-MM-DD" */
export const fmtIso = d => d.toISOString().split("T")[0];

/** Iniciais do nome (até 2 palavras) */
export const iniciais = nome =>
  nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

/** Primeiro + segundo nome */
export const primeiroNome = nome => nome.split(" ").slice(0, 2).join(" ");

/** "YYYY-MM-DD" → "DD/MM/YYYY" */
export const fmtData = iso =>
  iso ? iso.split("-").reverse().join("/") : "—";

/** "HH:MM" → "HH:MM" próxima hora (limite 21:00) */
export const proxHora = h => {
  const [hr, mn] = h.split(":").map(Number);
  const n = hr + 1;
  return n > 21 ? "21:00" : `${String(n).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
};
