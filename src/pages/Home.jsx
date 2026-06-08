import { PLANOS, todayStr, todayDow } from "../constants/index.js";
import { brl, mesLabel, iniciais, primeiroNome } from "../utils/format.js";
import { I } from "../components/Icons.jsx";

/**
 * Página inicial — resumo do dia, stats e inadimplentes.
 */
export default function Home({ ativos, inadim, aHoje, recebido, alunos, onAgenda, onMens, onPago }) {
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

      {/* Aulas do dia */}
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

      {/* Inadimplentes do mês */}
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
                <button className="btn btn-ok btn-sm" onClick={() => onPago(a.id, mesAtual)}>
                  {I.check}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
