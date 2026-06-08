import { useState } from "react";
import { ICONES_FORMA, todayStr } from "../constants/index.js";
import { brl, mesLabel, primeiroNome } from "../utils/format.js";

/**
 * Página Financeiro — cards de mensalidade por mês com filtros Pago / Aberto.
 */
export default function Financas({ alunos, onPago, onDetalhe }) {
  const [mes, setMes]       = useState(todayStr.slice(0, 7));
  const [filtro, setFiltro] = useState("todos");

  const lista = alunos.filter(a => {
    const m = a.mensalidades.find(m => m.mes === mes);
    if (!m) return false;
    if (filtro === "pago"   && !m.pago) return false;
    if (filtro === "aberto" &&  m.pago) return false;
    return true;
  });

  const totPago   = alunos.reduce((s, a) => { const m = a.mensalidades.find(m => m.mes === mes && m.pago);  return m ? s + m.valor : s; }, 0);
  const totAberto = alunos.reduce((s, a) => { const m = a.mensalidades.find(m => m.mes === mes && !m.pago); return m ? s + m.valor : s; }, 0);

  return (
    <>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
        💳 Financeiro e Pagamento
      </div>

      {/* Totais */}
      <div className="stat-grid" style={{ marginBottom:12 }}>
        <div className="stat grn"><div className="stat-num" style={{ fontSize:20 }}>{brl(totPago)}</div><div className="stat-label">Recebido</div></div>
        <div className="stat red"><div className="stat-num" style={{ fontSize:20 }}>{brl(totAberto)}</div><div className="stat-label">Em aberto</div></div>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input type="month" className="form-input" style={{ flex:1 }} value={mes} onChange={e => setMes(e.target.value)} />
        <select className="form-input" style={{ flex:1 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pago">Pagos</option>
          <option value="aberto">Em aberto</option>
        </select>
      </div>

      {/* Cards */}
      {lista.length === 0
        ? <div className="empty"><div className="empty-ico">💳</div><p>Nenhum registro</p></div>
        : lista.map(a => {
            const m          = a.mensalidades.find(mm => mm.mes === mes);
            const numParcela = a.mensalidades.findIndex(mm => mm.mes === mes) + 1;
            return (
              <div
                key={a.id}
                onClick={() => onDetalhe(a)}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background: m?.pago ? "#f0faf3" : "#fff",
                  border:`1.5px solid ${m?.pago ? "#a8c5ab" : "#e8e0d0"}`,
                  borderRadius:12, padding:"14px 16px", marginBottom:8,
                  transition:"all .15s", cursor:"pointer",
                }}
              >
                {/* Número + nome + data */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: m?.pago ? "#3b5c3e" : "#f4efe5",
                    fontSize:12, fontWeight:700, color: m?.pago ? "#fff" : "#8c8c8c", flexShrink:0,
                  }}>{numParcela}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#1e1e1e" }}>{primeiroNome(a.nome)}</div>
                    <div style={{ fontSize:12, color:"#666", marginTop:2 }}>
                      {m?.vencimento
                        ? new Date(m.vencimento + "T12:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })
                        : `Vence dia ${a.diaVencimento || 10}`}
                    </div>
                    {m?.pago && m?.dataPag && (
                      <div style={{ fontSize:11, color:"#2e7d46", fontWeight:600, marginTop:2 }}>
                        Pago em {new Date(m.dataPag + "T12:00").toLocaleDateString("pt-BR")}
                        {m.formaPag && <span style={{ marginLeft:6 }}>{ICONES_FORMA[m.formaPag] || ""} {m.formaPag}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Valor + ação */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#1e1e1e" }}>{brl(m?.valor || 0)}</span>
                  {m?.pago ? (
                    <span style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:700, background:"#3b5c3e", color:"#fff" }}>
                      ✓ Pago
                    </span>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); onPago(a.id, mes); }}
                      style={{ padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, background:"#fef3e2", color:"#c47a0a" }}
                    >◷ Pagar</button>
                  )}
                </div>
              </div>
            );
          })
      }
    </>
  );
}
