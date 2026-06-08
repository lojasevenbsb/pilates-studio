import { useState } from "react";
import { PLANOS, DIAS_SEMANA, ICONES_FORMA, todayStr, todayDow } from "../constants/index.js";
import { brl, mesLabel, iniciais } from "../utils/format.js";
import { I } from "../components/Icons.jsx";

/**
 * Detalhe do aluno: abas Info / Mensalidades / Frequência.
 */
export default function DetalheAluno({ aluno, initialTab = "info", onBack, onEdit, onPago, onFreq }) {
  const [tab, setTab] = useState(initialTab);
  const mesAtual      = todayStr.slice(0, 7);
  const p             = PLANOS.find(pl => pl.id === aluno.planoId);
  const freqHoje      = aluno.frequencias.find(f => f.data === todayStr);
  const pct           = aluno.frequencias.length
    ? Math.round(aluno.frequencias.filter(f => f.presente).length / aluno.frequencias.length * 100)
    : 0;

  return (
    <>
      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-av">{iniciais(aluno.nome)}</div>
        <div className="detail-name">{aluno.nome}</div>
        <div className="detail-sub">{p?.freq}x/sem · {p?.duracao} · {brl(p?.valor || 0)}/mês</div>
        <div style={{ marginTop:10, display:"flex", gap:8 }}>
          <span className={`badge ${aluno.ativo ? "ok" : "neu"}`}>{aluno.ativo ? "Ativo" : "Inativo"}</span>
          <button
            className="btn btn-sm"
            style={{ background:"rgba(255,255,255,.2)", color:"#fff", gap:4 }}
            onClick={onEdit}
          >{I.edit} Editar</button>
          <a
            href={`https://wa.me/55${aluno.telefone.replace(/\D/g, "")}`}
            target="_blank" rel="noreferrer"
            className="btn btn-sm"
            style={{ background:"rgba(255,255,255,.2)", color:"#fff", gap:4, textDecoration:"none" }}
          >{I.whats} WhatsApp</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[["info","Info"],["mens","Mensalidades"],["freq","Frequência"]].map(([k, l]) => (
          <div key={k} className={`tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {/* ── Info ── */}
      {tab === "info" && (
        <>
          <div className="info-block">
            <div className="info-row"><span className="lbl">Telefone</span><span className="val">{aluno.telefone}</span></div>
            <div className="info-row"><span className="lbl">E-mail</span><span className="val">{aluno.email}</span></div>
            <div className="info-row"><span className="lbl">CPF</span><span className="val">{aluno.cpf}</span></div>
            <div className="info-row"><span className="lbl">Horário</span><span className="val">{aluno.horario}</span></div>
          </div>
          <div className="info-block">
            <div className="info-row"><span className="lbl">Dias</span><span className="val">{aluno.diasSemana.sort().map(d => DIAS_SEMANA[d]).join(", ")}</span></div>
            <div className="info-row"><span className="lbl">Início</span><span className="val">{new Date(aluno.dataInicio + "T12:00").toLocaleDateString("pt-BR")}</span></div>
            <div className="info-row">
              <span className="lbl">Vencimento</span>
              <span className="val">{aluno.dataVencimento ? new Date(aluno.dataVencimento + "T12:00").toLocaleDateString("pt-BR") : "—"}</span>
            </div>
            <div className="info-row"><span className="lbl">Presença geral</span><span className="val" style={{ color:"var(--gd)" }}>{pct}%</span></div>
          </div>
        </>
      )}

      {/* ── Mensalidades ── */}
      {tab === "mens" && (
        <div className="section">
          {aluno.mensalidades.length === 0
            ? <div className="empty"><div className="empty-ico">💳</div><p>Nenhuma mensalidade gerada</p></div>
            : [...aluno.mensalidades].reverse().map(m => (
                <div key={m.mes} className="row" style={{ cursor:"default" }}>
                  <div style={{ flex:1 }}>
                    <div className="row-name">{mesLabel(m.mes)}</div>
                    <div className="row-sub">
                      {brl(m.valor)} · {m.vencimento
                        ? `vence ${new Date(m.vencimento + "T12:00").toLocaleDateString("pt-BR")}`
                        : "vence dia 10"}
                    </div>
                  </div>
                  {m.pago ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <span className="badge ok" style={{ fontSize:11, padding:"2px 8px", borderRadius:20 }}>Pago</span>
                      <span style={{ fontSize:11, color:"var(--mu)" }}>{I.check} {m.dataPag?.split("-").reverse().join("/")}</span>
                      {m.formaPag && (
                        <span style={{ fontSize:10, color:"var(--mu)" }}>{ICONES_FORMA[m.formaPag] || ""} {m.formaPag}</span>
                      )}
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <span className="badge" style={{ background:"#fff3cd", color:"#856404", fontSize:11, padding:"2px 8px", borderRadius:20 }}>Pendente</span>
                      <button className="btn btn-ok btn-sm" onClick={() => onPago(aluno.id, m.mes)}>{I.check} Pagar</button>
                    </div>
                  )}
                </div>
              ))
          }
        </div>
      )}

      {/* ── Frequência ── */}
      {tab === "freq" && (
        <>
          {aluno.diasSemana.includes(todayDow) && (
            <div style={{ background:"var(--wm)", borderRadius:12, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:"var(--gd)" }}>Aula de hoje — marcar presença</div>
              <div className="btn-row">
                <button
                  className={`btn btn-sm ${freqHoje?.presente === true ? "btn-ok" : "btn-out"} btn-full`}
                  onClick={() => onFreq(aluno.id, true)}
                >{I.check} Presente</button>
                <button
                  className={`btn btn-sm ${freqHoje?.presente === false ? "btn-danger" : "btn-out"} btn-full`}
                  onClick={() => onFreq(aluno.id, false)}
                >{I.x} Faltou</button>
              </div>
            </div>
          )}
          <div className="section">
            {aluno.frequencias.length === 0
              ? <div className="empty"><div className="empty-ico">📋</div><p>Nenhuma frequência registrada</p></div>
              : [...aluno.frequencias].sort((a, b) => b.data.localeCompare(a.data)).map(f => (
                  <div key={f.data} className="row" style={{ cursor:"default" }}>
                    <span className={`fdot ${f.presente ? "pres" : "aus"}`} />
                    <div className="row-body">
                      <div className="row-name">{f.data.split("-").reverse().join("/")}</div>
                      <div className="row-sub">{DIAS_SEMANA[new Date(f.data + "T12:00").getDay()]}</div>
                    </div>
                    <span className={`badge ${f.presente ? "ok" : "danger"}`}>{f.presente ? "Presente" : "Faltou"}</span>
                  </div>
                ))
            }
          </div>
        </>
      )}
    </>
  );
}
