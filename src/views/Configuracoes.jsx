"use client";
import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useInstrutores, useCreateInstrutor, useUpdateInstrutor, useDeleteInstrutor } from "../hooks/useInstrutores.js";
import { useModalidades, useCreateModalidade, useUpdateModalidade, useDeleteModalidade } from "../hooks/useModalidades.js";
import { useConfiguracoes, useUpdateConfiguracoes } from "../hooks/useConfiguracoes.js";
import { DURACOES_AULA, PRESET_CORES } from "../constants/index.js";
import { iniciais } from "../utils/format.js";

const Ic = {
  plus:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  x:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  save:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  cam:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  user:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// ── MODAL BASE ────────────────────────────────────────────────────────────────
function Modal({ titulo, onClose, onSalvar, isPending, children, largura=520 }) {
  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth:largura }} onClick={e => e.stopPropagation()}>
        <div className="sheet-head"><h3>{titulo}</h3><button className="sheet-close" onClick={onClose}>{Ic.x}</button></div>
        <div className="sheet-body">{children}</div>
        <div className="sheet-footer">
          <button className="btn btn-out btn-full" onClick={onClose}>Cancelar</button>
          <button className="btn btn-prim btn-full" onClick={onSalvar} disabled={isPending}>{Ic.save} {isPending ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL INSTRUTOR ───────────────────────────────────────────────────────────
function ModalInstrutor({ instrutor, modalidades, onClose, onSalvar, isPending }) {
  const [form, setForm] = useState({
    nome:        instrutor?.nome        || "",
    email:       instrutor?.email       || "",
    telefone:    instrutor?.telefone    || "",
    status:      instrutor?.status      || "ativo",
    foto:        instrutor?.foto        || null,
    modalidades: instrutor?.modalidades || [],
  });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("foto", ev.target.result);
    reader.readAsDataURL(file);
  };

  const toggleMod = (id) => set("modalidades",
    form.modalidades.includes(id) ? form.modalidades.filter(x => x !== id) : [...form.modalidades, id]
  );

  const salvar = () => {
    const e = {};
    if (!form.nome.trim())  e.nome  = "Obrigatório";
    if (!form.email.trim()) e.email = "Obrigatório";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSalvar({ ...form });
  };

  return (
    <Modal titulo={instrutor ? "Editar Instrutor" : "Novo Instrutor"} onClose={onClose} onSalvar={salvar} isPending={isPending}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <label className="foto-upload" onClick={() => fileRef.current.click()}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto}/>
          <div className="foto-wrap">
            {form.foto ? <img src={form.foto} alt="foto"/> : <span style={{ color:"var(--gd)", opacity:.6 }}>{Ic.user}</span>}
            <div className="foto-overlay">{Ic.cam}</div>
          </div>
        </label>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Foto de perfil</div>
          <div style={{ fontSize:11, color:"var(--mu)" }}>Clique para enviar. JPG ou PNG.</div>
          {form.foto && <button onClick={() => set("foto", null)} style={{ marginTop:6, fontSize:11, color:"var(--red)", background:"none", border:"none", cursor:"pointer", padding:0 }}>Remover foto</button>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Nome completo *</label>
        <input className="form-input" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: João Carlos Santos" style={errors.nome ? { borderColor:"var(--red)" } : {}}/>
        {errors.nome && <span style={{ fontSize:11, color:"var(--red)" }}>{errors.nome}</span>}
      </div>

      <div className="form-row" style={{ marginBottom:14 }}>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">E-mail *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="joao@studio.com" style={errors.email ? { borderColor:"var(--red)" } : {}}/>
          {errors.email && <span style={{ fontSize:11, color:"var(--red)" }}>{errors.email}</span>}
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Telefone</label>
          <input className="form-input" value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(61) 99999-0000"/>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <div style={{ display:"flex", gap:8 }}>
          {["ativo","inativo"].map(s => (
            <button key={s} onClick={() => set("status", s)} style={{ flex:1, padding:"10px", borderRadius:10, border:`2px solid ${form.status===s?"var(--gd)":"var(--sd)"}`, background:form.status===s?"var(--gd)":"var(--wh)", color:form.status===s?"#fff":"var(--tx)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              {s === "ativo" ? "🟢 Ativo" : "🔴 Inativo"}
            </button>
          ))}
        </div>
      </div>

      {modalidades.length > 0 && (
        <div className="form-group">
          <label className="form-label">Modalidades vinculadas</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {modalidades.map(m => {
              const on = form.modalidades.includes(m._id);
              return (
                <button key={m._id} onClick={() => toggleMod(m._id)} style={{ padding:"8px 14px", borderRadius:20, border:`2px solid ${on ? m.cor : "var(--sd)"}`, background:on ? m.cor : "var(--wh)", color:on ? "#fff" : "var(--tx)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {on && <span style={{ marginRight:4 }}>✓</span>}{m.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── MODAL MODALIDADE ──────────────────────────────────────────────────────────
function ModalModalidade({ modalidade, onClose, onSalvar, isPending }) {
  const [form, setForm] = useState({
    nome:       modalidade?.nome       || "",
    descricao:  modalidade?.descricao  || "",
    duracao:    modalidade?.duracao    || 60,
    cor:        modalidade?.cor        || PRESET_CORES[0],
    capacidade: modalidade?.capacidade || 6,
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const salvar = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.capacidade || form.capacidade < 1) e.cap = "Mínimo 1";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSalvar({ ...form });
  };

  return (
    <Modal titulo={modalidade ? "Editar Modalidade" : "Nova Modalidade"} onClose={onClose} onSalvar={salvar} isPending={isPending} largura={480}>
      <div className="form-group">
        <label className="form-label">Nome da aula *</label>
        <input className="form-input" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Pilates Aparelho" style={errors.nome ? { borderColor:"var(--red)" } : {}}/>
        {errors.nome && <span style={{ fontSize:11, color:"var(--red)" }}>{errors.nome}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-input" rows={2} value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Breve descrição..." style={{ resize:"none", lineHeight:1.5 }}/>
      </div>
      <div className="form-row" style={{ marginBottom:14 }}>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Duração</label>
          <select className="form-input" value={form.duracao} onChange={e => set("duracao", Number(e.target.value))}>
            {DURACOES_AULA.map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Capacidade máx.</label>
          <input className="form-input" type="number" min={1} max={50} value={form.capacidade} onChange={e => set("capacidade", Number(e.target.value))} style={errors.cap ? { borderColor:"var(--red)" } : {}}/>
          {errors.cap && <span style={{ fontSize:11, color:"var(--red)" }}>{errors.cap}</span>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Cor de identificação</label>
        <div className="color-grid">
          {PRESET_CORES.map(c => (
            <div key={c} className={`color-dot${form.cor===c?" on":""}`} style={{ background:c }} onClick={() => set("cor", c)}>
              {form.cor === c && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
          <label className="form-label" style={{ marginBottom:0, whiteSpace:"nowrap" }}>Ou escolha:</label>
          <input type="color" value={form.cor} onChange={e => set("cor", e.target.value)} style={{ width:40, height:32, borderRadius:8, border:"1.5px solid var(--sd)", cursor:"pointer", padding:2 }}/>
          <span style={{ fontSize:12, color:"var(--mu)", fontFamily:"monospace" }}>{form.cor}</span>
        </div>
      </div>
    </Modal>
  );
}

// ── ABA INSTRUTORES ───────────────────────────────────────────────────────────
function TabInstrutores({ instrutores, modalidades, showToast }) {
  const [modal, setModal]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [busca, setBusca]       = useState("");

  const { mutate: criar,    isPending: criando    } = useCreateInstrutor();
  const { mutate: atualizar, isPending: atualizando } = useUpdateInstrutor();
  const { mutate: deletar }  = useDeleteInstrutor();

  const lista = instrutores.filter(i =>
    i.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (i.email || "").toLowerCase().includes(busca.toLowerCase())
  );

  const salvar = (dados) => {
    if (modal?.item?._id) {
      atualizar({ id: modal.item._id, ...dados }, { onSuccess: () => { setModal(null); showToast("✓ Instrutor atualizado"); } });
    } else {
      criar(dados, { onSuccess: () => { setModal(null); showToast("✓ Instrutor cadastrado"); } });
    }
  };

  const excluir = (id) => {
    deletar(id, { onSuccess: () => { setConfirmDel(null); showToast("✓ Instrutor removido"); } });
  };

  const toggleStatus = (inst) => {
    atualizar({ id: inst._id, status: inst.status === "ativo" ? "inativo" : "ativo" }, { onSuccess: () => showToast("✓ Status atualizado") });
  };

  return (
    <>
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
        <div className="searchbar" style={{ flex:1, marginBottom:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--mu)" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="form-input" style={{ paddingLeft:38 }} placeholder="Buscar instrutor..." value={busca} onChange={e => setBusca(e.target.value)}/>
        </div>
        <button className="btn btn-prim" onClick={() => setModal({ tipo:"novo" })}>{Ic.plus} Novo instrutor</button>
      </div>

      {lista.length === 0
        ? <div className="empty"><div className="empty-ico">👤</div><p>Nenhum instrutor encontrado</p></div>
        : <div className="cfg-grid">
          {lista.map(inst => {
            const mods = modalidades.filter(m => (inst.modalidades || []).includes(m._id));
            return (
              <div key={inst._id} className="inst-card">
                <div className="inst-card-top">
                  <div className="inst-av">{inst.foto ? <img src={inst.foto} alt={inst.nome}/> : iniciais(inst.nome)}</div>
                  <div className="inst-info">
                    <div className="inst-nome">{inst.nome}</div>
                    <div className="inst-email">{inst.email}</div>
                    <div style={{ marginTop:5 }}>
                      <span className={`badge ${inst.status==="ativo"?"ok":"neu"}`}>{inst.status==="ativo"?"● Ativo":"○ Inativo"}</span>
                    </div>
                  </div>
                </div>
                {mods.length > 0 && (
                  <div className="inst-pills">
                    {mods.map(m => <span key={m._id} className="mod-pill" style={{ background:m.cor }}>{m.nome}</span>)}
                  </div>
                )}
                <div className="inst-actions">
                  <button className="btn btn-out btn-sm" style={{ flex:1 }} onClick={() => setModal({ tipo:"editar", item:inst })}>{Ic.edit} Editar</button>
                  <button className="btn btn-sm" style={{ flex:1, background:inst.status==="ativo"?"#fef3e2":"#e6f4ec", color:inst.status==="ativo"?"var(--amber)":"var(--grn)" }} onClick={() => toggleStatus(inst)}>
                    {inst.status === "ativo" ? "⏸ Inativar" : "▶ Ativar"}
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmDel(inst)}>{Ic.trash}</button>
                </div>
              </div>
            );
          })}
        </div>
      }

      {modal && (
        <ModalInstrutor
          instrutor={modal.item || null}
          modalidades={modalidades}
          onClose={() => setModal(null)}
          onSalvar={salvar}
          isPending={criando || atualizando}
        />
      )}

      {confirmDel && (
        <div className="sheet-overlay" onClick={() => setConfirmDel(null)}>
          <div className="confirm" onClick={e => e.stopPropagation()}>
            <h4>Remover instrutor?</h4>
            <p><strong>{confirmDel.nome}</strong> será removido permanentemente.</p>
            <div className="btn-row" style={{ justifyContent:"center" }}>
              <button className="btn btn-out" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => excluir(confirmDel._id)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ABA MODALIDADES ───────────────────────────────────────────────────────────
function TabModalidades({ modalidades, instrutores, showToast }) {
  const [modal, setModal]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const { mutate: criar,    isPending: criando    } = useCreateModalidade();
  const { mutate: atualizar, isPending: atualizando } = useUpdateModalidade();
  const { mutate: deletar }  = useDeleteModalidade();

  const salvar = (dados) => {
    if (modal?.item?._id) {
      atualizar({ id: modal.item._id, ...dados }, { onSuccess: () => { setModal(null); showToast("✓ Modalidade atualizada"); } });
    } else {
      criar(dados, { onSuccess: () => { setModal(null); showToast("✓ Modalidade criada"); } });
    }
  };

  const excluir = (id) => {
    deletar(id, { onSuccess: () => { setConfirmDel(null); showToast("✓ Modalidade removida"); } });
  };

  const contInst = (modId) => instrutores.filter(i => (i.modalidades || []).includes(modId)).length;

  return (
    <>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
        <button className="btn btn-prim" onClick={() => setModal({ tipo:"novo" })}>{Ic.plus} Nova modalidade</button>
      </div>

      {modalidades.length === 0
        ? <div className="empty"><div className="empty-ico">🏃</div><p>Nenhuma modalidade cadastrada</p></div>
        : <div className="cfg-grid">
          {modalidades.map(m => (
            <div key={m._id} className="mod-card" style={{ borderTopColor:m.cor }}>
              <div className="mod-card-body">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ width:14, height:14, borderRadius:"50%", background:m.cor, flexShrink:0 }}/>
                  <div className="mod-card-nome">{m.nome}</div>
                </div>
                <div className="mod-card-desc">{m.descricao || "—"}</div>
                <div className="mod-card-meta">
                  <span className="mod-chip">⏱ {m.duracao} min</span>
                  <span className="mod-chip">👥 Máx. {m.capacidade}</span>
                  <span className="mod-chip">🧑‍🏫 {contInst(m._id)} instrutores</span>
                </div>
              </div>
              <div className="mod-actions">
                <button className="btn btn-out btn-sm" style={{ flex:1 }} onClick={() => setModal({ tipo:"editar", item:m })}>{Ic.edit} Editar</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirmDel(m)}>{Ic.trash}</button>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <ModalModalidade
          modalidade={modal.item || null}
          onClose={() => setModal(null)}
          onSalvar={salvar}
          isPending={criando || atualizando}
        />
      )}

      {confirmDel && (
        <div className="sheet-overlay" onClick={() => setConfirmDel(null)}>
          <div className="confirm" onClick={e => e.stopPropagation()}>
            <h4>Remover modalidade?</h4>
            <p><strong>{confirmDel.nome}</strong> será removida.</p>
            <div className="btn-row" style={{ justifyContent:"center" }}>
              <button className="btn btn-out" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => excluir(confirmDel._id)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ABA AGENDA ────────────────────────────────────────────────────────────────
function TabAgenda({ instrutores, showToast }) {
  const { data: config } = useConfiguracoes();
  const { mutate: salvarConfig, isPending } = useUpdateConfiguracoes();

  const [horario, setHorario] = useState(null);
  const [instSel, setInstSel] = useState(instrutores[0]?._id || null);

  // Sincroniza horario local com o dado do banco
  const effectiveHorario = horario ?? config?.horario ?? [];

  const setH = (dia, campo, val) =>
    setHorario(p => (p ?? config?.horario ?? []).map(h => h.dia === dia ? { ...h, [campo]: val } : h));

  const handleSalvar = () => {
    salvarConfig({ horario: effectiveHorario }, { onSuccess: () => showToast("✓ Grade do estúdio salva") });
  };

  const instAtual = instrutores.find(i => i._id === instSel);

  return (
    <>
      <div className="agenda-section">
        <div className="agenda-sec-head">🏢 Funcionamento do estúdio</div>
        <div className="agenda-sec-body">
          <p style={{ fontSize:12, color:"var(--mu)", marginBottom:16 }}>
            Configure os dias e horários de funcionamento.
          </p>
          {effectiveHorario.map(h => (
            <div key={h.dia} className="day-row">
              <button className={`day-toggle${h.ativo?" on":""}`} onClick={() => setH(h.dia, "ativo", !h.ativo)}>{h.label}</button>
              <div className="day-times">
                <input className="day-input" type="time" value={h.abertura} disabled={!h.ativo} onChange={e => setH(h.dia, "abertura", e.target.value)}/>
                <span className="day-sep">até</span>
                <input className="day-input" type="time" value={h.fechamento} disabled={!h.ativo} onChange={e => setH(h.dia, "fechamento", e.target.value)}/>
                <span className="day-sep" style={{ marginLeft:4 }}>a cada</span>
                <select className="day-input" style={{ width:80 }} disabled={!h.ativo} value={h.intervalo} onChange={e => setH(h.dia, "intervalo", Number(e.target.value))}>
                  {[30,45,60,90].map(v => <option key={v} value={v}>{v}min</option>)}
                </select>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:14 }}>
            <button className="btn btn-prim" onClick={handleSalvar} disabled={isPending}>{Ic.save} {isPending ? "Salvando…" : "Salvar grade"}</button>
          </div>
        </div>
      </div>

      <div className="agenda-section">
        <div className="agenda-sec-head">🧑‍🏫 Disponibilidade por instrutor</div>
        <div className="agenda-sec-body">
          {instrutores.length === 0
            ? <div className="empty"><div className="empty-ico">👤</div><p>Cadastre instrutores primeiro</p></div>
            : <>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {instrutores.filter(i => i.status === "ativo").map(i => (
                  <button key={i._id} onClick={() => setInstSel(i._id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:10, border:`2px solid ${instSel===i._id?"var(--gd)":"var(--sd)"}`, background:instSel===i._id?"var(--gd)":"var(--wh)", color:instSel===i._id?"#fff":"var(--tx)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    {i.foto ? <img src={i.foto} style={{ width:24, height:24, borderRadius:"50%", objectFit:"cover" }} alt=""/> : <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{iniciais(i.nome)}</div>}
                    {i.nome.split(" ")[0]}
                  </button>
                ))}
              </div>
              {instAtual && (
                <p style={{ fontSize:12, color:"var(--mu)", marginBottom:12 }}>
                  Disponibilidade de <strong>{instAtual.nome}</strong> — funcionalidade em desenvolvimento.
                </p>
              )}
            </>
          }
        </div>
      </div>
    </>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Configuracoes() {
  const { showToast } = useApp();
  const [tab, setTab] = useState("instrutores");

  const { data: instrutores = [] } = useInstrutores();
  const { data: modalidades  = [] } = useModalidades();

  return (
    <>
      <div style={{ fontFamily:"Fraunces,serif", fontSize:22, fontWeight:600, color:"var(--gd)", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
        ⚙️ Configurações
      </div>

      <div className="cfg-tabs">
        {[["instrutores","🧑‍🏫 Instrutores"],["modalidades","🏃 Modalidades"],["agenda","📅 Agenda"]].map(([k,l]) => (
          <div key={k} className={`cfg-tab${tab===k?" on":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === "instrutores" && <TabInstrutores instrutores={instrutores} modalidades={modalidades} showToast={showToast}/>}
      {tab === "modalidades" && <TabModalidades modalidades={modalidades} instrutores={instrutores} showToast={showToast}/>}
      {tab === "agenda"      && <TabAgenda instrutores={instrutores} showToast={showToast}/>}
    </>
  );
}
