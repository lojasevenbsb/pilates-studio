"use client";
import { usePathname, useRouter } from "next/navigation";
import { useApp }      from "../context/AppContext.jsx";
import { I }           from "../components/Icons.jsx";
import PagoSheet       from "../components/PagoSheet.jsx";

const NAV = [
  { id: "home",   label: "Início",        icon: I.home,   href: "/"             },
  { id: "alunos", label: "Alunos",        icon: I.users,  href: "/alunos"       },
  { id: "mens",   label: "Finanças",      icon: I.card,   href: "/financas"     },
  { id: "freq",   label: "Frequência",    icon: I.cal,    href: "/frequencia"   },
  { id: "agenda", label: "Agenda",        icon: I.clock,  href: "/agenda"       },
  { id: "config", label: "Configurações", icon: I.config, href: "/configuracoes"},
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { alunos, toast, sheet, setSheet, marcarPago } = useApp();

  // Aba ativa baseada no pathname
  const activeTab = pathname === "/"                       ? "home"
    : pathname.startsWith("/alunos")                       ? "alunos"
    : pathname.startsWith("/financas")                     ? "mens"
    : pathname.startsWith("/frequencia")                   ? "freq"
    : pathname.startsWith("/agenda")                       ? "agenda"
    : "config";

  // Detecta sub-páginas (detalhe / cadastro / editar)
  const isDetalhe  = /^\/alunos\/[^/]+$/.test(pathname) && pathname !== "/alunos";
  const isEditar   = /^\/alunos\/[^/]+\/editar$/.test(pathname);
  const isCadastro = pathname === "/alunos/cadastro";
  const isSubPage  = isDetalhe || isEditar || isCadastro;

  // Nome do aluno na topbar de detalhe
  const alunoId    = (isDetalhe || isEditar) ? Number(pathname.split("/")[2]) : null;
  const alunoAtual = alunoId ? alunos.find(a => a.id === alunoId) : null;

  const topbarTitle = isDetalhe  ? (alunoAtual?.nome || "Aluno")
    : isEditar                   ? "Editar Aluno"
    : isCadastro                 ? "Novo Aluno"
    : NAV.find(n => n.id === activeTab)?.label || "Início";

  return (
    <div className="shell">
      {/* SIDEBAR */}
      <nav className="botnav">
        <div className="botnav-logo">Studio Pilates<span>Gestão</span></div>
        <div className="botnav-items">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`bn-item${activeTab === n.id && !isSubPage ? " active" : ""}`}
              onClick={() => router.push(n.href)}
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
          {isSubPage ? (
            <>
              <button className="topbar-back" onClick={() => router.back()}>{I.back} Voltar</button>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 16, color: "var(--tx)" }}>
                {topbarTitle}
              </span>
            </>
          ) : (
            <div className="topbar-logo">
              {topbarTitle}
              <span>Studio Pilates</span>
            </div>
          )}

          {!isSubPage && activeTab === "alunos" && (
            <button className="topbar-action" onClick={() => router.push("/alunos/cadastro")}>
              {I.plus} Novo aluno
            </button>
          )}
        </header>

        {/* CONTENT */}
        <main className="scroll">{children}</main>
      </div>

      {/* SHEET DE PAGAMENTO */}
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
