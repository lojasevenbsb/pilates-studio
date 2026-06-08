import "./src/styles/global.css";
import { useState, useEffect } from "react";
import AgendaDiaria  from "./src/AgendaDiaria.jsx";
import CadastroAluno from "./src/CadastroAluno.jsx";
import Configuracoes from "./src/Configuracoes.jsx";
import { AppProvider, useApp } from "./src/context/AppContext.jsx";
import {
  PLANOS, DIAS_SEMANA, ICONES_FORMA, todayStr, todayDow,
} from "./src/constants/index.js";
import { brl, mesLabel, fmtIso, iniciais, primeiroNome } from "./src/utils/format.js";

// Horários disponíveis para seleção (usado no formulário rápido)
const HORARIOS = ["07:00","08:00","09:00","10:00","11:00","17:00","18:00","19:00","20:00"];

// ── ICONS ─────────────────────────────────────────────────────────────────────
const I = {
  home:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  card:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  cal:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  config: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  plus:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  chev:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  whats:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
};

// ── RAIZ ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",   label:"Início",        icon:I.home   },
  { id:"alunos", label:"Alunos",        icon:I.users  },
  { id:"mens",   label:"Finanças",      icon:I.card   },
  { id:"freq",   label:"Frequência",    icon:I.cal    },
  { id:"agenda", label:"Agenda",        icon:I.clock  },
  { id:"config", label:"Configurações", icon:I.config },
];

function AppShell() {
  const {
    alunos, agendamentos, setAgendamentos,
    instrutores, setInstrutores,
    modalidades, setModalidades,
    toast, showToast,
    stack, setSheet, sheet,
    push, pop, current,
    mesAtual,
    salvarAluno, marcarPago, registrarFreq, openPago,
  } = useApp();

  const [tab, setTab] = useState("home");

  // stats para Home
  const ativos    = alunos.filter(a => a.ativo).length;
  const inadim    = alunos.filter(a => a.mensalidades.some(m => m.mes === mesAtual && !m.pago)).length;
  const aHoje     = alunos.filter(a => a.diasSemana.includes(todayDow) && a.ativo).length;
  const recebido  = alunos.reduce((s, a) => {
    const m = a.mensalidades.find(m => m.mes === mesAtual && m.pago);
    return m ? s + m.valor : s;
  }, 0);

  const isDetalhe  = current?.screen === "detalhe";
  const isCadastro = current?.screen === "cadastro";
  const alunoAtual = isDetalhe ? alunos.find(a => a.id === current.data.id) : null;

  const renderPage = () => {
    if (current) {
      if (current.screen === "detalhe") {
        const aluno = alunos.find(a => a.id === current.data.id);
        return (
          <DetalheAluno
            aluno={aluno}
            initialTab={current.data.initialTab || "info"}
            onBack={pop}
            onEdit={() => push("cadastro", { aluno })}
            onPago={openPago}
            onFreq={registrarFreq}
          />
        );
      }
      if (current.screen === "cadastro") {
        return (
          <CadastroAluno
            aluno={current.data?.aluno || null}
            onVoltar={pop}
            onSalvar={dados => { salvarAluno(dados); pop(); }}
          />
        );
      }
    }
    switch (tab) {
      case "home":
        return (
          <Home
            ativos={ativos} inadim={inadim} aHoje={aHoje} recebido={recebido}
            alunos={alunos} onAgenda={() => setTab("agenda")}
            onMens={() => setTab("mens")} onPago={openPago}
          />
        );
      case "alunos":
        return (
          <PageAlunos
            alunos={alunos}
            onDetalhe={a => push("detalhe", { id: a.id })}
            onNovo={() => push("cadastro", {})}
          />
        );
      case "mens":
        return (
          <PageMens
            alunos={alunos}
            onPago={openPago}
            onDetalhe={a => push("detalhe", { id: a.id, initialTab: "mens" })}
          />
        );
      case "freq":
        return <PageFreq alunos={alunos} onFreq={registrarFreq} />;
      case "agenda":
        return (
          <AgendaDiaria
            alunos={alunos}
            agendamentos={agendamentos}
            setAgendamentos={setAgendamentos}
            instrutores={instrutores}
            modalidades={modalidades}
            onCadastrarAluno={nome => push("cadastro", { aluno: { nome } })}
          />
        );
      case "config":
        return (
          <Configuracoes
            instrutores={instrutores} setInstrutores={setInstrutores}
            modalidades={modalidades} setModalidades={setModalidades}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <div className="botnav">
        <div className="botnav-logo">Studio Pilates<span>Gestão</span></div>
        <div className="botnav-items">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`bn-item${tab === n.id && !isDetalhe && !isCadastro ? " active" : ""}`}
              onClick={() => { setTab(n.id); }}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="main-area">
        {/* TOP BAR */}
        <div className="topbar">
          {(isDetalhe || isCadastro) ? (
            <>
              <button className="topbar-back" onClick={pop}>{I.back} Voltar</button>
              <span style={{ flex:1, fontWeight:700, fontSize:16, color:"var(--tx)" }}>
                {isDetalhe ? alunoAtual?.nome : (current?.data?.aluno ? "Editar Aluno" : "Novo Aluno")}
              </span>
            </>
          ) : (
            <div className="topbar-logo">
              {NAV.find(n => n.id === tab)?.label || "Início"}
              <span>Studio Pilates</span>
            </div>
          )}
          {!isDetalhe && !isCadastro && tab === "alunos" && (
            <button className="topbar-action" onClick={() => push("cadastro", {})}>
              {I.plus} Novo aluno
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="scroll">{renderPage()}</div>
      </div>

      {/* SHEET OVERLAY */}
      {sheet && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setSheet(null)}>
          {sheet.type === "pago" && (
            <PagoSheet
              data={sheet.data}
              onClose={() => setSheet(null)}
              onConfirmar={formaPag => {
                marcarPago(sheet.data.alunoId, sheet.data.mes, formaPag);
                setSheet(null);
              }}
            />
          )}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function Home({ ativos, inadim, aHoje, recebido, alunos, onAgenda, onMens, onPago }) {
  const mesAtual   = todayStr.slice(0, 7);
  const alunosHoje = alunos
    .filter(a => a.diasSemana.includes(todayDow) && a.ativo)
    .sort((a, b) => a.horario.localeCompare(b.horario));
  const emAberto   = alunos.filter(a => a.mensalidades.some(m => m.mes === mesAtual && !m.pago));

  return (
    <>
      <div className="banner">
        <div className="banner-ico">🌿</div>
        <div className="banner-text">
          <h4>Bom dia!</h4>
          <p>{new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat grn"><div className="stat-num">{ativos}</div><div className="stat-label">Alunos ativos</div></div>
        <div className="stat"><div className="stat-num">{aHoje}</div><div className="stat-label">Aulas hoje</div></div>
        <div className={`stat ${inadim > 0 ? "red" : "grn"}`}><div className="stat-num">{inadim}</div><div className="stat-label">Inadimplentes</div></div>
        <div className="stat grn"><div className="stat-num" style={{ fontSize:22 }}>{brl(recebido)}</div><div className="stat-label">Recebido/mês</div></div>
      </div>

      <div className="section">
        <div className="sec-head">
          <h3>📅 Aulas de Hoje</h3>
          <button className="sec-link" onClick={onAgenda}>Ver agenda →</button>
        </div>
        {alunosHoje.length === 0
          ? <div className="empty"><div className="empty-ico">☀️</div><p>Sem aulas hoje</p></div>
          : alunosHoje.map(a => {
              const p = PLANOS.find(pl => pl.id === a.planoId);
              return (
                <div key={a.id} className="row" style={{ cursor:"default" }}>
                  <div className="pill-time">{a.horario}</div>
                  <div className="row-av sm">{iniciais(a.nome)}</div>
                  <div className="row-body">
                    <div className="row-name">{primeiroNome(a.nome)}</div>
                    <div className="row-sub">{p?.freq}x/sem</div>
                  </div>
                </div>
              );
            })
        }
      </div>

      {emAberto.length > 0 && (
        <div className="section">
          <div className="sec-head">
            <h3>💳 Em aberto — {mesLabel(mesAtual)}</h3>
            <button className="sec-link" onClick={onMens}>Ver tudo →</button>
          </div>
          {emAberto.map(a => {
            const m = a.mensalidades.find(mm => mm.mes === mesAtual && !mm.pago);
            return (
              <div key={a.id} className="row" style={{ cursor:"default" }}>
                <div className="row-av sm">{iniciais(a.nome)}</div>
                <div className="row-body">
                  <div className="row-name">{primeiroNome(a.nome)}</div>
                  <div className="row-sub">{brl(m?.valor || 0)}</div>
                </div>
                <button className="btn btn-ok btn-sm" onClick={() => onPago(a.id, mesAtual)}>{I.check}</button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── ALUNOS ────────────────────────────────────────────────────────────────────
function PageAlunos({ alunos, onDetalhe, onNovo }) {
  const [q, setQ] = useState("");
  const mesAtual  = todayStr.slice(0, 7);
  const lista     = alunos.filter(a =>
    a.nome.toLowerCase().includes(q.toLowerCase()) || a.telefone.includes(q)
  );

  return (
    <>
      <div className="searchbar">
        {I.search}
        <input
          className="form-input"
          style={{ paddingLeft:38 }}
          placeholder="Buscar aluno…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      <div className="section">
        {lista.length === 0
          ? <div className="empty"><div className="empty-ico">🔍</div><p>Nenhum aluno encontrado</p></div>
          : lista.map(a => {
              const p = PLANOS.find(pl => pl.id === a.planoId);
              const m = a.mensalidades.find(m => m.mes === mesAtual);
              return (
                <div key={a.id} className="row" onClick={() => onDetalhe(a)}>
                  <div className="row-av">{iniciais(a.nome)}</div>
                  <div className="row-body">
                    <div className="row-name">{a.nome}</div>
                    <div className="row-sub">{p?.freq}x/sem · {a.horario}</div>
                  </div>
                  <div className="row-end">
                    {m
                      ? m.pago
                        ? <span className="badge ok">{I.check} Pago</span>
                        : <span className="badge danger">Aberto</span>
                      : null
                    }
                    <span className="chev">{I.chev}</span>
                  </div>
                </div>
              );
            })
        }
      </div>
    </>
  );
}

// ── DETALHE ───────────────────────────────────────────────────────────────────
function DetalheAluno({ aluno, onBack, onEdit, onPago, onFreq, initialTab = "info" }) {
  const [tab, setTab] = useState(initialTab);
  const mesAtual      = todayStr.slice(0, 7);
  const p             = PLANOS.find(pl => pl.id === aluno.planoId);
  const freqHoje      = aluno.frequencias.find(f => f.data === todayStr);
  const pct           = aluno.frequencias.length
    ? Math.round(aluno.frequencias.filter(f => f.presente).length / aluno.frequencias.length * 100)
    : 0;

  return (
    <>
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

      <div className="tabs">
        {[["info","Info"],["mens","Mensalidades"],["freq","Frequência"]].map(([k, l]) => (
          <div key={k} className={`tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

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
            <div className="info-row"><span className="lbl">Vencimento</span><span className="val">{aluno.dataVencimento ? new Date(aluno.dataVencimento + "T12:00").toLocaleDateString("pt-BR") : "—"}</span></div>
            <div className="info-row"><span className="lbl">Presença geral</span><span className="val" style={{ color:"var(--gd)" }}>{pct}%</span></div>
          </div>
        </>
      )}

      {tab === "mens" && (
        <div className="section">
          {aluno.mensalidades.length === 0
            ? <div className="empty"><div className="empty-ico">💳</div><p>Nenhuma mensalidade gerada</p></div>
            : [...aluno.mensalidades].reverse().map(m => (
                <div key={m.mes} className="row" style={{ cursor:"default" }}>
                  <div style={{ flex:1 }}>
                    <div className="row-name">{mesLabel(m.mes)}</div>
                    <div className="row-sub">{brl(m.valor)} · {m.vencimento ? `vence ${new Date(m.vencimento+"T12:00").toLocaleDateString("pt-BR")}` : "vence dia 10"}</div>
                  </div>
                  {m.pago ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <span className="badge ok" style={{ fontSize:11, padding:"2px 8px", borderRadius:20 }}>Pago</span>
                      <span style={{ fontSize:11, color:"var(--mu)" }}>{I.check} {m.dataPag?.split("-").reverse().join("/")}</span>
                      {m.formaPag && <span style={{ fontSize:10, color:"var(--mu)" }}>{ICONES_FORMA[m.formaPag] || ""} {m.formaPag}</span>}
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

      {tab === "freq" && (
        <>
          {aluno.diasSemana.includes(todayDow) && (
            <div style={{ background:"var(--wm)", borderRadius:12, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:"var(--gd)" }}>Aula de hoje — marcar presença</div>
              <div className="btn-row">
                <button className={`btn btn-sm ${freqHoje?.presente === true ? "btn-ok" : "btn-out"} btn-full`} onClick={() => onFreq(aluno.id, true)}>{I.check} Presente</button>
                <button className={`btn btn-sm ${freqHoje?.presente === false ? "btn-danger" : "btn-out"} btn-full`} onClick={() => onFreq(aluno.id, false)}>{I.x} Faltou</button>
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

// ── FINANÇAS ──────────────────────────────────────────────────────────────────
function PageMens({ alunos, onPago, onDetalhe }) {
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

      <div className="stat-grid" style={{ marginBottom:12 }}>
        <div className="stat grn"><div className="stat-num" style={{ fontSize:20 }}>{brl(totPago)}</div><div className="stat-label">Recebido</div></div>
        <div className="stat red"><div className="stat-num" style={{ fontSize:20 }}>{brl(totAberto)}</div><div className="stat-label">Em aberto</div></div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input type="month" className="form-input" style={{ flex:1 }} value={mes} onChange={e => setMes(e.target.value)} />
        <select className="form-input" style={{ flex:1 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pago">Pagos</option>
          <option value="aberto">Em aberto</option>
        </select>
      </div>

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
                        : `Vence dia ${a.diaVencimento || 10}`
                      }
                    </div>
                    {m?.pago && m?.dataPag && (
                      <div style={{ fontSize:11, color:"#2e7d46", fontWeight:600, marginTop:2 }}>
                        Pago em {new Date(m.dataPag + "T12:00").toLocaleDateString("pt-BR")}
                        {m.formaPag && <span style={{ marginLeft:6 }}>{ICONES_FORMA[m.formaPag] || ""} {m.formaPag}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#1e1e1e" }}>{brl(m?.valor || 0)}</span>
                  {m?.pago ? (
                    <span style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:700, background:"#3b5c3e", color:"#fff" }}>✓ Pago</span>
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

// ── FREQUÊNCIA ────────────────────────────────────────────────────────────────
function PageFreq({ alunos, onFreq }) {
  const [date, setDate] = useState(todayStr);
  const dow  = new Date(date + "T12:00").getDay();
  const lista = alunos.filter(a => a.diasSemana.includes(dow) && a.ativo);

  return (
    <>
      <input type="date" className="form-input" style={{ marginBottom:12 }} value={date} max={todayStr} onChange={e => setDate(e.target.value)} />
      <div style={{ fontSize:12, color:"var(--mu)", marginBottom:12 }}>{lista.length} aluno(s) com aula em {DIAS_SEMANA[dow]}</div>
      <div className="section">
        {lista.length === 0
          ? <div className="empty"><div className="empty-ico">📋</div><p>Nenhum aluno com aula nesse dia</p></div>
          : lista.map(a => {
              const f = a.frequencias.find(ff => ff.data === date);
              return (
                <div key={a.id} className="row" style={{ cursor:"default", flexWrap:"wrap", gap:8 }}>
                  <div className="row-av sm">{iniciais(a.nome)}</div>
                  <div className="row-body">
                    <div className="row-name">{primeiroNome(a.nome)}</div>
                    <div className="row-sub">{a.horario} · {f ? (f.presente ? "Presente" : "Faltou") : "Não registrado"}</div>
                  </div>
                  <div className="btn-row">
                    <button className={`btn btn-icon btn-sm ${f?.presente === true ? "btn-ok" : "btn-out"}`} onClick={() => onFreq(a.id, true)}>{I.check}</button>
                    <button className={`btn btn-icon btn-sm ${f?.presente === false ? "btn-danger" : "btn-out"}`} onClick={() => onFreq(a.id, false)}>{I.x}</button>
                  </div>
                </div>
              );
            })
        }
      </div>
    </>
  );
}

// ── SHEET PAGAMENTO ───────────────────────────────────────────────────────────
const FORMAS_PAG = ["Pix", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Dinheiro"];
const ICONES_PAG = { "Pix":"⚡", "Cartão de Crédito":"💳", "Cartão de Débito":"💳", "Boleto":"🧾", "Dinheiro":"💵" };

function PagoSheet({ data, onClose, onConfirmar }) {
  const [forma, setForma] = useState(FORMAS_PAG[0]);
  return (
    <div className="confirm" onClick={e => e.stopPropagation()} style={{ maxWidth:340 }}>
      <h4>Registrar Pagamento</h4>
      <p style={{ marginBottom:12 }}>Mensalidade de <strong>{mesLabel(data.mes)}</strong></p>
      <p style={{ fontSize:13, color:"var(--mu)", marginBottom:8 }}>Forma de pagamento:</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
        {FORMAS_PAG.map(f => (
          <button key={f} onClick={() => setForma(f)} style={{
            padding:"10px 14px", borderRadius:10,
            border:`2px solid ${forma === f ? "var(--gd)" : "var(--sd)"}`,
            background: forma === f ? "var(--gd)" : "var(--wh)",
            color: forma === f ? "#fff" : "var(--tx)",
            fontWeight:600, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s",
          }}>
            {ICONES_PAG[f] || "💰"} {f}
          </button>
        ))}
      </div>
      <div className="btn-row" style={{ justifyContent:"center" }}>
        <button className="btn btn-out" onClick={onClose}>Cancelar</button>
        <button className="btn btn-prim" onClick={() => onConfirmar(forma)}>Confirmar</button>
      </div>
    </div>
  );
}

// ── SHEET ALUNO (edição rápida — alternativa ao CadastroAluno) ────────────────
function SheetAluno({ data, onClose, onSalvar }) {
  const [form, setForm] = useState({
    id:            data?.id            || null,
    nome:          data?.nome          || "",
    telefone:      data?.telefone      || "",
    email:         data?.email         || "",
    cpf:           data?.cpf           || "",
    planoId:       data?.planoId       || "",
    diasSemana:    data?.diasSemana    || [],
    horario:       data?.horario       || "",
    dataInicio:    data?.dataInicio    || todayStr,
    dataVencimento:data?.dataVencimento|| "",
  });
  const [freqSel, setFreqSel] = useState(data ? PLANOS.find(p => p.id === data.planoId)?.freq || 1 : 1);

  const set       = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleDia = d  => set("diasSemana", form.diasSemana.includes(d) ? form.diasSemana.filter(x => x !== d) : [...form.diasSemana, d]);

  useEffect(() => {
    if (form.planoId && form.dataInicio) {
      const p = PLANOS.find(p => p.id === form.planoId);
      if (!p) return;
      const d = new Date(form.dataInicio + "T12:00");
      d.setMonth(d.getMonth() + p.meses);
      set("dataVencimento", fmtIso(d));
    }
  }, [form.planoId, form.dataInicio]);

  const planoSel = PLANOS.find(p => p.id === form.planoId);
  const valido   = form.nome && form.telefone && form.planoId && form.diasSemana.length && form.horario;

  return (
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" />
      <div className="sheet-head">
        <h3>{data ? "Editar Aluno" : "Novo Aluno"}</h3>
        <button className="sheet-close" onClick={onClose}>{I.x}</button>
      </div>
      <div className="sheet-body">
        <div className="form-group">
          <label className="form-label">Nome completo *</label>
          <input className="form-input" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do aluno" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telefone *</label>
            <input className="form-input" value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input className="form-input" value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-input" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@email.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Frequência semanal *</label>
          <div className="plan-tabs">
            {[1, 2, 3].map(f => (
              <button key={f} className={`plan-tab${freqSel === f ? " on" : ""}`} onClick={() => { setFreqSel(f); set("planoId", ""); }}>
                {f}x / semana
              </button>
            ))}
          </div>
          <div className="plan-cards">
            {PLANOS.filter(p => p.freq === freqSel).map(p => (
              <div key={p.id} className={`plan-card${form.planoId === p.id ? " on" : ""}`} onClick={() => set("planoId", p.id)}>
                <div className="pd">{p.duracao}</div>
                <div className="pv">{brl(p.valor)}/mês</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dias da semana *</label>
          <div className="dias-row">
            {DIAS_SEMANA.map((d, i) => (
              <button key={i} className={`dia-btn${form.diasSemana.includes(i) ? " on" : ""}`} onClick={() => toggleDia(i)}>{d}</button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Horário *</label>
            <select className="form-input" value={form.horario} onChange={e => set("horario", e.target.value)}>
              <option value="">Selecionar</option>
              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Início</label>
            <input type="date" className="form-input" value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} />
          </div>
        </div>

        {planoSel && form.diasSemana.length > 0 && (
          <div style={{ background:"var(--wm)", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:4 }}>
            <strong>Resumo:</strong> {planoSel.freq}x/sem · {planoSel.duracao} · <strong>{brl(planoSel.valor)}/mês</strong>
            {form.dataVencimento && <> · Vence em {new Date(form.dataVencimento + "T12:00").toLocaleDateString("pt-BR")}</>}
          </div>
        )}
      </div>
      <div className="sheet-footer">
        <button className="btn btn-out btn-full" onClick={onClose}>Cancelar</button>
        <button className="btn btn-prim btn-full" disabled={!valido} onClick={() => onSalvar(form)}>{I.check} {data ? "Salvar" : "Cadastrar"}</button>
      </div>
    </div>
  );
}
