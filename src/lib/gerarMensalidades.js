/**
 * Gera array de mensalidades para um aluno.
 * Se `dados.mensalidades` já vier preenchido (formulário de cadastro),
 * normaliza e retorna. Caso contrário, auto-gera com base no plano.
 */
export function gerarMensalidades(dados, plano) {
  if (dados.mensalidades?.length) {
    return dados.mensalidades.map(m => ({
      mes:       m.mes,
      vencimento:m.vencimento,
      valor:     Number(m.valor) || 0,
      pago:      m.pago  || false,
      dataPag:   m.dataPag  || null,
      formaPag:  m.formaPag || null,
    }));
  }

  const meses = plano?.meses || 1;
  const valor = plano?.valor || Number(dados.valorPlano) || 0;
  const dia   = String(dados.diaVencimento || "10").padStart(2, "0");
  const ref   = dados.dataInicio ? new Date(dados.dataInicio + "T12:00") : new Date();

  return Array.from({ length: meses }, (_, i) => {
    const d  = new Date(ref);
    d.setMonth(d.getMonth() + i);
    const mes = d.toISOString().slice(0, 7);
    return { mes, vencimento: `${mes}-${dia}`, valor, pago: false, dataPag: null, formaPag: null };
  });
}
