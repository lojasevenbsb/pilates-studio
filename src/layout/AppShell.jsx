import { useState } from "react";
import { useApp }       from "../context/AppContext.jsx";
import { I }            from "../components/Icons.jsx";
import PagoSheet        from "../components/PagoSheet.jsx";
import Home             from "../pages/Home.jsx";
import Alunos           from "../pages/Alunos.jsx";
import DetalheAluno     from "../pages/DetalheAluno.jsx";
import Financas         from "../pages/Financas.jsx";
import Frequencia       from "../pages/Frequencia.jsx";
import AgendaDiaria     from "../pages/AgendaDiaria.jsx";
import CadastroAluno    from "../pages/CadastroAluno.jsx";
import Configuracoes    from "../pages/Configuracoes.jsx";

const NAV = [
  { id:"home",   label:"Início",        icon:I.home   },
  { id:"alunos", label:"Alunos",        icon:I.users  },
  { id:"mens",   label:"Finanças",      icon:I.card   },
  { id:"freq",   label:"Frequência",    icon:I.cal    },
  { id:"agenda", label:"Agenda",        icon:I.clock  },
  { id:"config", label:"Configurações", icon:I.config },
];

export default function AppShell() {
  const {
    alunos, agendamentos, setAgendamentos,
    instrutores, setInstrutores,
    modalidades, setModalidades,
    toast, showToast,
    sheet, setSheet,
    push, pop, current,
    mesAtual,
    salvarAluno, marcarPago, registrarFreq, openPago,
  } = useApp();

  const [tab, setTab] = useState("home");

  // ── stats ──────────────────────────────────────────────────────────────────
  const ativos   = alunos.filter(a => a.ativo).length;
  const inadim   = alunos.filter(a => a.mensalidades.some(m => m.mes === mesAtual && !m.pago)).length;
  const aHoje    = alunos.filter(a => a.diasSemana.includes(new Date().getDay()) && a.ativo).length;
  const recebido = alunos.reduce((s, a) => {
    const m = a.mensalidades.find(m => m.mes === mesAtual && m.pago);
    return m ? s + m.valor : s;
  }, 0);

  const isDetalhe  = current?.screen === "detalhe";
  const isCadastro = current?.screen === "cadastro";
  const alunoAtual = isDetalhe ? alunos.find(a => a.id === current.data.id) : null;

  // ── renderPage ─────────────────────────────────────────────────────────────
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
            alunos={alunos}
            onAgenda={() => setTab("agenda")}
            onMens={() => setTab("mens")}
            onPago={openPago}
          />
        );
      case "alunos":
        return (
          <Alunos
            alunos={alunos}
            onDetalhe={a => push("detalhe", { id: a.id })}
            onNovo={() => push("cadastro", {})}
          />
        );
      case "mens":
        return (
          <Financas
            alunos={alunos}
            onPago={openPago}
            onDetalhe={a => push("detalhe", { id: a.id, initialTab: "mens" })}
          />
        );
      case "freq":
        return <Frequencia alunos={alunos} onFreq={registrarFreq} />;
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

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="shell">
      {/* SIDEBAR */}
      <nav className="botnav">
        <div className="botnav-logo">Studio Pilates<span>Gestão</span></div>
        <div className="botnav-items">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`bn-item${tab === n.id && !isDetalhe && !isCadastro ? " active" : ""}`}
              onClick={() => { setTab(n.id); }}
            >
              {n.icon}<span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <div className="main-area">
        {/* TOP BAR */}
        <header className="topbar">
          {(isDetalhe || isCadastro) ? (
            <>
              <button className="topbar-back" onClick={pop}>{I.back} Voltar</button>
              <span style={{ flex:1, fontWeight:700, fontSize:16, color:"var(--tx)" }}>
                {isDetalhe
                  ? alunoAtual?.nome
                  : (current?.data?.aluno ? "Editar Aluno" : "Novo Aluno")}
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
        </header>

        {/* CONTENT */}
        <main className="scroll">{renderPage()}</main>
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
