import { useState, useEffect } from "react";

const HORAS = [
  "07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];
const TIPOS = ["Aparelho", "Solo", "Experimental", "Reabilitação", "Funcional"];

const fmtIso = (d) => d.toISOString().split("T")[0];
const todayStr = fmtIso(new Date());

const addDias = (iso, n) => {
  const d = new Date(iso + "T12:00");
  d.setDate(d.getDate() + n);
  return fmtIso(d);
};

const labelData = (iso) =>
  new Date(iso + "T12:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const proxHora = (h) => {
  const [hr, mn] = h.split(":").map(Number);
  const next = hr + 1;
  return next > 21 ? "21:00" : `${String(next).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
};

const DS_CURTO = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const addMesesNav = (iso, n) => {
  const d = new Date(iso + "T12:00");
  d.setMonth(d.getMonth() + n);
  return fmtIso(d);
};

const getInicioSemana = (iso) => {
  const d = new Date(iso + "T12:00");
  d.setDate(d.getDate() - d.getDay());
  return fmtIso(d);
};

const getDiasSemana = (iso) => {
  const inicio = getInicioSemana(iso);
  return Array.from({ length: 7 }, (_, i) => addDias(inicio, i));
};

const labelSemana = (iso) => {
  const dias = getDiasSemana(iso);
  const ini  = new Date(dias[0] + "T12:00");
  const fim  = new Date(dias[6] + "T12:00");
  const mesIgual = ini.getMonth() === fim.getMonth();
  const iniStr = ini.toLocaleDateString("pt-BR", { day:"numeric", ...(!mesIgual && {month:"short"}) });
  const fimStr = fim.toLocaleDateString("pt-BR", { day:"numeric", month:"short", year:"numeric" });
  return `${iniStr} – ${fimStr}`;
};

const labelMes = (iso) =>
  new Date(iso + "T12:00").toLocaleDateString("pt-BR", { month:"long", year:"numeric" });

// ── VISÃO SEMANAL ─────────────────────────────────────────────────────────────
function WeekView({ dataAtual, agendamentos, onDayClick, onNovoAgendamento }) {
  const dias = getDiasSemana(dataAtual);

  return (
    <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.08)", overflow:"hidden" }}>
      {/* Cabeçalho: nome + número do dia */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#f7f4ee", borderBottom:"2px solid #e8e0d0" }}>
        {dias.map(iso => {
          const d      = new Date(iso + "T12:00");
          const isHoje = iso === todayStr;
          const qtd    = agendamentos.filter(a => a.data === iso).length;
          return (
            <div
              key={iso}
              onClick={() => onDayClick(iso)}
              style={{ padding:"12px 4px", textAlign:"center", cursor:"pointer", borderRight:"1px solid #e8e0d0", transition:"background .1s", background: isHoje ? "#e6f4ec" : "transparent" }}
              onMouseEnter={e => { if (!isHoje) e.currentTarget.style.background="#fafaf8"; }}
              onMouseLeave={e => { if (!isHoje) e.currentTarget.style.background="transparent"; }}
            >
              <div style={{ fontSize:10, fontWeight:700, color: isHoje?"#2e7d46":"#8c8c8c", textTransform:"uppercase", letterSpacing:.5 }}>
                {DS_CURTO[d.getDay()]}
              </div>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center",
                justifyContent:"center", margin:"4px auto 2px",
                background: isHoje ? "#3b5c3e" : "transparent",
                fontSize:15, fontWeight:700, color: isHoje ? "#fff" : "#1e1e1e",
              }}>{d.getDate()}</div>
              {qtd > 0 && <div style={{ fontSize:10, color: isHoje?"#2e7d46":"#8c8c8c", fontWeight:600 }}>{qtd} aula{qtd!==1?"s":""}</div>}
            </div>
          );
        })}
      </div>

      {/* Corpo: mini-cards por dia */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", alignItems:"start" }}>
        {dias.map(iso => {
          const ags    = agendamentos.filter(a => a.data === iso).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
          const isHoje = iso === todayStr;
          return (
            <div key={iso} style={{ minHeight:180, padding:"8px 5px", borderRight:"1px solid #f0ebe0", background: isHoje ? "#fafff8" : "transparent" }}>
              {ags.length === 0 ? (
                <div style={{ marginTop:24, textAlign:"center", cursor:"pointer" }} onClick={() => onNovoAgendamento(iso)}>
                  <div style={{ fontSize:20, color:"#e0dbd2", lineHeight:1 }}>+</div>
                  <div style={{ fontSize:10, color:"#d0c8b8", marginTop:2 }}>Agendar</div>
                </div>
              ) : ags.map(ag => {
                  const ss = STATUS_S[ag.status] || STATUS_S.pendente;
                  return (
                    <div key={ag.id} style={{ background:ss.bg, border:`1px solid ${ss.border}`, borderRadius:6, padding:"5px 6px", marginBottom:5, cursor:"pointer" }} onClick={() => onDayClick(iso)}>
                      <div style={{ fontSize:10, fontWeight:700, color:ss.color }}>{ag.horaInicio}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#1e1e1e", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {ag.alunoNome.split(" ")[0]}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── VISÃO MENSAL ──────────────────────────────────────────────────────────────
function MonthView({ dataAtual, agendamentos, onDayClick }) {
  const [y, m] = dataAtual.split("-").map(Number);
  const primeiroDow = new Date(y, m - 1, 1).getDay();
  const ultimoDia   = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = 0; i < primeiroDow; i++) cells.push(null);
  for (let d = 1; d <= ultimoDia; d++)
    cells.push(`${String(y).padStart(4,"0")}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.08)", overflow:"hidden" }}>
      {/* Cabeçalho: nomes dos dias */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#f7f4ee", borderBottom:"2px solid #e8e0d0" }}>
        {DS_CURTO.map(d => (
          <div key={d} style={{ padding:"10px 0", textAlign:"center", fontSize:11, fontWeight:700, color:"#8c8c8c", textTransform:"uppercase", letterSpacing:.5 }}>{d}</div>
        ))}
      </div>

      {/* Células do calendário */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
        {cells.map((iso, i) => {
          const ags    = iso ? agendamentos.filter(a => a.data === iso) : [];
          const isHoje = iso === todayStr;
          const d      = iso ? new Date(iso + "T12:00") : null;
          const conf   = ags.filter(a => a.status === "confirmado").length;
          const pend   = ags.filter(a => a.status === "pendente").length;

          return (
            <div
              key={i}
              onClick={() => iso && onDayClick(iso)}
              style={{
                minHeight:84, padding:"8px", cursor: iso ? "pointer" : "default",
                borderBottom:"1px solid #f0ebe0", borderRight:(i+1)%7!==0?"1px solid #f0ebe0":"none",
                background: isHoje ? "#f5fff8" : "transparent", transition:"background .1s",
              }}
              onMouseEnter={e => { if (iso && !isHoje) e.currentTarget.style.background="#fafaf8"; }}
              onMouseLeave={e => { if (!isHoje) e.currentTarget.style.background="transparent"; }}
            >
              {d && (
                <>
                  <div style={{
                    width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: isHoje ? "#3b5c3e" : "transparent",
                    fontSize:13, fontWeight: isHoje ? 700 : 400, color: isHoje ? "#fff" : "#1e1e1e",
                    marginBottom:5,
                  }}>{d.getDate()}</div>
                  {conf > 0 && <div style={{ fontSize:10, fontWeight:700, color:"#2e7d46", background:"#e6f4ec", borderRadius:4, padding:"2px 5px", marginBottom:2 }}>✓ {conf} conf.</div>}
                  {pend > 0 && <div style={{ fontSize:10, fontWeight:700, color:"#c47a0a", background:"#fef3e2", borderRadius:4, padding:"2px 5px" }}>◷ {pend} pend.</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_S = {
  confirmado: { bg: "#e6f4ec", border: "#2e7d46", color: "#2e7d46", label: "Confirmado" },
  pendente:   { bg: "#fef3e2", border: "#c47a0a", color: "#c47a0a", label: "Pendente"   },
  cancelado:  { bg: "#fce8e6", border: "#c0392b", color: "#c0392b", label: "Cancelado"  },
};

const TIPO_S = {
  "Aparelho":     { bg: "#dbeafe", color: "#1d4ed8" },
  "Solo":         { bg: "#dcfce7", color: "#15803d" },
  "Experimental": { bg: "#fef9c3", color: "#854d0e" },
  "Reabilitação": { bg: "#f3e8ff", color: "#7c3aed" },
  "Funcional":    { bg: "#ffedd5", color: "#c2410c" },
};

const SAMPLE = [
  { id:1, alunoNome:"Ana Beatriz Silva",    data:todayStr, horaInicio:"08:00", horaFim:"09:00", instrutor:"João Carlos",    tipo:"Aparelho",     status:"confirmado", obs:"" },
  { id:2, alunoNome:"Carlos Eduardo Matos", data:todayStr, horaInicio:"07:00", horaFim:"08:00", instrutor:"Maria Luiza",    tipo:"Solo",         status:"confirmado", obs:"" },
  { id:3, alunoNome:"Fernanda Costa Lima",  data:todayStr, horaInicio:"10:00", horaFim:"11:00", instrutor:"João Carlos",    tipo:"Aparelho",     status:"pendente",   obs:"Confirmação pendente por WhatsApp" },
  { id:4, alunoNome:"Rodrigo Alves Pinto",  data:todayStr, horaInicio:"19:00", horaFim:"20:00", instrutor:"Ana Paula",      tipo:"Funcional",    status:"confirmado", obs:"" },
  { id:5, alunoNome:"Juliana Ramos",        data:todayStr, horaInicio:"09:00", horaFim:"10:00", instrutor:"Maria Luiza",    tipo:"Experimental", status:"pendente",   obs:"Primeira aula" },
  { id:6, alunoNome:"Marcos Vieira",        data:todayStr, horaInicio:"18:00", horaFim:"19:00", instrutor:"Pedro Henrique", tipo:"Solo",         status:"confirmado", obs:"" },
];

// ── ÍCONES ───────────────────────────────────────────────────────────────────
const IcoPlus    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoChevL   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoEdit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoClock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoUser    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ── INPUT STYLED ─────────────────────────────────────────────────────────────
const inp = { width:"100%", border:"1.5px solid #e8e0d0", borderRadius:10, padding:"11px 14px", fontSize:14, fontFamily:"inherit", color:"#1e1e1e", background:"#fff", outline:"none" };
const lbl = { fontSize:11, fontWeight:700, color:"#8c8c8c", textTransform:"uppercase", letterSpacing:".5px", display:"block", marginBottom:5 };
const fg  = { marginBottom:16 };

// ── MODAL DE AGENDAMENTO ──────────────────────────────────────────────────────
function ModalAgendamento({ inicial, alunos, instrutores = [], modalidades = [], onClose, onSalvar, onCadastrarAluno }) {
  const [form, setForm] = useState({
    id:          inicial?.id          || null,
    alunoNome:   inicial?.alunoNome   || "",
    data:        inicial?.data        || todayStr,
    horaInicio:  inicial?.horaInicio  || "",
    horaFim:     inicial?.horaFim     || "",
    instrutor:   inicial?.instrutor   || "",
    tipo:        inicial?.tipo        || "",
    status:      inicial?.status      || "confirmado",
    obs:         inicial?.obs         || "",
  });
  const [busca, setBusca]     = useState(inicial?.alunoNome || "");
  const [showDrop, setShowDrop] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (form.horaInicio && !form.horaFim) set("horaFim", proxHora(form.horaInicio));
  }, [form.horaInicio]);

  const filtrados = alunos
    ? alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 5)
    : [];

  const valido = form.alunoNome && form.data && form.horaInicio && form.horaFim && form.instrutor && form.tipo;

  return (
    <div
      style={{ position:"fixed", inset:0, left:220, background:"rgba(0,0,0,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"92vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.22)" }}>

        {/* Cabeçalho */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 24px 16px", borderBottom:"1px solid #e8e0d0" }}>
          <div style={{ fontFamily:"Fraunces,serif", fontSize:22, fontWeight:600, color:"#3b5c3e" }}>
            {form.id ? "Editar Agendamento" : "Novo Agendamento"}
          </div>
          <button onClick={onClose} style={{ background:"#f4efe5", border:"none", borderRadius:8, padding:8, cursor:"pointer", display:"flex", alignItems:"center" }}>
            <IcoX/>
          </button>
        </div>

        {/* Corpo */}
        <div style={{ padding:"20px 24px" }}>

          {/* Busca de aluno */}
          <div style={{ ...fg, position:"relative" }}>
            <label style={lbl}>Aluno *</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#8c8c8c" }}><IcoSearch/></span>
              <input
                style={{ ...inp, paddingLeft:38 }}
                placeholder="Buscar aluno..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); set("alunoNome", e.target.value); setShowDrop(true); }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 160)}
              />
            </div>
            {showDrop && busca && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"1.5px solid #e8e0d0", borderRadius:10, boxShadow:"0 6px 24px rgba(0,0,0,.13)", zIndex:10, marginTop:4, overflow:"hidden" }}>
                {filtrados.length > 0
                  ? filtrados.map((a) => (
                    <div
                      key={a.id}
                      style={{ padding:"10px 16px", cursor:"pointer", borderBottom:"1px solid #f4efe5", transition:"background .1s" }}
                      onMouseDown={() => { setBusca(a.nome); set("alunoNome", a.nome); setShowDrop(false); }}
                    >
                      <div style={{ fontWeight:600, fontSize:14 }}>{a.nome}</div>
                      <div style={{ fontSize:12, color:"#8c8c8c" }}>{a.telefone}</div>
                    </div>
                  ))
                  : (
                    <div style={{ padding:16, textAlign:"center" }}>
                      <div style={{ fontSize:13, color:"#8c8c8c", marginBottom:10 }}>Nenhum aluno encontrado</div>
                      <button
                        style={{ background:"#e6f4ec", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, color:"#2e7d46", cursor:"pointer" }}
                        onMouseDown={() => { if (onCadastrarAluno) { onClose(); onCadastrarAluno(busca); } }}
                      >
                        + Cadastrar novo aluno
                      </button>
                    </div>
                  )
                }
              </div>
            )}
          </div>

          {/* Data e horários */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, ...fg }}>
            <div>
              <label style={lbl}>Data *</label>
              <input type="date" style={inp} value={form.data} onChange={(e) => set("data", e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Início *</label>
              <select style={inp} value={form.horaInicio} onChange={(e) => set("horaInicio", e.target.value)}>
                <option value="">--:--</option>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Término *</label>
              <select style={inp} value={form.horaFim} onChange={(e) => set("horaFim", e.target.value)}>
                <option value="">--:--</option>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                <option value="21:00">21:00</option>
              </select>
            </div>
          </div>

          {/* Instrutor e tipo */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, ...fg }}>
            <div>
              <label style={lbl}>Instrutor *</label>
              <select style={inp} value={form.instrutor} onChange={(e) => set("instrutor", e.target.value)}>
                <option value="">Selecionar</option>
                {instrutores.filter(i=>i.status==="ativo").map((i) => <option key={i.id} value={i.nome}>{i.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tipo de aula *</label>
              <select style={inp} value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                <option value="">Selecionar</option>
                {modalidades.length > 0
                  ? modalidades.map((m) => <option key={m.id} value={m.nome}>{m.nome}</option>)
                  : TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Status */}
          <div style={fg}>
            <label style={lbl}>Status</label>
            <div style={{ display:"flex", gap:8 }}>
              {Object.entries(STATUS_S).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => set("status", k)}
                  style={{ flex:1, padding:"10px 8px", borderRadius:8, border:`1.5px solid ${form.status===k ? v.border : "#e8e0d0"}`, background:form.status===k ? v.bg : "#fff", color:form.status===k ? v.color : "#8c8c8c", fontWeight:form.status===k ? 700 : 500, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .12s" }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label style={lbl}>Observações</label>
            <textarea
              style={{ ...inp, resize:"vertical", minHeight:72 }}
              placeholder="Informações adicionais..."
              value={form.obs}
              onChange={(e) => set("obs", e.target.value)}
            />
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ padding:"12px 24px 20px", borderTop:"1px solid #e8e0d0", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px 20px", borderRadius:10, border:"1.5px solid #e8e0d0", background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Cancelar
          </button>
          <button
            disabled={!valido}
            onClick={() => valido && onSalvar(form)}
            style={{ flex:2, padding:"12px 20px", borderRadius:10, border:"none", background:valido ? "#3b5c3e" : "#e8e0d0", color:valido ? "#fff" : "#8c8c8c", fontSize:14, fontWeight:700, cursor:valido ? "pointer" : "default", fontFamily:"inherit", transition:"background .12s", boxShadow: valido ? "0 4px 14px rgba(59,92,62,.25)" : "none" }}
          >
            {form.id ? "Salvar alterações" : "Confirmar agendamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD DE AGENDAMENTO ───────────────────────────────────────────────────────
function AgCard({ ag, onEdit, onRemover }) {
  const ss = STATUS_S[ag.status] || STATUS_S.pendente;
  const ts = TIPO_S[ag.tipo]     || { bg:"#f0f0f0", color:"#666" };
  return (
    <div
      style={{ background:ss.bg, border:`1.5px solid ${ss.border}`, borderRadius:10, padding:"10px 14px", minWidth:220, flex:"1 1 220px", maxWidth:340, cursor:"pointer", transition:"transform .1s, box-shadow .1s", position:"relative" }}
      onClick={(e) => { e.stopPropagation(); onEdit(ag); }}
      onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#1e1e1e", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {ag.alunoNome}
          </div>
          <div style={{ fontSize:12, color:"#555", marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ display:"flex", alignItems:"center", gap:3 }}><IcoClock/> {ag.horaInicio} – {ag.horaFim}</span>
            <span style={{ display:"flex", alignItems:"center", gap:3 }}><IcoUser/> {ag.instrutor}</span>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:700, background:ts.bg, color:ts.color, padding:"2px 9px", borderRadius:20 }}>{ag.tipo}</span>
            <span style={{ fontSize:11, fontWeight:700, color:ss.color, padding:"2px 9px", background:"rgba(255,255,255,.65)", borderRadius:20, border:`1px solid ${ss.border}` }}>{ss.label}</span>
          </div>
          {ag.obs && <div style={{ fontSize:11, color:"#8c8c8c", marginTop:5, fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>💬 {ag.obs}</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(ag); }}
            style={{ background:"rgba(255,255,255,.7)", border:"none", borderRadius:6, padding:5, cursor:"pointer", display:"flex", alignItems:"center", color:"#555" }}
            title="Editar"
          ><IcoEdit/></button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemover(ag.id); }}
            style={{ background:"rgba(255,255,255,.7)", border:"none", borderRadius:6, padding:5, cursor:"pointer", display:"flex", alignItems:"center", color:"#c0392b" }}
            title="Remover"
          ><IcoTrash/></button>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function AgendaDiaria({ alunos = [], agendamentos: agsProp, setAgendamentos: setAgsProp, instrutores = [], modalidades = [], onCadastrarAluno }) {
  const [dataAtual, setDataAtual]               = useState(todayStr);
  const [view, setView]                         = useState("dia"); // "dia" | "semana" | "mes"
  const [agendamentosLocal, setAgendamentosLocal] = useState(SAMPLE);

  const agendamentos    = agsProp    ?? agendamentosLocal;
  const setAgendamentos = setAgsProp ?? setAgendamentosLocal;
  const [modal, setModal]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  // Navegação respeitando a visão atual
  const navegar = (n) => {
    if (view === "dia")    setDataAtual(addDias(dataAtual, n));
    else if (view === "semana") setDataAtual(addDias(dataAtual, n * 7));
    else                   setDataAtual(addMesesNav(dataAtual, n));
  };

  // Verifica se o período atual contém hoje
  const estaNoPeriodo = () => {
    if (view === "dia")    return dataAtual === todayStr;
    if (view === "semana") return getDiasSemana(dataAtual).includes(todayStr);
    return dataAtual.slice(0, 7) === todayStr.slice(0, 7);
  };

  // Label do header de acordo com a visão
  const labelHeader = view === "dia"    ? labelData(dataAtual)
                    : view === "semana" ? labelSemana(dataAtual)
                    :                    labelMes(dataAtual);

  // Stats: filtra pelo período visível
  const agsVisiveis = () => {
    if (view === "dia")    return agendamentos.filter(a => a.data === dataAtual);
    if (view === "semana") return agendamentos.filter(a => getDiasSemana(dataAtual).includes(a.data));
    const prefMes = dataAtual.slice(0, 7);
    return agendamentos.filter(a => a.data.startsWith(prefMes));
  };

  const agsDia      = agendamentos.filter((a) => a.data === dataAtual);
  const agsVis      = agsVisiveis();
  const confirmados = agsVis.filter((a) => a.status === "confirmado").length;
  const pendentes   = agsVis.filter((a) => a.status === "pendente").length;
  const cancelados  = agsVis.filter((a) => a.status === "cancelado").length;

  const agsNoHorario = (hora) => agsDia.filter((a) => a.horaInicio === hora);

  const irParaDia = (iso) => { setDataAtual(iso); setView("dia"); };

  const salvar = (form) => {
    if (form.id) {
      setAgendamentos((p) => p.map((a) => (a.id === form.id ? { ...a, ...form } : a)));
      showToast("✓ Agendamento atualizado");
    } else {
      setAgendamentos((p) => [...p, { ...form, id: Date.now() }]);
      showToast("✓ Agendamento criado");
    }
    setModal(null);
  };

  const remover = (id) => {
    setAgendamentos((p) => p.filter((a) => a.id !== id));
    setConfirmarId(null);
    showToast("Agendamento removido");
  };

  const isHoje    = dataAtual === todayStr;
  const horaAtual = new Date().getHours();

  return (
    <div style={{ padding:"28px", maxWidth: view === "dia" ? 1000 : "100%" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, flexWrap:"wrap" }}>

        {/* Seletor de visão */}
        <div style={{ display:"flex", background:"#f4efe5", borderRadius:10, padding:3, gap:2 }}>
          {[["dia","Dia"],["semana","Semana"],["mes","Mês"]].map(([v,l]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontSize:13, fontWeight: view===v ? 700 : 500,
                background: view===v ? "#3b5c3e" : "transparent",
                color: view===v ? "#fff" : "#555",
                transition:"all .15s",
              }}
            >{l}</button>
          ))}
        </div>

        {/* Navegação de data */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => navegar(-1)} style={{ background:"#fff", border:"1.5px solid #e8e0d0", borderRadius:8, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", fontFamily:"inherit" }}>
            <IcoChevL/>
          </button>

          <div style={{ minWidth: view==="dia" ? 280 : view==="semana" ? 220 : 180, textAlign:"center" }}>
            <div style={{ fontFamily:"Fraunces,serif", fontSize:17, fontWeight:600, color:"#3b5c3e", textTransform:"capitalize" }}>
              {labelHeader}
            </div>
            {estaNoPeriodo() && view === "dia" && (
              <span style={{ fontSize:10, color:"#2e7d46", fontWeight:700, background:"#e6f4ec", padding:"2px 10px", borderRadius:20, display:"inline-block", marginTop:2, letterSpacing:1 }}>HOJE</span>
            )}
          </div>

          <button onClick={() => navegar(1)} style={{ background:"#fff", border:"1.5px solid #e8e0d0", borderRadius:8, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", fontFamily:"inherit" }}>
            <IcoChevR/>
          </button>

          {!estaNoPeriodo() && (
            <button onClick={() => setDataAtual(todayStr)} style={{ background:"#f4efe5", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", color:"#3b5c3e", fontFamily:"inherit" }}>
              Hoje
            </button>
          )}
        </div>

        <div style={{ flex:1 }}/>

        {/* Badges de status */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ background:"#e6f4ec", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#2e7d46" }}>
            ✓ {confirmados} confirmado{confirmados!==1?"s":""}
          </div>
          <div style={{ background:"#fef3e2", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#c47a0a" }}>
            ◷ {pendentes} pendente{pendentes!==1?"s":""}
          </div>
          {cancelados > 0 && (
            <div style={{ background:"#fce8e6", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, color:"#c0392b" }}>
              ✕ {cancelados} cancelado{cancelados!==1?"s":""}
            </div>
          )}
        </div>

        {/* Botão principal */}
        <button
          onClick={() => setModal({ data: dataAtual })}
          style={{ background:"#3b5c3e", color:"#fff", border:"none", borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit", boxShadow:"0 4px 14px rgba(59,92,62,.28)" }}
        >
          <IcoPlus/> Novo Agendamento
        </button>
      </div>

      {/* ── VISÃO SEMANAL ───────────────────────────────────────────────── */}
      {view === "semana" && (
        <WeekView
          dataAtual={dataAtual}
          agendamentos={agendamentos}
          onDayClick={irParaDia}
          onNovoAgendamento={iso => { setDataAtual(iso); setView("dia"); setModal({ data: iso }); }}
        />
      )}

      {/* ── VISÃO MENSAL ────────────────────────────────────────────────── */}
      {view === "mes" && (
        <MonthView
          dataAtual={dataAtual}
          agendamentos={agendamentos}
          onDayClick={irParaDia}
        />
      )}

      {/* ── TIMELINE DIÁRIA ─────────────────────────────────────────────── */}
      {view === "dia" && <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.08)", overflow:"hidden" }}>

        {/* Cabeçalho da grade */}
        <div style={{ display:"flex", alignItems:"center", background:"#f7f4ee", borderBottom:"2px solid #e8e0d0", padding:"10px 16px 10px 68px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#8c8c8c", textTransform:"uppercase", letterSpacing:1 }}>
            Horário · {agsDia.length} agendamento{agsDia.length !== 1 ? "s" : ""} no dia
          </div>
        </div>

        {HORAS.map((hora, idx) => {
          const MAX_VAGAS  = 3;
          const cards      = agsNoHorario(hora);
          const isNow      = isHoje && horaAtual === parseInt(hora.split(":")[0]);
          const isEmpty    = cards.length === 0;
          const lotado     = cards.length >= MAX_VAGAS;
          const podaAdicionar = !lotado;

          return (
            <div
              key={hora}
              style={{
                display:"flex",
                borderBottom: idx < HORAS.length - 1 ? "1px solid #f0ebe0" : "none",
                minHeight: 80,
                background: isNow ? "#f5fff8" : "#fff",
                transition:"background .2s",
              }}
            >
              {/* Label de hora + indicador de vagas */}
              <div style={{ width:68, flexShrink:0, padding:"14px 0 0 18px", borderRight:"1px solid #f0ebe0" }}>
                <div style={{ fontSize:12, fontWeight:700, color: isNow ? "#2e7d46" : "#aaa", lineHeight:1 }}>
                  {hora}
                </div>
                {isNow && (
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"#2e7d46", marginTop:4 }}/>
                )}
                {!isEmpty && (
                  <div style={{ marginTop:6, display:"flex", gap:3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:"50%", background: i < cards.length ? "#3b5c3e" : "#e8e0d0" }}/>
                    ))}
                  </div>
                )}
              </div>

              {/* Área do slot */}
              <div
                style={{
                  flex:1, padding:"10px 14px", display:"flex", gap:10,
                  flexWrap:"wrap", alignContent:"flex-start",
                  cursor: isEmpty ? "pointer" : "default",
                  minHeight:80,
                  transition:"background .1s",
                }}
                onClick={() => isEmpty && setModal({ data: dataAtual, horaInicio: hora, horaFim: proxHora(hora) })}
                onMouseEnter={(e) => { if (isEmpty) e.currentTarget.style.background = "#fafaf8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                {isEmpty ? (
                  <div style={{ display:"flex", alignItems:"center", width:"100%", height:"100%", minHeight:60 }}>
                    <div style={{ fontSize:12, color:"#d0c8b8", fontStyle:"italic" }}>
                      Clique para agendar às {hora}
                    </div>
                  </div>
                ) : (
                  <>
                    {cards.map((ag) => (
                      <AgCard
                        key={ag.id}
                        ag={ag}
                        onEdit={(a) => setModal(a)}
                        onRemover={(id) => setConfirmarId(id)}
                      />
                    ))}

                    {/* Botão de adicionar (quando há vagas) */}
                    {podaAdicionar ? (
                      <button
                        onClick={() => setModal({ data: dataAtual, horaInicio: hora, horaFim: proxHora(hora) })}
                        title={`Adicionar aluno (${cards.length}/${MAX_VAGAS} vagas)`}
                        style={{
                          alignSelf:"center", background:"#f4efe5", border:"1.5px dashed #c8bfb0",
                          borderRadius:10, padding:"10px 14px", cursor:"pointer", color:"#8c8c8c",
                          display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                          minWidth:100, transition:"all .12s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background="#e6f4ec"; e.currentTarget.style.borderColor="#3b5c3e"; e.currentTarget.style.color="#3b5c3e"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background="#f4efe5"; e.currentTarget.style.borderColor="#c8bfb0"; e.currentTarget.style.color="#8c8c8c"; }}
                      >
                        <IcoPlus/>
                        <span style={{ fontSize:11, fontWeight:600 }}>{cards.length}/{MAX_VAGAS} vagas</span>
                      </button>
                    ) : (
                      <div style={{ alignSelf:"center", background:"#fce8e6", borderRadius:10, padding:"8px 14px", fontSize:11, fontWeight:700, color:"#c0392b", display:"flex", alignItems:"center", gap:5 }}>
                        🔒 Lotado
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>}

      {/* ── MODAL DE AGENDAMENTO ────────────────────────────────────────── */}
      {modal !== null && (
        <ModalAgendamento
          inicial={modal}
          alunos={alunos}
          instrutores={instrutores}
          modalidades={modalidades}
          onClose={() => setModal(null)}
          onSalvar={salvar}
          onCadastrarAluno={onCadastrarAluno}
        />
      )}

      {/* ── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ────────────────────────────── */}
      {confirmarId !== null && (
        <div
          style={{ position:"fixed", inset:0, left:220, background:"rgba(0,0,0,.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setConfirmarId(null)}
        >
          <div style={{ background:"#fff", borderRadius:14, padding:28, maxWidth:360, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:8 }}>Remover agendamento?</div>
            <div style={{ fontSize:13, color:"#8c8c8c", marginBottom:24 }}>Esta ação não pode ser desfeita.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmarId(null)} style={{ flex:1, padding:"11px 0", borderRadius:9, border:"1.5px solid #e8e0d0", background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
              <button onClick={() => remover(confirmarId)} style={{ flex:1, padding:"11px 0", borderRadius:9, border:"none", background:"#fce8e6", color:"#c0392b", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"calc(220px + 50%)", transform:"translateX(-50%)", background:"#1e1e1e", color:"#fff", padding:"10px 20px", borderRadius:30, fontSize:13, fontWeight:500, zIndex:400, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,.3)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
