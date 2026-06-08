import { useState, useRef } from "react";

// ── DADOS INICIAIS ────────────────────────────────────────────────────────────
const INSTRUTORES_INIT = [
  { id:1, nome:"João Carlos",    email:"joao@studio.com",  telefone:"(61) 99111-0001", status:"ativo", foto:null, modalidades:[1,2] },
  { id:2, nome:"Maria Luiza",    email:"maria@studio.com", telefone:"(61) 99111-0002", status:"ativo", foto:null, modalidades:[1,3] },
  { id:3, nome:"Ana Paula",      email:"ana@studio.com",   telefone:"(61) 99111-0003", status:"ativo", foto:null, modalidades:[2,4] },
  { id:4, nome:"Pedro Henrique", email:"pedro@studio.com", telefone:"(61) 99111-0004", status:"ativo", foto:null, modalidades:[1] },
];

const MODALIDADES_INIT = [
  { id:1, nome:"Aparelho",     descricao:"Pilates com equipamentos",        duracao:60, cor:"#3b5c3e", capacidade:4 },
  { id:2, nome:"Solo",         descricao:"Pilates no solo",                 duracao:60, cor:"#5c6e7f", capacidade:6 },
  { id:3, nome:"Funcional",    descricao:"Treino funcional completo",       duracao:45, cor:"#7f5c3e", capacidade:8 },
  { id:4, nome:"Experimental", descricao:"Aula experimental / avaliação",  duracao:45, cor:"#5c3e7f", capacidade:2 },
];

const HORARIO_INIT = [
  { dia:1, label:"Seg", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:2, label:"Ter", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:3, label:"Qua", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:4, label:"Qui", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:5, label:"Sex", ativo:true,  abertura:"07:00", fechamento:"21:00", intervalo:60 },
  { dia:6, label:"Sáb", ativo:true,  abertura:"08:00", fechamento:"14:00", intervalo:60 },
  { dia:0, label:"Dom", ativo:false, abertura:"08:00", fechamento:"12:00", intervalo:60 },
];

const DURACOES = [30,45,60,75,90];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const ini = (nome) => nome.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();

// ── ÍCONES ────────────────────────────────────────────────────────────────────
const Ic = {
  plus:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  x:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  save:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  cam:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  user:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS_CONFIG = `
.cfg-tabs{display:flex;gap:0;border-bottom:2px solid var(--sd);margin-bottom:24px;}
.cfg-tab{flex:1;padding:12px 8px;text-align:center;font-size:13px;font-weight:600;color:var(--mu);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;}
.cfg-tab.on{color:var(--gd);border-bottom-color:var(--gd);}

.cfg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:14px;}

.inst-card{background:var(--wh);border-radius:14px;box-shadow:var(--sh);overflow:hidden;transition:all .15s;}
.inst-card:hover{box-shadow:0 4px 24px rgba(0,0,0,.13);}
.inst-card-top{padding:20px 18px 14px;display:flex;align-items:center;gap:14px;}
.inst-av{width:56px;height:56px;border-radius:50%;background:var(--gl);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:20px;color:var(--gd);font-weight:600;flex-shrink:0;overflow:hidden;}
.inst-av img{width:100%;height:100%;object-fit:cover;}
.inst-info{flex:1;min-width:0;}
.inst-nome{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.inst-email{font-size:12px;color:var(--mu);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.inst-pills{display:flex;flex-wrap:wrap;gap:5px;padding:0 18px 14px;}
.mod-pill{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;color:#fff;white-space:nowrap;}
.inst-actions{display:flex;gap:8px;padding:10px 18px;background:var(--wm);border-top:1px solid var(--sd);}

.mod-card{background:var(--wh);border-radius:14px;box-shadow:var(--sh);overflow:hidden;border-top:4px solid var(--sd);transition:all .15s;}
.mod-card:hover{box-shadow:0 4px 24px rgba(0,0,0,.13);}
.mod-card-body{padding:18px;}
.mod-card-nome{font-size:15px;font-weight:700;margin-bottom:4px;}
.mod-card-desc{font-size:12px;color:var(--mu);margin-bottom:12px;line-height:1.4;}
.mod-card-meta{display:flex;gap:8px;flex-wrap:wrap;}
.mod-chip{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--wm);color:var(--tx);}
.mod-actions{display:flex;gap:8px;padding:10px 18px;background:var(--wm);border-top:1px solid var(--sd);}

.agenda-section{background:var(--wh);border-radius:14px;box-shadow:var(--sh);margin-bottom:16px;overflow:hidden;}
.agenda-sec-head{padding:16px 20px;border-bottom:1px solid var(--sd);font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;}
.agenda-sec-body{padding:16px 20px;}
.day-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--sd);}
.day-row:last-child{border-bottom:none;}
.day-toggle{width:42px;height:42px;border-radius:50%;border:2px solid var(--sd);background:var(--wh);font-size:12px;font-weight:700;color:var(--mu);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.day-toggle.on{background:var(--gd);color:#fff;border-color:var(--gd);}
.day-times{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;}
.day-input{border:1.5px solid var(--sd);border-radius:8px;padding:7px 10px;font-size:13px;font-family:inherit;color:var(--tx);background:var(--wh);outline:none;transition:border .15s;width:90px;}
.day-input:focus{border-color:var(--gd);}
.day-input:disabled{background:var(--wm);color:var(--mu);}
.day-sep{font-size:12px;color:var(--mu);font-weight:600;}

.foto-upload{position:relative;cursor:pointer;}
.foto-upload input{display:none;}
.foto-wrap{width:80px;height:80px;border-radius:50%;background:var(--gl);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;transition:all .15s;}
.foto-wrap:hover .foto-overlay{opacity:1;}
.foto-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;border-radius:50%;opacity:0;transition:opacity .2s;}
.foto-wrap img{width:100%;height:100%;object-fit:cover;}

.color-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
.color-dot{width:32px;height:32px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .15s;display:flex;align-items:center;justify-content:center;}
.color-dot.on{border-color:var(--tx);transform:scale(1.15);}
`;

const PRESET_CORES = [
  "#3b5c3e","#5c6e7f","#7f5c3e","#5c3e7f","#7f3e5c",
  "#3e5c7f","#5c7f3e","#7f6e3e","#3e7f6e","#c47a0a",
];

// ── MODAL BASE ────────────────────────────────────────────────────────────────
function Modal({ titulo, onClose, onSalvar, children, largura=520 }) {
  return (
    <div className="sheet-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sheet" style={{maxWidth:largura}} onClick={e=>e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{titulo}</h3>
          <button className="sheet-close" onClick={onClose}>{Ic.x}</button>
        </div>
        <div className="sheet-body">{children}</div>
        <div className="sheet-footer">
          <button className="btn btn-out btn-full" onClick={onClose}>Cancelar</button>
          <button className="btn btn-prim btn-full" onClick={onSalvar}>{Ic.save} Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL INSTRUTOR ───────────────────────────────────────────────────────────
function ModalInstrutor({ instrutor, modalidades, onClose, onSalvar }) {
  const [form, setForm] = useState({
    nome:       instrutor?.nome       || "",
    email:      instrutor?.email      || "",
    telefone:   instrutor?.telefone   || "",
    status:     instrutor?.status     || "ativo",
    foto:       instrutor?.foto       || null,
    modalidades:instrutor?.modalidades|| [],
  });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("foto", ev.target.result);
    reader.readAsDataURL(file);
  };

  const toggleMod = (id) => set("modalidades",
    form.modalidades.includes(id)
      ? form.modalidades.filter(x=>x!==id)
      : [...form.modalidades, id]
  );

  const validate = () => {
    const e = {};
    if (!form.nome.trim())  e.nome  = "Obrigatório";
    if (!form.email.trim()) e.email = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const salvar = () => {
    if (!validate()) return;
    onSalvar({ ...instrutor, ...form, id: instrutor?.id || Date.now() });
  };

  return (
    <Modal titulo={instrutor ? "Editar Instrutor" : "Novo Instrutor"} onClose={onClose} onSalvar={salvar}>
      {/* Foto */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
        <label className="foto-upload" onClick={()=>fileRef.current.click()}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto}/>
          <div className="foto-wrap">
            {form.foto
              ? <img src={form.foto} alt="foto"/>
              : <span style={{color:"var(--gd)",opacity:.6}}>{Ic.user}</span>
            }
            <div className="foto-overlay">{Ic.cam}</div>
          </div>
        </label>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Foto de perfil</div>
          <div style={{fontSize:11,color:"var(--mu)"}}>Clique para enviar. JPG ou PNG.</div>
          {form.foto && (
            <button onClick={()=>set("foto",null)} style={{marginTop:6,fontSize:11,color:"var(--red)",background:"none",border:"none",cursor:"pointer",padding:0}}>
              Remover foto
            </button>
          )}
        </div>
      </div>

      {/* Nome */}
      <div className="form-group">
        <label className="form-label">Nome completo *</label>
        <input className="form-input" value={form.nome} onChange={e=>set("nome",e.target.value)}
          placeholder="Ex: João Carlos Santos" style={errors.nome?{borderColor:"var(--red)"}:{}}/>
        {errors.nome && <span style={{fontSize:11,color:"var(--red)"}}>{errors.nome}</span>}
      </div>

      {/* Email + Telefone */}
      <div className="form-row" style={{marginBottom:14}}>
        <div className="form-group" style={{marginBottom:0}}>
          <label className="form-label">E-mail *</label>
          <input className="form-input" type="email" value={form.email} onChange={e=>set("email",e.target.value)}
            placeholder="joao@studio.com" style={errors.email?{borderColor:"var(--red)"}:{}}/>
          {errors.email && <span style={{fontSize:11,color:"var(--red)"}}>{errors.email}</span>}
        </div>
        <div className="form-group" style={{marginBottom:0}}>
          <label className="form-label">Telefone</label>
          <input className="form-input" value={form.telefone} onChange={e=>set("telefone",e.target.value)}
            placeholder="(61) 99999-0000"/>
        </div>
      </div>

      {/* Status */}
      <div className="form-group">
        <label className="form-label">Status</label>
        <div style={{display:"flex",gap:8}}>
          {["ativo","inativo"].map(s=>(
            <button key={s} onClick={()=>set("status",s)} style={{
              flex:1,padding:"10px",borderRadius:10,border:`2px solid ${form.status===s?"var(--gd)":"var(--sd)"}`,
              background:form.status===s?"var(--gd)":"var(--wh)",color:form.status===s?"#fff":"var(--tx)",
              fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .15s",fontFamily:"inherit",
            }}>
              {s==="ativo" ? "🟢 Ativo" : "🔴 Inativo"}
            </button>
          ))}
        </div>
      </div>

      {/* Modalidades */}
      {modalidades.length > 0 && (
        <div className="form-group">
          <label className="form-label">Modalidades vinculadas</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {modalidades.map(m=>{
              const on = form.modalidades.includes(m.id);
              return (
                <button key={m.id} onClick={()=>toggleMod(m.id)} style={{
                  padding:"8px 14px",borderRadius:20,border:`2px solid ${on?m.cor:"var(--sd)"}`,
                  background:on?m.cor:"var(--wh)",color:on?"#fff":"var(--tx)",
                  fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",fontFamily:"inherit",
                }}>
                  {on && <span style={{marginRight:4}}>✓</span>}{m.nome}
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
function ModalModalidade({ modalidade, onClose, onSalvar }) {
  const [form, setForm] = useState({
    nome:       modalidade?.nome       || "",
    descricao:  modalidade?.descricao  || "",
    duracao:    modalidade?.duracao    || 60,
    cor:        modalidade?.cor        || PRESET_CORES[0],
    capacidade: modalidade?.capacidade || 6,
  });
  const [errors, setErrors] = useState({});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.capacidade || form.capacidade < 1) e.cap = "Mínimo 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const salvar = () => {
    if (!validate()) return;
    onSalvar({ ...modalidade, ...form, id: modalidade?.id || Date.now() });
  };

  return (
    <Modal titulo={modalidade ? "Editar Modalidade" : "Nova Modalidade"} onClose={onClose} onSalvar={salvar} largura={480}>
      {/* Nome */}
      <div className="form-group">
        <label className="form-label">Nome da aula *</label>
        <input className="form-input" value={form.nome} onChange={e=>set("nome",e.target.value)}
          placeholder="Ex: Pilates Aparelho" style={errors.nome?{borderColor:"var(--red)"}:{}}/>
        {errors.nome && <span style={{fontSize:11,color:"var(--red)"}}>{errors.nome}</span>}
      </div>

      {/* Descrição */}
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-input" rows={2} value={form.descricao}
          onChange={e=>set("descricao",e.target.value)}
          placeholder="Breve descrição da modalidade..."
          style={{resize:"none",lineHeight:1.5}}/>
      </div>

      {/* Duração + Capacidade */}
      <div className="form-row" style={{marginBottom:14}}>
        <div className="form-group" style={{marginBottom:0}}>
          <label className="form-label">Duração</label>
          <select className="form-input" value={form.duracao} onChange={e=>set("duracao",Number(e.target.value))}>
            {DURACOES.map(d=><option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div className="form-group" style={{marginBottom:0}}>
          <label className="form-label">Capacidade máx.</label>
          <input className="form-input" type="number" min={1} max={50} value={form.capacidade}
            onChange={e=>set("capacidade",Number(e.target.value))}
            style={errors.cap?{borderColor:"var(--red)"}:{}}/>
          {errors.cap && <span style={{fontSize:11,color:"var(--red)"}}>{errors.cap}</span>}
        </div>
      </div>

      {/* Cor */}
      <div className="form-group">
        <label className="form-label">Cor de identificação na agenda</label>
        <div className="color-grid">
          {PRESET_CORES.map(c=>(
            <div key={c} className={`color-dot${form.cor===c?" on":""}`}
              style={{background:c}} onClick={()=>set("cor",c)}>
              {form.cor===c && <span style={{color:"#fff",fontSize:12}}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
          <label className="form-label" style={{marginBottom:0,whiteSpace:"nowrap"}}>Ou escolha:</label>
          <input type="color" value={form.cor} onChange={e=>set("cor",e.target.value)}
            style={{width:40,height:32,borderRadius:8,border:"1.5px solid var(--sd)",cursor:"pointer",padding:2}}/>
          <span style={{fontSize:12,color:"var(--mu)",fontFamily:"monospace"}}>{form.cor}</span>
        </div>
      </div>
    </Modal>
  );
}

// ── ABA INSTRUTORES ───────────────────────────────────────────────────────────
function TabInstrutores({ instrutores, setInstrutores, modalidades, showToast }) {
  const [modal, setModal] = useState(null); // null | {tipo:"novo"|"editar", item?}
  const [confirmDel, setConfirmDel] = useState(null);
  const [busca, setBusca] = useState("");

  const lista = instrutores.filter(i =>
    i.nome.toLowerCase().includes(busca.toLowerCase()) ||
    i.email.toLowerCase().includes(busca.toLowerCase())
  );

  const salvar = (dados) => {
    if (dados.id && instrutores.find(i=>i.id===dados.id)) {
      setInstrutores(p=>p.map(i=>i.id===dados.id?dados:i));
      showToast("✓ Instrutor atualizado");
    } else {
      setInstrutores(p=>[...p, dados]);
      showToast("✓ Instrutor cadastrado");
    }
    setModal(null);
  };

  const excluir = (id) => {
    setInstrutores(p=>p.filter(i=>i.id!==id));
    showToast("✓ Instrutor removido");
    setConfirmDel(null);
  };

  const toggleStatus = (id) => {
    setInstrutores(p=>p.map(i=>i.id!==id?i:{...i,status:i.status==="ativo"?"inativo":"ativo"}));
  };

  return (
    <>
      {/* Barra de ações */}
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
        <div className="searchbar" style={{flex:1,marginBottom:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--mu)"}}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="form-input" style={{paddingLeft:38}} placeholder="Buscar instrutor..."
            value={busca} onChange={e=>setBusca(e.target.value)}/>
        </div>
        <button className="btn btn-prim" onClick={()=>setModal({tipo:"novo"})}>
          {Ic.plus} Novo instrutor
        </button>
      </div>

      {/* Cards */}
      {lista.length === 0
        ? <div className="empty"><div className="empty-ico">👤</div><p>Nenhum instrutor encontrado</p></div>
        : <div className="cfg-grid">
          {lista.map(inst=>{
            const mods = modalidades.filter(m=>inst.modalidades.includes(m.id));
            return (
              <div key={inst.id} className="inst-card">
                <div className="inst-card-top">
                  <div className="inst-av">
                    {inst.foto
                      ? <img src={inst.foto} alt={inst.nome}/>
                      : ini(inst.nome)
                    }
                  </div>
                  <div className="inst-info">
                    <div className="inst-nome">{inst.nome}</div>
                    <div className="inst-email">{inst.email}</div>
                    <div style={{marginTop:5}}>
                      <span className={`badge ${inst.status==="ativo"?"ok":"neu"}`}>
                        {inst.status==="ativo"?"● Ativo":"○ Inativo"}
                      </span>
                    </div>
                  </div>
                </div>
                {mods.length > 0 && (
                  <div className="inst-pills">
                    {mods.map(m=>(
                      <span key={m.id} className="mod-pill" style={{background:m.cor}}>{m.nome}</span>
                    ))}
                  </div>
                )}
                <div className="inst-actions">
                  <button className="btn btn-out btn-sm" style={{flex:1}} onClick={()=>setModal({tipo:"editar",item:inst})}>
                    {Ic.edit} Editar
                  </button>
                  <button className="btn btn-sm" style={{flex:1,background:inst.status==="ativo"?"#fef3e2":"#e6f4ec",color:inst.status==="ativo"?"var(--amber)":"var(--grn)"}}
                    onClick={()=>toggleStatus(inst.id)}>
                    {inst.status==="ativo"?"⏸ Inativar":"▶ Ativar"}
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={()=>setConfirmDel(inst)}>
                    {Ic.trash}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      }

      {/* Modal editar/novo */}
      {modal && (
        <ModalInstrutor
          instrutor={modal.item||null}
          modalidades={modalidades}
          onClose={()=>setModal(null)}
          onSalvar={salvar}
        />
      )}

      {/* Confirmar exclusão */}
      {confirmDel && (
        <div className="sheet-overlay" onClick={()=>setConfirmDel(null)}>
          <div className="confirm" onClick={e=>e.stopPropagation()}>
            <h4>Remover instrutor?</h4>
            <p><strong>{confirmDel.nome}</strong> será removido permanentemente. Aulas já agendadas não serão afetadas.</p>
            <div className="btn-row" style={{justifyContent:"center"}}>
              <button className="btn btn-out" onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={()=>excluir(confirmDel.id)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ABA MODALIDADES ───────────────────────────────────────────────────────────
function TabModalidades({ modalidades, setModalidades, instrutores, showToast }) {
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const salvar = (dados) => {
    if (dados.id && modalidades.find(m=>m.id===dados.id)) {
      setModalidades(p=>p.map(m=>m.id===dados.id?dados:m));
      showToast("✓ Modalidade atualizada");
    } else {
      setModalidades(p=>[...p, dados]);
      showToast("✓ Modalidade criada");
    }
    setModal(null);
  };

  const excluir = (id) => {
    setModalidades(p=>p.filter(m=>m.id!==id));
    showToast("✓ Modalidade removida");
    setConfirmDel(null);
  };

  const contInst = (modId) => instrutores.filter(i=>i.modalidades.includes(modId)).length;

  return (
    <>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
        <button className="btn btn-prim" onClick={()=>setModal({tipo:"novo"})}>
          {Ic.plus} Nova modalidade
        </button>
      </div>

      {modalidades.length === 0
        ? <div className="empty"><div className="empty-ico">🏃</div><p>Nenhuma modalidade cadastrada</p></div>
        : <div className="cfg-grid">
          {modalidades.map(m=>(
            <div key={m.id} className="mod-card" style={{borderTopColor:m.cor}}>
              <div className="mod-card-body">
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{width:14,height:14,borderRadius:"50%",background:m.cor,flexShrink:0}}/>
                  <div className="mod-card-nome">{m.nome}</div>
                </div>
                <div className="mod-card-desc">{m.descricao || "—"}</div>
                <div className="mod-card-meta">
                  <span className="mod-chip">⏱ {m.duracao} min</span>
                  <span className="mod-chip">👥 Máx. {m.capacidade}</span>
                  <span className="mod-chip">🧑‍🏫 {contInst(m.id)} instrutores</span>
                </div>
              </div>
              <div className="mod-actions">
                <button className="btn btn-out btn-sm" style={{flex:1}} onClick={()=>setModal({tipo:"editar",item:m})}>
                  {Ic.edit} Editar
                </button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={()=>setConfirmDel(m)}>
                  {Ic.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <ModalModalidade
          modalidade={modal.item||null}
          onClose={()=>setModal(null)}
          onSalvar={salvar}
        />
      )}

      {confirmDel && (
        <div className="sheet-overlay" onClick={()=>setConfirmDel(null)}>
          <div className="confirm" onClick={e=>e.stopPropagation()}>
            <h4>Remover modalidade?</h4>
            <p><strong>{confirmDel.nome}</strong> será removida. Instrutores vinculados perderão esse vínculo.</p>
            <div className="btn-row" style={{justifyContent:"center"}}>
              <button className="btn btn-out" onClick={()=>setConfirmDel(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={()=>excluir(confirmDel.id)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ABA AGENDA ────────────────────────────────────────────────────────────────
function TabAgenda({ instrutores, modalidades, showToast }) {
  const [horario, setHorario] = useState(HORARIO_INIT);
  const [instSel, setInstSel] = useState(instrutores[0]?.id || null);
  // disponibilidade: { [instId]: [{dia, ativo, inicio, fim}] }
  const [dispon, setDispon] = useState(() => {
    const d = {};
    instrutores.forEach(i => {
      d[i.id] = HORARIO_INIT.map(h=>({
        dia: h.dia, label: h.label,
        ativo: [1,3].includes(h.dia),
        inicio: "08:00", fim: "12:00",
      }));
    });
    return d;
  });

  const setH = (dia, campo, val) =>
    setHorario(p=>p.map(h=>h.dia===dia?{...h,[campo]:val}:h));

  const setD = (instId, dia, campo, val) =>
    setDispon(p=>({
      ...p,
      [instId]: (p[instId]||[]).map(d=>d.dia===dia?{...d,[campo]:val}:d)
    }));

  const instAtual = instrutores.find(i=>i.id===instSel);
  const diasInst  = dispon[instSel] || [];

  return (
    <>
      {/* Funcionamento do estúdio */}
      <div className="agenda-section">
        <div className="agenda-sec-head">🏢 Funcionamento do estúdio</div>
        <div className="agenda-sec-body">
          <p style={{fontSize:12,color:"var(--mu)",marginBottom:16}}>
            Configure os dias e horários de funcionamento. O intervalo define o espaçamento entre os slots de agenda.
          </p>
          {horario.map(h=>(
            <div key={h.dia} className="day-row">
              <button
                className={`day-toggle${h.ativo?" on":""}`}
                onClick={()=>setH(h.dia,"ativo",!h.ativo)}
              >{h.label}</button>

              <div className="day-times">
                <input className="day-input" type="time" value={h.abertura}
                  disabled={!h.ativo} onChange={e=>setH(h.dia,"abertura",e.target.value)}/>
                <span className="day-sep">até</span>
                <input className="day-input" type="time" value={h.fechamento}
                  disabled={!h.ativo} onChange={e=>setH(h.dia,"fechamento",e.target.value)}/>
                <span className="day-sep" style={{marginLeft:4}}>a cada</span>
                <select className="day-input" style={{width:80}} disabled={!h.ativo}
                  value={h.intervalo} onChange={e=>setH(h.dia,"intervalo",Number(e.target.value))}>
                  {[30,45,60,90].map(v=><option key={v} value={v}>{v}min</option>)}
                </select>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
            <button className="btn btn-prim" onClick={()=>showToast("✓ Grade do estúdio salva")}>
              {Ic.save} Salvar grade
            </button>
          </div>
        </div>
      </div>

      {/* Disponibilidade por instrutor */}
      <div className="agenda-section">
        <div className="agenda-sec-head">🧑‍🏫 Disponibilidade por instrutor</div>
        <div className="agenda-sec-body">
          {instrutores.length === 0
            ? <div className="empty"><div className="empty-ico">👤</div><p>Cadastre instrutores primeiro</p></div>
            : <>
              {/* Seletor de instrutor */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                {instrutores.filter(i=>i.status==="ativo").map(i=>(
                  <button key={i.id} onClick={()=>setInstSel(i.id)} style={{
                    display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,
                    border:`2px solid ${instSel===i.id?"var(--gd)":"var(--sd)"}`,
                    background:instSel===i.id?"var(--gd)":"var(--wh)",
                    color:instSel===i.id?"#fff":"var(--tx)",
                    fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",
                  }}>
                    {i.foto
                      ? <img src={i.foto} style={{width:24,height:24,borderRadius:"50%",objectFit:"cover"}} alt=""/>
                      : <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>
                          {ini(i.nome)}
                        </div>
                    }
                    {i.nome.split(" ")[0]}
                  </button>
                ))}
              </div>

              {instAtual && (
                <>
                  <p style={{fontSize:12,color:"var(--mu)",marginBottom:12}}>
                    Defina quais dias e horários <strong>{instAtual.nome}</strong> está disponível para dar aulas.
                  </p>
                  {diasInst.map(d=>{
                    const estDia = horario.find(h=>h.dia===d.dia);
                    const diaHabilitado = estDia?.ativo && d.ativo;
                    return (
                      <div key={d.dia} className="day-row">
                        <button
                          className={`day-toggle${d.ativo?" on":""}`}
                          onClick={()=>setD(instSel,d.dia,"ativo",!d.ativo)}
                          disabled={!estDia?.ativo}
                          title={!estDia?.ativo?"Estúdio fechado neste dia":""}
                          style={!estDia?.ativo?{opacity:.35,cursor:"not-allowed"}:{}}
                        >{d.label}</button>

                        <div className="day-times">
                          <input className="day-input" type="time" value={d.inicio}
                            disabled={!diaHabilitado}
                            onChange={e=>setD(instSel,d.dia,"inicio",e.target.value)}/>
                          <span className="day-sep">até</span>
                          <input className="day-input" type="time" value={d.fim}
                            disabled={!diaHabilitado}
                            onChange={e=>setD(instSel,d.dia,"fim",e.target.value)}/>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
                    <button className="btn btn-prim"
                      onClick={()=>showToast(`✓ Disponibilidade de ${instAtual.nome.split(" ")[0]} salva`)}>
                      {Ic.save} Salvar disponibilidade
                    </button>
                  </div>
                </>
              )}
            </>
          }
        </div>
      </div>
    </>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Configuracoes({ instrutores, setInstrutores, modalidades, setModalidades, showToast }) {
  const [tab, setTab] = useState("instrutores");

  return (
    <>
      <style>{CSS_CONFIG}</style>

      <div style={{fontFamily:"Fraunces,serif",fontSize:22,fontWeight:600,color:"var(--gd)",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
        ⚙️ Configurações
      </div>

      <div className="cfg-tabs">
        {[
          ["instrutores","🧑‍🏫 Instrutores"],
          ["modalidades","🏃 Modalidades"],
          ["agenda","📅 Agenda"],
        ].map(([k,l])=>(
          <div key={k} className={`cfg-tab${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="instrutores" && (
        <TabInstrutores
          instrutores={instrutores}
          setInstrutores={setInstrutores}
          modalidades={modalidades}
          showToast={showToast}
        />
      )}
      {tab==="modalidades" && (
        <TabModalidades
          modalidades={modalidades}
          setModalidades={setModalidades}
          instrutores={instrutores}
          showToast={showToast}
        />
      )}
      {tab==="agenda" && (
        <TabAgenda
          instrutores={instrutores}
          modalidades={modalidades}
          showToast={showToast}
        />
      )}
    </>
  );
}
