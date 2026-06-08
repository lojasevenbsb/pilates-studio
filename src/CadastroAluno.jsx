import { useState, useEffect } from "react";
import { FORMAS_PAGAMENTO, PERIODICIDADES, todayStr } from "./constants/index.js";
import { fmtIso } from "./utils/format.js";

// ── TABELA DE PREÇOS ──────────────────────────────────────────────────────────
const TABELA = {
  "1-mensal": 180,    "1-trimestral": 162,    "1-semestral": 144,
  "2-mensal": 280,    "2-trimestral": 252,    "2-semestral": 224,
  "3-mensal": 360,    "3-trimestral": 324,    "3-semestral": 288,
  "livre-mensal": 420,"livre-trimestral":378, "livre-semestral": 336,
};
const DIAS_VCT = Array.from({length:28}, (_,i) => String(i+1));

const addMeses = (iso, n) => { const d = new Date(iso+"T12:00"); d.setMonth(d.getMonth()+n); return fmtIso(d); };
const brl      = (v) => `R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmtCpf   = (v) => v.replace(/\D/g,"").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2").slice(0,14);
const fmtFone  = (v) => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2").slice(0,15);

const STEPS = [
  { id:1, label:"Dados Pessoais", icon:"👤" },
  { id:2, label:"Plano",          icon:"📋" },
  { id:3, label:"Contrato",       icon:"📄" },
  { id:4, label:"Financeiro",     icon:"💳" },
];

// ── UTILITÁRIOS DE ESTILO ─────────────────────────────────────────────────────
const inp  = (err) => ({
  width:"100%", border:`1.5px solid ${err?"#c0392b":"#e8e0d0"}`,
  borderRadius:10, padding:"12px 14px", fontSize:14, fontFamily:"inherit",
  color:"#1e1e1e", background:"#fff", outline:"none", transition:"border .15s",
});
const lbl  = { fontSize:11, fontWeight:700, color:"#8c8c8c", textTransform:"uppercase", letterSpacing:".5px", display:"block", marginBottom:6 };
const fg   = { marginBottom:18 };
const card = { background:"#fff", borderRadius:16, padding:"28px 32px", boxShadow:"0 2px 16px rgba(0,0,0,.07)", marginBottom:20 };
const errMsg = (msg) => msg ? <div style={{fontSize:11,color:"#c0392b",marginTop:4,fontWeight:600}}>{msg}</div> : null;

// ── STEPPER ───────────────────────────────────────────────────────────────────
function Stepper({ step, setStep, completedSteps }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32, background:"#fff", borderRadius:14, padding:"18px 24px", boxShadow:"0 2px 16px rgba(0,0,0,.07)" }}>
      {STEPS.map((s, idx) => {
        const done   = completedSteps.includes(s.id);
        const active = step === s.id;
        const canNav = done || s.id <= Math.max(...completedSteps, step);
        return (
          <div key={s.id} style={{ display:"flex", alignItems:"center", flex: idx < STEPS.length-1 ? 1 : "none" }}>
            <div
              style={{ display:"flex", alignItems:"center", gap:10, cursor: canNav ? "pointer" : "default" }}
              onClick={() => canNav && setStep(s.id)}
            >
              <div style={{
                width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:700, fontSize:14, transition:"all .2s",
                background: active ? "#3b5c3e" : done ? "#e6f4ec" : "#f4efe5",
                color: active ? "#fff" : done ? "#2e7d46" : "#8c8c8c",
                border: `2px solid ${active ? "#3b5c3e" : done ? "#2e7d46" : "#e8e0d0"}`,
              }}>
                {done && !active ? "✓" : s.id}
              </div>
              <div style={{ display:"flex", flexDirection:"column" }}>
                <span style={{ fontSize:11, color: active ? "#3b5c3e" : "#8c8c8c", fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>
                  Etapa {s.id}
                </span>
                <span style={{ fontSize:13, fontWeight: active ? 700 : 500, color: active ? "#1e1e1e" : "#8c8c8c" }}>
                  {s.label}
                </span>
              </div>
            </div>
            {idx < STEPS.length-1 && (
              <div style={{ flex:1, height:2, background: done ? "#a8c5ab" : "#e8e0d0", margin:"0 16px", borderRadius:1, transition:"background .3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── ETAPA 1 — DADOS PESSOAIS ──────────────────────────────────────────────────
function Step1({ form, set, errors }) {
  return (
    <div style={card}>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
        👤 Dados Pessoais
      </div>

      <div style={fg}>
        <label style={lbl}>Nome completo *</label>
        <input style={inp(errors.nome)} value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Nome completo do aluno"/>
        {errMsg(errors.nome)}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, ...fg }}>
        <div>
          <label style={lbl}>Telefone / WhatsApp *</label>
          <input style={inp(errors.telefone)} value={form.telefone} onChange={e=>set("telefone",fmtFone(e.target.value))} placeholder="(00) 00000-0000"/>
          {errMsg(errors.telefone)}
        </div>
        <div>
          <label style={lbl}>E-mail</label>
          <input type="email" style={inp()} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@exemplo.com"/>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <label style={lbl}>CPF *</label>
          <input style={inp(errors.cpf)} value={form.cpf} onChange={e=>set("cpf",fmtCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14}/>
          {errMsg(errors.cpf)}
        </div>
        <div>
          <label style={lbl}>Data de Nascimento</label>
          <input type="date" style={inp()} value={form.dataNascimento} onChange={e=>set("dataNascimento",e.target.value)}/>
        </div>
      </div>
    </div>
  );
}

// ── ETAPA 2 — CONFIGURAÇÃO DO PLANO ──────────────────────────────────────────
const DIAS_SEMANA = [
  { val:1, label:"Seg", nome:"Segunda-feira" },
  { val:2, label:"Ter", nome:"Terça-feira"   },
  { val:3, label:"Qua", nome:"Quarta-feira"  },
  { val:4, label:"Qui", nome:"Quinta-feira"  },
  { val:5, label:"Sex", nome:"Sexta-feira"   },
  { val:6, label:"Sáb", nome:"Sábado"        },
];
const HORARIOS_DISP = ["07:00","08:00","09:00","10:00","11:00","17:00","18:00","19:00","20:00"];

function Step2({ form, set, setForm, errors }) {
  const freqs = [
    { val:"1", label:"1× / semana" },
    { val:"2", label:"2× / semana" },
    { val:"3", label:"3× / semana" },
    { val:"livre", label:"Livre"   },
  ];

  const maxDias = form.frequencia === "livre" ? 6 : Number(form.frequencia) || 0;

  const toggleDia = (val) => {
    const atual = form.diasSemana || [];
    if (atual.includes(val)) {
      // remove dia e apaga horário associado
      const novoHorarios = { ...(form.horariosPorDia || {}) };
      delete novoHorarios[val];
      setForm(p => ({ ...p, diasSemana: atual.filter(d => d !== val), horariosPorDia: novoHorarios }));
    } else {
      if (atual.length < maxDias) {
        setForm(p => ({ ...p, diasSemana: [...atual, val] }));
      }
    }
  };

  const setHorarioDia = (diaVal, hora) => {
    setForm(p => ({ ...p, horariosPorDia: { ...(p.horariosPorDia || {}), [diaVal]: hora } }));
  };

  const totalDefinidos = Object.keys(form.horariosPorDia || {}).filter(k =>
    (form.diasSemana || []).includes(Number(k))
  ).length;
  const periodicidades = [
    { val:"mensal",     label:"Mensal",     desc:"Cobrado todo mês" },
    { val:"trimestral", label:"Trimestral", desc:"3 meses · ~10% off" },
    { val:"semestral",  label:"Semestral",  desc:"6 meses · ~20% off" },
  ];

  const precoTabela = TABELA[`${form.frequencia}-${form.periodicidade}`];

  return (
    <div style={card}>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
        📋 Configuração do Plano
      </div>

      {/* Periodicidade */}
      <div style={fg}>
        <label style={lbl}>Periodicidade *</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {periodicidades.map(p => (
            <div
              key={p.val}
              onClick={() => set("periodicidade", p.val)}
              style={{
                border:`2px solid ${form.periodicidade===p.val?"#3b5c3e":"#e8e0d0"}`,
                borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all .15s",
                background: form.periodicidade===p.val ? "#f0f7f1" : "#fff",
              }}
            >
              <div style={{ fontWeight:700, fontSize:15, color: form.periodicidade===p.val?"#3b5c3e":"#1e1e1e", marginBottom:3 }}>{p.label}</div>
              <div style={{ fontSize:12, color:"#8c8c8c" }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequência */}
      <div style={fg}>
        <label style={lbl}>Frequência semanal *</label>
        <div style={{ display:"flex", gap:8 }}>
          {freqs.map(f => (
            <button
              key={f.val}
              onClick={() => setForm(p => ({ ...p, frequencia: f.val, diasSemana: [], horariosPorDia: {} }))}
              style={{
                flex:1, padding:"11px 8px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                border:`2px solid ${form.frequencia===f.val?"#3b5c3e":"#e8e0d0"}`,
                background: form.frequencia===f.val ? "#3b5c3e" : "#fff",
                color: form.frequencia===f.val ? "#fff" : "#555",
                fontWeight: form.frequencia===f.val ? 700 : 500,
                fontSize:13, transition:"all .15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        {errMsg(errors.frequencia)}
      </div>

      {/* Dias da semana */}
      {form.frequencia && (
        <div style={fg}>
          <label style={lbl}>
            Dias de preferência *
            <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color: (form.diasSemana||[]).length === maxDias ? "#2e7d46" : "#c47a0a", marginLeft:8, fontSize:11 }}>
              {form.frequencia === "livre"
                ? `${(form.diasSemana||[]).length} selecionado(s)`
                : `${(form.diasSemana||[]).length} de ${maxDias} selecionado(s)`}
            </span>
          </label>
          <div style={{ display:"flex", gap:8 }}>
            {DIAS_SEMANA.map(d => {
              const selecionado = (form.diasSemana||[]).includes(d.val);
              const bloqueado   = !selecionado && (form.diasSemana||[]).length >= maxDias;
              return (
                <button
                  key={d.val}
                  onClick={() => !bloqueado && toggleDia(d.val)}
                  title={bloqueado ? `Limite de ${maxDias} dia(s) atingido` : d.label}
                  style={{
                    flex:1, padding:"12px 4px", borderRadius:10, fontFamily:"inherit",
                    border:`2px solid ${selecionado ? "#3b5c3e" : bloqueado ? "#f0ebe0" : "#e8e0d0"}`,
                    background: selecionado ? "#3b5c3e" : bloqueado ? "#fafaf8" : "#fff",
                    color: selecionado ? "#fff" : bloqueado ? "#ccc" : "#555",
                    fontWeight: selecionado ? 700 : 500,
                    fontSize:13, cursor: bloqueado ? "not-allowed" : "pointer",
                    transition:"all .15s",
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          {errMsg(errors.diasSemana)}
        </div>
      )}

      {/* Horário por dia */}
      {(form.diasSemana||[]).length > 0 && (
        <div style={fg}>
          <label style={lbl}>
            Horário por dia *
            <span style={{ fontWeight:500, textTransform:"none", letterSpacing:0, fontSize:11, marginLeft:8,
              color: totalDefinidos === (form.diasSemana||[]).length ? "#2e7d46" : "#c47a0a" }}>
              {totalDefinidos}/{(form.diasSemana||[]).length} definidos
            </span>
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:12, background:"#faf8f3", borderRadius:12, padding:"16px", border:"1.5px solid #e8e0d0" }}>
            {DIAS_SEMANA.filter(d => (form.diasSemana||[]).includes(d.val)).map(d => {
              const horSel = (form.horariosPorDia||{})[d.val];
              return (
                <div key={d.val}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#3b5c3e" }}>{d.nome}</span>
                    {horSel
                      ? <span style={{ background:"#3b5c3e", color:"#fff", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{horSel}</span>
                      : <span style={{ fontSize:11, color:"#c47a0a", fontWeight:600 }}>Selecione um horário</span>
                    }
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {HORARIOS_DISP.map(h => (
                      <button
                        key={h}
                        onClick={() => setHorarioDia(d.val, h)}
                        style={{
                          padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                          border:`1.5px solid ${horSel===h ? "#3b5c3e" : "#e8e0d0"}`,
                          background: horSel===h ? "#3b5c3e" : "#fff",
                          color: horSel===h ? "#fff" : "#555",
                          fontWeight: horSel===h ? 700 : 400,
                          fontSize:13, transition:"all .12s",
                        }}
                      >{h}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {errMsg(errors.horariosPorDia)}
        </div>
      )}

      {/* Valor */}
      <div>
        <label style={lbl}>Valor do plano (R$/mês) *</label>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <input
              style={inp(errors.valorPlano)}
              value={form.valorPlano}
              onChange={e => { set("valorPlano", e.target.value); set("valorEditado", true); }}
              placeholder="0,00"
            />
            {errMsg(errors.valorPlano)}
          </div>
          {precoTabela && form.valorEditado && String(precoTabela) !== form.valorPlano && (
            <button
              onClick={() => { set("valorPlano", String(precoTabela)); set("valorEditado", false); }}
              style={{ padding:"12px 16px", borderRadius:10, border:"1.5px solid #e8e0d0", background:"#f4efe5", fontSize:12, fontWeight:700, cursor:"pointer", color:"#3b5c3e", fontFamily:"inherit", whiteSpace:"nowrap" }}
            >
              ↩ Usar tabela ({brl(precoTabela)})
            </button>
          )}
        </div>
        {precoTabela && !form.valorEditado && (
          <div style={{ fontSize:12, color:"#2e7d46", marginTop:5, fontWeight:600 }}>
            ✓ Valor preenchido automaticamente pela tabela de planos
          </div>
        )}
        {form.valorEditado && (
          <div style={{ fontSize:12, color:"#c47a0a", marginTop:5, fontWeight:600 }}>
            ✎ Valor editado manualmente
          </div>
        )}
      </div>
    </div>
  );
}

// ── ETAPA 3 — DADOS DO CONTRATO ───────────────────────────────────────────────
function Step3({ form, set, errors }) {
  const periodoLabel = { mensal:"1 mês", trimestral:"3 meses", semestral:"6 meses" };
  return (
    <div style={card}>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
        📄 Dados do Contrato
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, ...fg }}>
        <div>
          <label style={lbl}>Data de Início *</label>
          <input type="date" style={inp(errors.dataInicio)} value={form.dataInicio} onChange={e=>set("dataInicio",e.target.value)}/>
          {errMsg(errors.dataInicio)}
        </div>
        <div>
          <label style={lbl}>Data de Término *</label>
          <input type="date" style={inp(errors.dataTermino)} value={form.dataTermino} onChange={e=>set("dataTermino",e.target.value)}/>
          {errMsg(errors.dataTermino)}
          <div style={{ fontSize:11, color:"#2e7d46", marginTop:4, fontWeight:600 }}>
            ✓ Calculado automaticamente ({periodoLabel[form.periodicidade]})
          </div>
        </div>
      </div>

      {/* Card resumo do contrato */}
      {form.dataInicio && form.dataTermino && (
        <div style={{ background:"#f0f7f1", borderRadius:12, padding:"18px 20px", border:"1.5px solid #a8c5ab" }}>
          <div style={{ fontWeight:700, fontSize:13, color:"#3b5c3e", marginBottom:12 }}>Resumo do Contrato</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {[
              { label:"Plano",    value: `${form.frequencia === "livre" ? "Livre" : form.frequencia+"× / sem"} · ${form.periodicidade.charAt(0).toUpperCase()+form.periodicidade.slice(1)}` },
              { label:"Vigência", value: `${new Date(form.dataInicio+"T12:00").toLocaleDateString("pt-BR")} → ${new Date(form.dataTermino+"T12:00").toLocaleDateString("pt-BR")}` },
              { label:"Valor/mês",value: brl(form.valorPlano) },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize:11, color:"#8c8c8c", fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>{item.label}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1e1e1e", marginTop:2 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {(form.diasSemana||[]).length > 0 && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #c5dbc8" }}>
              <div style={{ fontSize:11, color:"#8c8c8c", fontWeight:700, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Dias e horários de aula</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {DIAS_SEMANA.filter(d => (form.diasSemana||[]).includes(d.val)).map(d => {
                  const hora = (form.horariosPorDia||{})[d.val];
                  return (
                    <div key={d.val} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", borderRadius:8, padding:"8px 14px", border:"1px solid #c5dbc8" }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#1e1e1e" }}>{d.nome}</span>
                      {hora
                        ? <span style={{ background:"#3b5c3e", color:"#fff", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{hora}</span>
                        : <span style={{ fontSize:12, color:"#c47a0a", fontWeight:600 }}>Horário não definido</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #c5dbc8", display:"flex", gap:16 }}>
            <div>
              <span style={{ fontSize:11, color:"#8c8c8c", fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>Total do contrato</span>
              <div style={{ fontSize:20, fontFamily:"Fraunces,serif", fontWeight:600, color:"#3b5c3e" }}>
                {brl(Number(form.valorPlano||0) * PERIODICIDADES[form.periodicidade])}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ETAPA 4 — FINANCEIRO ──────────────────────────────────────────────────────
function Step4({ form, set, errors }) {
  const togglePag = (p) =>
    set("formasPagamento",
      form.formasPagamento.includes(p)
        ? form.formasPagamento.filter(x => x !== p)
        : [...form.formasPagamento, p]
    );

  const toggleParcelaPaga = (idx) => {
    const novas = (form.mensalidades || []).map((p, i) =>
      i === idx
        ? { ...p, pago: !p.pago, dataPag: !p.pago ? todayStr : null }
        : p
    );
    set("mensalidades", novas);
  };

  const ICONES = {
    "Pix":              "⚡",
    "Cartão de Crédito":"💳",
    "Cartão de Débito": "💳",
    "Boleto":           "📄",
    "Dinheiro":         "💵",
  };

  const parcelas     = form.mensalidades || [];
  const totalPago    = parcelas.filter(p => p.pago).reduce((s, p) => s + (p.valor||0), 0);
  const totalPendente= parcelas.filter(p => !p.pago).reduce((s, p) => s + (p.valor||0), 0);

  return (
    <div style={card}>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:20, fontWeight:600, color:"#3b5c3e", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
        💳 Financeiro e Pagamento
      </div>

      {/* Formas de pagamento */}
      <div style={fg}>
        <label style={lbl}>Formas de pagamento aceitas *</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {FORMAS_PAGAMENTO.map(f => {
            const on = form.formasPagamento.includes(f);
            return (
              <button
                key={f}
                onClick={() => togglePag(f)}
                style={{
                  padding:"10px 16px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  border:`2px solid ${on?"#3b5c3e":"#e8e0d0"}`,
                  background: on ? "#3b5c3e" : "#fff",
                  color: on ? "#fff" : "#555",
                  fontWeight: on ? 700 : 500, fontSize:13,
                  display:"flex", alignItems:"center", gap:7, transition:"all .15s",
                }}
              >
                {ICONES[f]} {f}
              </button>
            );
          })}
        </div>
        {errMsg(errors.formasPagamento)}
      </div>

      {/* Dia de vencimento */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, ...fg }}>
        <div>
          <label style={lbl}>Dia de vencimento *</label>
          <select style={inp(errors.diaVencimento)} value={form.diaVencimento} onChange={e=>set("diaVencimento",e.target.value)}>
            {DIAS_VCT.map(d => <option key={d} value={d}>Dia {d}</option>)}
          </select>
          {errMsg(errors.diaVencimento)}
        </div>
        <div>
          <label style={lbl}>Observações financeiras</label>
          <input style={inp()} value={form.obsFinanceiro||""} onChange={e=>set("obsFinanceiro",e.target.value)} placeholder="Desconto aplicado, bolsista, etc."/>
        </div>
      </div>

      {/* Parcelas geradas */}
      {parcelas.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <label style={lbl}>Parcelas do contrato</label>
            <div style={{ display:"flex", gap:10 }}>
              <span style={{ fontSize:11, fontWeight:700, background:"#e6f4ec", color:"#2e7d46", borderRadius:20, padding:"3px 12px" }}>
                ✓ Pago: {brl(totalPago)}
              </span>
              <span style={{ fontSize:11, fontWeight:700, background:"#fef3e2", color:"#c47a0a", borderRadius:20, padding:"3px 12px" }}>
                ◷ Pendente: {brl(totalPendente)}
              </span>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {parcelas.map((p, i) => (
              <div
                key={i}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background: p.pago ? "#f0faf3" : "#fff",
                  border:`1.5px solid ${p.pago ? "#a8c5ab" : "#e8e0d0"}`,
                  borderRadius:10, padding:"12px 16px",
                  transition:"all .15s",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: p.pago ? "#3b5c3e" : "#f4efe5",
                    fontSize:12, fontWeight:700, color: p.pago ? "#fff" : "#8c8c8c",
                  }}>{p.id}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#1e1e1e" }}>
                      {new Date(p.vencimento + "T12:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })}
                    </div>
                    {p.pago && p.dataPag && (
                      <div style={{ fontSize:11, color:"#2e7d46", fontWeight:600 }}>
                        Pago em {new Date(p.dataPag + "T12:00").toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#1e1e1e" }}>{brl(p.valor)}</span>
                  <button
                    onClick={() => toggleParcelaPaga(i)}
                    style={{
                      padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer",
                      fontFamily:"inherit", fontSize:12, fontWeight:700, transition:"all .15s",
                      background: p.pago ? "#3b5c3e" : "#fef3e2",
                      color: p.pago ? "#fff" : "#c47a0a",
                    }}
                  >
                    {p.pago ? "✓ Pago" : "◷ Pendente"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo final */}
      <div style={{ background:"#f7f4ee", borderRadius:12, padding:"20px 22px", border:"1.5px solid #e8e0d0" }}>
        <div style={{ fontWeight:700, fontSize:13, color:"#3b5c3e", marginBottom:14 }}>Resumo Final do Cadastro</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { label:"Aluno",       value: form.nome || "—" },
            { label:"CPF",         value: form.cpf  || "—" },
            { label:"Plano",       value: `${form.periodicidade.charAt(0).toUpperCase()+form.periodicidade.slice(1)} · ${form.frequencia==="livre"?"Livre":form.frequencia+"× sem"}` },
            { label:"Valor/mês",   value: brl(form.valorPlano) },
            { label:"Início",      value: form.dataInicio ? new Date(form.dataInicio+"T12:00").toLocaleDateString("pt-BR") : "—" },
            { label:"Término",     value: form.dataTermino? new Date(form.dataTermino+"T12:00").toLocaleDateString("pt-BR"): "—" },
            { label:"Vencimento",  value: `Todo dia ${form.diaVencimento}` },
            { label:"Pagamento",   value: form.formasPagamento.join(", ") || "—" },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #e8e0d0" }}>
              <span style={{ fontSize:12, color:"#8c8c8c", fontWeight:600 }}>{item.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#1e1e1e", textAlign:"right", maxWidth:"60%" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function CadastroAluno({ aluno = null, onVoltar, onSalvar }) {
  const isEdit = !!aluno?.id;

  const [step, setStep]           = useState(1);
  const [completed, setCompleted] = useState(isEdit ? [1,2,3,4] : []);
  const [errors, setErrors]       = useState({});
  const [saved, setSaved]         = useState(false);

  const [form, setForm] = useState({
    id:             aluno?.id             || null,
    nome:           aluno?.nome           || "",
    telefone:       aluno?.telefone       || "",
    email:          aluno?.email          || "",
    cpf:            aluno?.cpf            || "",
    dataNascimento: aluno?.dataNascimento || "",
    periodicidade:  aluno?.periodicidade  || "mensal",
    frequencia:     aluno?.frequencia     || "2",
    valorPlano:     aluno?.valorPlano     || "",
    valorEditado:   false,
    dataInicio:     aluno?.dataInicio     || todayStr,
    dataTermino:    aluno?.dataTermino    || "",
    formasPagamento:aluno?.formasPagamento|| [],
    diaVencimento:  aluno?.diaVencimento  || "10",
    obsFinanceiro:  aluno?.obsFinanceiro  || "",
    ativo:          aluno?.ativo          !== undefined ? aluno.ativo : true,
    // mantém campos existentes do sistema
    diasSemana:     aluno?.diasSemana     || [],
    horario:        aluno?.horario        || "",
    horariosPorDia: aluno?.horariosPorDia || {},
    mensalidades:   aluno?.mensalidades   || [],
    frequencias:    aluno?.frequencias    || [],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Auto-calcular valor
  useEffect(() => {
    if (!form.valorEditado) {
      const key = `${form.frequencia}-${form.periodicidade}`;
      const val = TABELA[key];
      if (val) set("valorPlano", String(val));
    }
  }, [form.frequencia, form.periodicidade, form.valorEditado]);

  // Auto-calcular término
  useEffect(() => {
    if (form.dataInicio && form.periodicidade) {
      set("dataTermino", addMeses(form.dataInicio, PERIODICIDADES[form.periodicidade]));
    }
  }, [form.dataInicio, form.periodicidade]);

  // Gerar parcelas ao entrar na etapa 4
  useEffect(() => {
    if (step === 4 && form.dataInicio && form.periodicidade && form.diaVencimento && form.valorPlano) {
      const [ano, mes] = form.dataInicio.split("-").map(Number);
      const dia = Number(form.diaVencimento) || 10;

      // Mensal: gera do mês de início até dezembro do mesmo ano (recorrente)
      const nMeses = form.periodicidade === "mensal"
        ? (12 - mes + 1)
        : (PERIODICIDADES[form.periodicidade] || 1);

      const novasParcelas = Array.from({ length: nMeses }, (_, i) => {
        const d = new Date(ano, mes - 1 + i, dia);
        const vencimento = fmtIso(d);
        const mesStr = vencimento.slice(0, 7);
        // preserva status pago se parcela já existia
        const existente = (form.mensalidades || []).find(p => p.mes === mesStr);
        return {
          id:        i + 1,
          mes:       mesStr,
          vencimento,
          valor:     Number(form.valorPlano) || 0,
          pago:      existente?.pago    || false,
          dataPag:   existente?.dataPag || null,
        };
      });

      setForm(p => ({ ...p, mensalidades: novasParcelas }));
    }
  }, [step]);

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.nome.trim())     e.nome     = "Campo obrigatório";
      if (!form.telefone.trim()) e.telefone = "Campo obrigatório";
      if (!form.cpf.trim())      e.cpf      = "Campo obrigatório";
    }
    if (s === 2) {
      if (!form.frequencia) e.frequencia = "Selecione a frequência";
      if (!form.valorPlano) e.valorPlano = "Informe o valor do plano";
      const maxD = form.frequencia === "livre" ? 1 : Number(form.frequencia) || 0;
      if (!(form.diasSemana||[]).length) e.diasSemana = "Selecione os dias de preferência";
      else if (form.frequencia !== "livre" && (form.diasSemana||[]).length < maxD)
        e.diasSemana = `Selecione ${maxD} dia(s) para o plano ${form.frequencia}× / semana`;
      const diasSel = form.diasSemana || [];
      const semHorario = diasSel.filter(d => !(form.horariosPorDia||{})[d]);
      if (diasSel.length > 0 && semHorario.length > 0) {
        const nomes = DIAS_SEMANA.filter(d => semHorario.includes(d.val)).map(d => d.nome).join(", ");
        e.horariosPorDia = `Defina o horário para: ${nomes}`;
      }
    }
    if (s === 3) {
      if (!form.dataInicio)  e.dataInicio  = "Campo obrigatório";
      if (!form.dataTermino) e.dataTermino = "Campo obrigatório";
    }
    if (s === 4) {
      if (!form.formasPagamento.length) e.formasPagamento = "Selecione ao menos uma forma";
      if (!form.diaVencimento)          e.diaVencimento   = "Campo obrigatório";
    }
    return e;
  };

  const avancar = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setCompleted((p) => p.includes(step) ? p : [...p, step]);
    setStep((s) => Math.min(s + 1, 4));
  };

  const voltar = () => { setErrors({}); setStep((s) => Math.max(s - 1, 1)); };

  const handleSalvar = () => {
    const errs = validate(4);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCompleted([1,2,3,4]);

    // Deriva planoId para compatibilidade com o sistema existente
    const freqNum  = form.frequencia === "livre" ? "livre" : form.frequencia;
    const planoId  = `${freqNum}_${form.periodicidade === "mensal" ? "mensal" : form.periodicidade === "trimestral" ? "trimest" : "semest"}`;
    const mesAtual = todayStr.slice(0,7);

    const payload = {
      ...form,
      planoId,
      dataVencimento: form.dataTermino,
      mensalidades: form.mensalidades || [],
    };

    setSaved(true);
    setTimeout(() => { onSalvar && onSalvar(payload); }, 600);
  };

  // ── TELA DE SUCESSO ───────────────────────────────────────────────────────
  if (saved) {
    return (
      <div style={{ padding:"28px", maxWidth:720, textAlign:"center", paddingTop:80 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <div style={{ fontFamily:"Fraunces,serif", fontSize:28, fontWeight:600, color:"#3b5c3e", marginBottom:8 }}>
          {isEdit ? "Dados atualizados!" : "Aluno cadastrado!"}
        </div>
        <div style={{ fontSize:15, color:"#8c8c8c", marginBottom:32 }}>
          {form.nome} foi {isEdit ? "atualizado" : "cadastrado"} com sucesso.
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onVoltar} style={{ padding:"12px 28px", borderRadius:10, border:"1.5px solid #e8e0d0", background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Voltar para Alunos
          </button>
          {!isEdit && (
            <button onClick={() => { setSaved(false); setStep(1); setCompleted([]); setForm(p=>({ ...p, id:null, nome:"", telefone:"", email:"", cpf:"", dataNascimento:"", formasPagamento:[], mensalidades:[], frequencias:[], diasSemana:[], horario:"" })); }}
              style={{ padding:"12px 28px", borderRadius:10, border:"none", background:"#3b5c3e", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Cadastrar novo aluno
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"28px", maxWidth:800 }}>

      {/* Título da página */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"Fraunces,serif", fontSize:26, fontWeight:600, color:"#3b5c3e", marginBottom:4 }}>
          {isEdit ? `Editar — ${aluno.nome.split(" ")[0]}` : "Cadastro de Aluno"}
        </div>
        <div style={{ fontSize:13, color:"#8c8c8c" }}>
          {isEdit ? "Atualize os dados e o contrato do aluno." : "Preencha os dados e configure o contrato de plano de aulas."}
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} setStep={setStep} completedSteps={completed}/>

      {/* Conteúdo da etapa */}
      {step === 1 && <Step1 form={form} set={set} errors={errors}/>}
      {step === 2 && <Step2 form={form} set={set} setForm={setForm} errors={errors}/>}
      {step === 3 && <Step3 form={form} set={set} errors={errors}/>}
      {step === 4 && <Step4 form={form} set={set} errors={errors}/>}

      {/* Navegação */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button
          onClick={step === 1 ? onVoltar : voltar}
          style={{ padding:"12px 24px", borderRadius:10, border:"1.5px solid #e8e0d0", background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}
        >
          ← {step === 1 ? "Cancelar" : "Etapa anterior"}
        </button>

        <div style={{ fontSize:12, color:"#8c8c8c", fontWeight:600 }}>
          Etapa {step} de {STEPS.length}
        </div>

        {step < 4 ? (
          <button
            onClick={avancar}
            style={{ padding:"12px 28px", borderRadius:10, border:"none", background:"#3b5c3e", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 14px rgba(59,92,62,.25)" }}
          >
            Próxima etapa →
          </button>
        ) : (
          <button
            onClick={handleSalvar}
            style={{ padding:"12px 28px", borderRadius:10, border:"none", background:"#3b5c3e", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 14px rgba(59,92,62,.25)" }}
          >
            ✓ {isEdit ? "Salvar alterações" : "Cadastrar aluno"}
          </button>
        )}
      </div>
    </div>
  );
}
