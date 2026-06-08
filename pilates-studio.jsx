import { useState, useEffect, useRef } from "react";
import AgendaDiaria from "./src/AgendaDiaria.jsx";
import CadastroAluno from "./src/CadastroAluno.jsx";
import Configuracoes from "./src/Configuracoes.jsx";

// ── DATA ────────────────────────────────────────────────────────────────────
const PLANOS = [
  { id:"1x_mensal",   freq:1, duracao:"Mensal",     meses:1,  valor:180 },
  { id:"1x_trimest",  freq:1, duracao:"Trimestral", meses:3,  valor:162 },
  { id:"1x_semest",   freq:1, duracao:"Semestral",  meses:6,  valor:144 },
  { id:"2x_mensal",   freq:2, duracao:"Mensal",     meses:1,  valor:280 },
  { id:"2x_trimest",  freq:2, duracao:"Trimestral", meses:3,  valor:252 },
  { id:"2x_semest",   freq:2, duracao:"Semestral",  meses:6,  valor:224 },
  { id:"3x_mensal",   freq:3, duracao:"Mensal",     meses:1,  valor:360 },
  { id:"3x_trimest",  freq:3, duracao:"Trimestral", meses:3,  valor:324 },
  { id:"3x_semest",   freq:3, duracao:"Semestral",  meses:6,  valor:288 },
];
const HORARIOS = ["07:00","08:00","09:00","10:00","11:00","17:00","18:00","19:00","20:00"];
const DS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const today = new Date();
const fmt = d => d.toISOString().split("T")[0];
const todayStr = fmt(today);
const todayDow = today.getDay();
const mesLabel = m => { const [y,mo]=m.split("-"); return `${mo}/${y}`; };
const proxHoraFmt = h => { const [hr,mn]=h.split(":").map(Number); const n=hr+1; return n>21?"21:00":`${String(n).padStart(2,"0")}:${String(mn).padStart(2,"0")}`; };

const AGS_INICIAIS = [
  {id:1,alunoNome:"Ana Beatriz Silva",    data:todayStr,horaInicio:"08:00",horaFim:"09:00",instrutor:"João Carlos",   tipo:"Aparelho",    status:"confirmado",obs:""},
  {id:2,alunoNome:"Carlos Eduardo Matos", data:todayStr,horaInicio:"07:00",horaFim:"08:00",instrutor:"Maria Luiza",   tipo:"Solo",        status:"confirmado",obs:""},
  {id:3,alunoNome:"Fernanda Costa Lima",  data:todayStr,horaInicio:"10:00",horaFim:"11:00",instrutor:"João Carlos",   tipo:"Aparelho",    status:"pendente",  obs:"Confirmação pendente"},
  {id:4,alunoNome:"Rodrigo Alves Pinto",  data:todayStr,horaInicio:"19:00",horaFim:"20:00",instrutor:"Ana Paula",     tipo:"Funcional",   status:"confirmado",obs:""},
  {id:5,alunoNome:"Juliana Ramos",        data:todayStr,horaInicio:"09:00",horaFim:"10:00",instrutor:"Maria Luiza",   tipo:"Experimental",status:"pendente",  obs:"Primeira aula"},
  {id:6,alunoNome:"Marcos Vieira",        data:todayStr,horaInicio:"18:00",horaFim:"19:00",instrutor:"Pedro Henrique",tipo:"Solo",        status:"confirmado",obs:""},
];
const brl = v => `R$ ${v.toLocaleString("pt-BR")}`;

const ALUNOS0 = [
  { id:1, nome:"Ana Beatriz Silva",    telefone:"(11) 99999-1111", email:"ana@email.com",      cpf:"111.222.333-44",
    planoId:"3x_mensal",   dataInicio:"2024-01-10", dataVencimento:"2026-07-10",
    diasSemana:[1,3,5], horario:"08:00", ativo:true,
    mensalidades:[
      {mes:"2026-05",valor:360,pago:true, dataPag:"2026-05-05"},
      {mes:"2026-06",valor:360,pago:false,dataPag:null},
    ],
    frequencias:[
      {data:fmt(new Date(today-86400000*2)),presente:true},
      {data:fmt(new Date(today-86400000*5)),presente:true},
      {data:fmt(new Date(today-86400000*7)),presente:false},
    ]},
  { id:2, nome:"Carlos Eduardo Matos", telefone:"(11) 98888-2222", email:"carlos@email.com",   cpf:"222.333.444-55",
    planoId:"2x_trimest",  dataInicio:"2026-03-01", dataVencimento:"2026-06-01",
    diasSemana:[2,4], horario:"07:00", ativo:true,
    mensalidades:[
      {mes:"2026-04",valor:252,pago:true, dataPag:"2026-04-02"},
      {mes:"2026-05",valor:252,pago:true, dataPag:"2026-05-03"},
      {mes:"2026-06",valor:252,pago:false,dataPag:null},
    ],
    frequencias:[
      {data:fmt(new Date(today-86400000*1)),presente:true},
      {data:fmt(new Date(today-86400000*3)),presente:true},
    ]},
  { id:3, nome:"Fernanda Costa Lima",  telefone:"(11) 97777-3333", email:"fernanda@email.com", cpf:"333.444.555-66",
    planoId:"1x_semest",   dataInicio:"2026-01-15", dataVencimento:"2026-07-15",
    diasSemana:[3], horario:"10:00", ativo:true,
    mensalidades:[
      {mes:"2026-05",valor:144,pago:true, dataPag:"2026-05-01"},
      {mes:"2026-06",valor:144,pago:false,dataPag:null},
    ],
    frequencias:[]},
  { id:4, nome:"Rodrigo Alves Pinto",  telefone:"(11) 96666-4444", email:"rodrigo@email.com",  cpf:"444.555.666-77",
    planoId:"2x_mensal",   dataInicio:"2026-02-01", dataVencimento:"2026-08-01",
    diasSemana:[1,4], horario:"19:00", ativo:true,
    mensalidades:[
      {mes:"2026-05",valor:280,pago:true, dataPag:"2026-05-04"},
      {mes:"2026-06",valor:280,pago:false,dataPag:null},
    ],
    frequencias:[]},
];

// ── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
:root{
  --g:#5c7f60; --gl:#a8c5ab; --gd:#3b5c3e; --gxd:#273f29;
  --cr:#faf8f3; --sd:#e8e0d0; --wm:#f4efe5;
  --tx:#1e1e1e; --mu:#8c8c8c; --wh:#fff;
  --red:#c0392b; --amber:#c47a0a; --grn:#2e7d46;
  --r:14px; --sh:0 2px 16px rgba(0,0,0,.08);
  --bot:72px; --top:60px;
}
html,body,#root{height:100%;background:#e8e4dc;}
body{font-family:'Plus Jakarta Sans',sans-serif;color:var(--tx);overflow-x:hidden;}

/* DESKTOP SHELL */
.shell{
  display:flex; flex-direction:row; min-height:100vh; width:100%;
}

/* SIDEBAR NAV */
.botnav{
  width:220px; flex-shrink:0;
  background:var(--gd); color:#fff;
  display:flex; flex-direction:column;
  padding:0; position:fixed; top:0; left:0; height:100vh; z-index:50;
  box-shadow:4px 0 20px rgba(0,0,0,.12);
}
.botnav-logo{
  padding:28px 20px 24px;
  border-bottom:1px solid rgba(255,255,255,.15);
  font-family:'Fraunces',serif; font-size:22px; font-weight:600; color:#fff; letter-spacing:-.3px;
}
.botnav-logo span{font-size:11px; font-weight:400; display:block; color:var(--gl); letter-spacing:1.5px; text-transform:uppercase; font-family:'Plus Jakarta Sans',sans-serif; margin-top:-2px;}
.botnav-items{display:flex; flex-direction:column; padding:12px 10px; gap:4px; flex:1;}
.bn-item{display:flex; flex-direction:row; align-items:center; gap:12px; cursor:pointer; transition:all .15s; border:none; background:none; padding:11px 14px; border-radius:10px; width:100%; text-align:left;}
.bn-item svg{transition:all .15s; color:rgba(255,255,255,.55); flex-shrink:0;}
.bn-item span{font-size:14px; font-weight:500; color:rgba(255,255,255,.7); transition:all .15s;}
.bn-item.active{background:rgba(255,255,255,.15);}
.bn-item.active svg{color:#fff;}
.bn-item.active span{color:#fff; font-weight:700;}
.bn-item:hover:not(.active){background:rgba(255,255,255,.08);}

/* MAIN AREA */
.main-area{
  margin-left:220px; flex:1; display:flex; flex-direction:column; min-height:100vh;
}

/* TOP BAR */
.topbar{
  position:sticky; top:0; z-index:40;
  background:var(--wh); color:var(--tx);
  height:var(--top); display:flex; align-items:center;
  padding:0 28px; gap:10px;
  border-bottom:1px solid var(--sd);
  box-shadow:0 1px 8px rgba(0,0,0,.06);
}
.topbar-logo{font-family:'Fraunces',serif; font-size:20px; font-weight:600; flex:1; letter-spacing:-.3px; color:var(--gd);}
.topbar-logo span{font-size:11px; font-weight:400; display:block; color:var(--mu); letter-spacing:1.5px; text-transform:uppercase; font-family:'Plus Jakarta Sans',sans-serif; margin-top:-2px;}
.topbar-back{background:var(--wm); border:none; color:var(--tx); border-radius:8px; padding:7px 11px; cursor:pointer; font-size:13px; display:flex; align-items:center; gap:5px; font-family:inherit;}
.topbar-action{background:var(--gd); border:none; color:#fff; border-radius:8px; padding:8px 14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; font-weight:600; font-family:inherit;}

/* SCROLL AREA */
.scroll{flex:1; overflow-y:auto; padding:28px; -webkit-overflow-scrolling:touch; max-width:900px;}
.scroll.no-pad{padding-bottom:28px;}

/* CARDS STAT */
.stat-grid{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;}
.stat{background:var(--wh); border-radius:var(--r); padding:16px; box-shadow:var(--sh); position:relative; overflow:hidden;}
.stat::after{content:''; position:absolute; top:0; left:0; width:4px; height:100%; background:var(--gl);}
.stat.red::after{background:var(--red);}
.stat.amber::after{background:var(--amber);}
.stat.grn::after{background:var(--grn);}
.stat-num{font-family:'Fraunces',serif; font-size:30px; font-weight:600; color:var(--gd); line-height:1; margin-bottom:2px;}
.stat.red .stat-num{color:var(--red);}
.stat.amber .stat-num{color:var(--amber);}
.stat.grn .stat-num{color:var(--grn);}
.stat-label{font-size:11px; color:var(--mu); font-weight:500; text-transform:uppercase; letter-spacing:.4px;}

/* SECTION */
.section{background:var(--wh); border-radius:var(--r); box-shadow:var(--sh); overflow:hidden; margin-bottom:14px;}
.sec-head{display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--sd);}
.sec-head h3{font-size:14px; font-weight:700;}
.sec-link{font-size:12px; color:var(--gd); font-weight:600; background:none; border:none; cursor:pointer; padding:0;}

/* LIST ROWS */
.row{display:flex; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid var(--sd); cursor:pointer; transition:background .1s; -webkit-tap-highlight-color:rgba(0,0,0,.04);}
.row:last-child{border-bottom:none;}
.row:active{background:var(--wm);}
.row-av{width:40px; height:40px; border-radius:50%; background:var(--gl); display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-size:16px; color:var(--gd); font-weight:600; flex-shrink:0;}
.row-av.sm{width:34px; height:34px; font-size:13px;}
.row-body{flex:1; min-width:0;}
.row-name{font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.row-sub{font-size:12px; color:var(--mu); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.row-end{display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;}
.chev{color:var(--mu);}

/* BADGE */
.badge{display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap;}
.badge.ok{background:#e6f4ec; color:var(--grn);}
.badge.warn{background:#fef3e2; color:var(--amber);}
.badge.danger{background:#fce8e6; color:var(--red);}
.badge.neu{background:var(--sd); color:var(--mu);}

/* PILL ROW for agenda */
.pill-time{font-size:11px; font-weight:700; color:var(--gd); background:var(--wm); border-radius:6px; padding:3px 7px; flex-shrink:0;}

/* BUTTONS */
.btn{display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:11px 20px; border-radius:10px; border:none; cursor:pointer; font-size:14px; font-weight:600; font-family:inherit; transition:all .12s; -webkit-tap-highlight-color:rgba(0,0,0,.04);}
.btn:active{transform:scale(.97);}
.btn-prim{background:var(--gd); color:#fff;}
.btn-prim:active{background:var(--g);}
.btn-out{background:var(--wh); border:1.5px solid var(--sd); color:var(--tx);}
.btn-ok{background:#e6f4ec; color:var(--grn);}
.btn-danger{background:#fce8e6; color:var(--red);}
.btn-amber{background:#fef3e2; color:var(--amber);}
.btn-full{width:100%;}
.btn-sm{padding:7px 13px; font-size:12px; border-radius:8px;}
.btn-icon{padding:9px; border-radius:9px;}
.btn-row{display:flex; gap:8px;}

/* FORM */
.form-group{margin-bottom:14px;}
.form-label{font-size:11px; font-weight:700; color:var(--mu); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; display:block;}
.form-input{width:100%; border:1.5px solid var(--sd); border-radius:10px; padding:12px 14px; font-size:14px; font-family:inherit; color:var(--tx); background:var(--wh); outline:none; transition:border .15s; -webkit-appearance:none;}
.form-input:focus{border-color:var(--gd);}
.form-row{display:grid; grid-template-columns:1fr 1fr; gap:10px;}

/* DIAS */
.dias-row{display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;}
.dia-btn{width:40px; height:40px; border-radius:50%; border:1.5px solid var(--sd); background:var(--wh); font-size:11px; font-weight:700; color:var(--mu); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s;}
.dia-btn.on{background:var(--gd); color:#fff; border-color:var(--gd);}

/* PLANO PICKER */
.plan-tabs{display:flex; gap:6px; margin-bottom:8px;}
.plan-tab{flex:1; padding:8px 4px; border-radius:8px; border:1.5px solid var(--sd); background:var(--wh); font-size:12px; font-weight:700; cursor:pointer; text-align:center; transition:all .15s;}
.plan-tab.on{background:var(--gd); color:#fff; border-color:var(--gd);}
.plan-cards{display:grid; grid-template-columns:repeat(3,1fr); gap:7px;}
.plan-card{border:1.5px solid var(--sd); border-radius:10px; padding:10px 6px; text-align:center; cursor:pointer; transition:all .15s; background:var(--wh);}
.plan-card.on{border-color:var(--gd); background:var(--wm);}
.plan-card .pf{font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:var(--gd);}
.plan-card .pd{font-size:10px; color:var(--mu); font-weight:600; text-transform:uppercase;}
.plan-card .pv{font-size:12px; font-weight:700; margin-top:3px;}

/* DETALHE */
.detail-hero{background:var(--gd); color:#fff; padding:20px 16px 24px; margin:-16px -16px 16px;}
.detail-av{width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-size:26px; color:#fff; font-weight:600; margin-bottom:10px;}
.detail-name{font-family:'Fraunces',serif; font-size:24px; font-weight:600; margin-bottom:4px;}
.detail-sub{font-size:13px; color:rgba(255,255,255,.7);}

/* INFO BLOCK */
.info-block{background:var(--wh); border-radius:var(--r); box-shadow:var(--sh); margin-bottom:14px; overflow:hidden;}
.info-row{display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--sd);}
.info-row:last-child{border-bottom:none;}
.info-row .lbl{font-size:12px; color:var(--mu); font-weight:500;}
.info-row .val{font-size:13px; font-weight:600; text-align:right;}

/* TABS */
.tabs{display:flex; border-bottom:2px solid var(--sd); margin-bottom:14px;}
.tab{flex:1; padding:11px 8px; text-align:center; font-size:13px; font-weight:600; color:var(--mu); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s;}
.tab.on{color:var(--gd); border-bottom-color:var(--gd);}

/* SEARCH */
.searchbar{position:relative; margin-bottom:14px;}
.searchbar input{padding-left:38px;}
.searchbar svg{position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--mu);}

/* AGENDA CARD */
.ag-card{background:var(--wh); border-radius:var(--r); box-shadow:var(--sh); margin-bottom:10px; overflow:hidden; border-left:4px solid var(--sd);}
.ag-card.confirmado{border-left-color:var(--grn);}
.ag-card.cancelado{border-left-color:var(--red);}
.ag-card.pendente{border-left-color:var(--amber);}
.ag-body{padding:14px 14px 10px;}
.ag-time{font-size:11px; font-weight:700; color:var(--gd); text-transform:uppercase; letter-spacing:.5px;}
.ag-name{font-size:15px; font-weight:700; margin:3px 0;}
.ag-info{font-size:12px; color:var(--mu);}
.ag-actions{display:flex; gap:7px; padding:10px 14px; background:var(--wm); border-top:1px solid var(--sd); flex-wrap:wrap;}

/* FREQ DOT */
.fdot{width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0;}
.fdot.pres{background:var(--grn);}
.fdot.aus{background:var(--red);}

/* MODAL SHEET */
.sheet-overlay{position:fixed; inset:0; left:220px; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:center; justify-content:center;}
.sheet{background:var(--wh); border-radius:16px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; padding:0; box-shadow:0 20px 60px rgba(0,0,0,.2);}
.sheet-handle{width:36px; height:4px; background:var(--sd); border-radius:2px; margin:12px auto 0;}
.sheet-head{display:flex; align-items:center; justify-content:space-between; padding:16px 18px 12px;}
.sheet-head h3{font-family:'Fraunces',serif; font-size:20px; font-weight:600; color:var(--gd);}
.sheet-close{background:var(--wm); border:none; border-radius:8px; padding:7px; cursor:pointer; display:flex; align-items:center;}
.sheet-body{padding:0 18px 24px;}
.sheet-footer{padding:12px 18px 16px; border-top:1px solid var(--sd); display:flex; gap:10px;}

/* CONFIRM MODAL */
.confirm{background:var(--wh); border-radius:16px; padding:24px; margin:auto 20px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.2);}
.confirm h4{font-family:'Fraunces',serif; font-size:18px; margin-bottom:8px; color:var(--gd);}
.confirm p{font-size:13px; color:var(--mu); margin-bottom:20px;}

/* EMPTY */
.empty{text-align:center; padding:40px 20px; color:var(--mu);}
.empty-ico{font-size:36px; margin-bottom:8px;}
.empty p{font-size:14px;}

/* QUICK BANNER */
.banner{background:linear-gradient(135deg,var(--gd),#4a7a50); color:#fff; border-radius:var(--r); padding:16px; margin-bottom:14px; display:flex; align-items:center; gap:12px;}
.banner-ico{font-size:28px; flex-shrink:0;}
.banner-text h4{font-size:15px; font-weight:700; margin-bottom:2px;}
.banner-text p{font-size:12px; opacity:.8;}

/* TOAST */
.toast{position:fixed; bottom:24px; left:calc(220px + 50%); transform:translateX(-50%); background:#1e1e1e; color:#fff; padding:10px 18px; border-radius:30px; font-size:13px; font-weight:500; z-index:300; white-space:nowrap; box-shadow:0 4px 20px rgba(0,0,0,.3); animation:toastin .2s ease;}
@keyframes toastin{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* SCROLL INDICATOR */
.scroll::-webkit-scrollbar{width:4px;}
.scroll::-webkit-scrollbar-thumb{background:var(--sd); border-radius:2px;}
`;

// ── ICONS ────────────────────────────────────────────────────────────────────
const I = {
  home:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  card:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  cal:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  config:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  plus:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  search:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  chev:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  whats:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
};

// ── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2200); };
  return [toast, show];
}

// ── APP ──────────────────────────────────────────────────────────────────────
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

function useLS(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init==="function" ? init() : init); }
    catch { return typeof init==="function" ? init() : init; }
  });
  const set = (v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(typeof v==="function" ? v(val) : v)); } catch {}
  };
  // wrapper que aceita função updater igual useState
  const setter = (v) => {
    setVal(prev => {
      const next = typeof v==="function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return [val, setter];
}

export default function App() {
  const [tab, setTab]             = useState("home");
  const [alunos, setAlunos]       = useLS("pilates_alunos", ALUNOS0);
  const [agendamentos, setAgendamentos] = useLS("pilates_agendamentos", AGS_INICIAIS);
  const [instrutores, setInstrutores] = useLS("pilates_instrutores", INSTRUTORES_INIT);
  const [modalidades, setModalidades] = useLS("pilates_modalidades", MODALIDADES_INIT);
  const [stack, setStack]     = useState([]); // navigation stack
  const [sheet, setSheet]     = useState(null); // {type, data}
  const [toast, showToast]    = useToast();

  const [agenda, setAgenda]   = useState(() => {
    const m = {};
    ALUNOS0.forEach(a => { m[a.id] = a.diasSemana.includes(todayDow) ? "pendente" : null; });
    return m;
  });

  const push = (screen, data={}) => setStack(s => [...s, {screen, data}]);
  const pop  = () => setStack(s => s.slice(0,-1));
  const current = stack[stack.length-1];

  const mesAtual = todayStr.slice(0,7);

  // mutations
  const marcarPago = (alunoId, mes, formaPag) => {
    setAlunos(p => p.map(a => a.id!==alunoId ? a : {
      ...a, mensalidades: a.mensalidades.map(m => m.mes!==mes ? m : {...m, pago:true, dataPag:todayStr, formaPag: formaPag||null})
    }));
    showToast("✓ Pagamento registrado");
  };
  const openPago = (alunoId, mes) => {
    const aluno = alunos.find(a=>a.id===alunoId);
    setSheet({type:"pago", data:{alunoId, mes, formasPagamento: aluno?.formasPagamento||[]}});
  };
  const registrarFreq = (alunoId, presente) => {
    setAlunos(p => p.map(a => {
      if (a.id!==alunoId) return a;
      const ex = a.frequencias.find(f=>f.data===todayStr);
      const fs = ex
        ? a.frequencias.map(f=>f.data===todayStr?{...f,presente}:f)
        : [...a.frequencias,{data:todayStr,presente}];
      return {...a, frequencias:fs};
    }));
    showToast(presente ? "✓ Presença registrada" : "✓ Falta registrada");
  };
  const confirmarAgenda = (id, status) => {
    setAgenda(p=>({...p,[id]:status}));
    showToast(status==="confirmado" ? "✓ Aula confirmada" : "✗ Aula cancelada");
  };
  const gerarAgendamentosContrato = (aluno) => {
    if (!aluno.dataInicio || !aluno.dataTermino || !(aluno.diasSemana||[]).length) return 0;
    const horarios = aluno.horariosPorDia || {};
    const novos = [];
    const end   = new Date(aluno.dataTermino + "T12:00");
    const cur   = new Date(aluno.dataInicio  + "T12:00");
    let   ctr   = 0;
    while (cur <= end) {
      const dow = cur.getDay();
      if (aluno.diasSemana.includes(dow)) {
        const horaI = horarios[dow] || aluno.horario || "08:00";
        novos.push({
          id: Date.now() + ctr++,
          alunoId:    aluno.id,
          alunoNome:  aluno.nome,
          data:       fmt(cur),
          horaInicio: horaI,
          horaFim:    proxHoraFmt(horaI),
          instrutor:  "",
          tipo:       "Aparelho",
          status:     "pendente",
          obs:        "Gerado automaticamente na matrícula",
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (novos.length) setAgendamentos(p => [...p, ...novos]);
    return novos.length;
  };

  const salvarAluno = (dados) => {
    if (dados.id) {
      setAlunos(p => p.map(a => a.id===dados.id ? {...a,...dados} : a));
      showToast("✓ Dados atualizados");
    } else {
      const plano = PLANOS.find(p=>p.id===dados.planoId);
      const newId = Date.now();
      const newA  = {
        ...dados, id: newId, ativo: true,
        mensalidades: dados.mensalidades?.length
          ? dados.mensalidades
          : [{mes:mesAtual, valor: plano?.valor || Number(dados.valorPlano)||0, pago:false, dataPag:null}],
        frequencias:  [],
      };
      setAlunos(p => [...p, newA]);
      const qtd = gerarAgendamentosContrato(newA);
      showToast(qtd ? `✓ Aluno cadastrado · ${qtd} aulas agendadas automaticamente` : "✓ Aluno cadastrado");
    }
    setSheet(null);
  };

  // stats
  const ativos = alunos.filter(a=>a.ativo).length;
  const inadim  = alunos.filter(a=>a.mensalidades.some(m=>m.mes===mesAtual&&!m.pago)).length;
  const aHoje   = alunos.filter(a=>a.diasSemana.includes(todayDow)&&a.ativo).length;
  const recebido = alunos.reduce((s,a)=>{const m=a.mensalidades.find(m=>m.mes===mesAtual&&m.pago); return m?s+m.valor:s;},0);

  const NAV = [
    {id:"home",  label:"Início",      icon:I.home},
    {id:"alunos",label:"Alunos",      icon:I.users},
    {id:"mens",  label:"Finanças",    icon:I.card},
    {id:"freq",  label:"Frequência",  icon:I.cal},
    {id:"agenda",label:"Agenda",      icon:I.clock},
    {id:"config",label:"Configurações",icon:I.config},
  ];

  // render page content
  const renderPage = () => {
    if (current) {
      if (current.screen==="detalhe")  return <DetalheAluno aluno={alunos.find(a=>a.id===current.data.id)} initialTab={current.data.initialTab||"info"} onBack={pop} onEdit={()=>push("cadastro",{aluno:alunos.find(a=>a.id===current.data.id)})} onPago={openPago} onFreq={registrarFreq}/>;
      if (current.screen==="cadastro") return <CadastroAluno aluno={current.data?.aluno||null} onVoltar={pop} onSalvar={(dados)=>{salvarAluno(dados);pop();}}/>;
    }
    switch(tab) {
      case "home":   return <Home ativos={ativos} inadim={inadim} aHoje={aHoje} recebido={recebido} alunos={alunos} onAgenda={()=>setTab("agenda")} onMens={()=>setTab("mens")} onPago={openPago}/>;
      case "alunos": return <PageAlunos alunos={alunos} onDetalhe={a=>push("detalhe",{id:a.id})} onNovo={()=>push("cadastro",{})}/>;
      case "mens":   return <PageMens alunos={alunos} onPago={openPago} onDetalhe={a=>push("detalhe",{id:a.id,initialTab:"mens"})}/>;
      case "freq":   return <PageFreq alunos={alunos} onFreq={registrarFreq}/>;
      case "agenda": return <AgendaDiaria alunos={alunos} agendamentos={agendamentos} setAgendamentos={setAgendamentos} instrutores={instrutores} modalidades={modalidades} onCadastrarAluno={(nome) => push("cadastro", { aluno: { nome } })}/>;
      case "config": return <Configuracoes instrutores={instrutores} setInstrutores={setInstrutores} modalidades={modalidades} setModalidades={setModalidades} showToast={showToast}/>;
    }
  };

  const isDetalhe  = current?.screen==="detalhe";
  const isCadastro = current?.screen==="cadastro";
  const alunoAtual = isDetalhe ? alunos.find(a=>a.id===current.data.id) : null;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* SIDEBAR NAV */}
        <div className="botnav">
          <div className="botnav-logo">Studio Pilates<span>Gestão</span></div>
          <div className="botnav-items">
            {NAV.map(n => (
              <button key={n.id} className={`bn-item${tab===n.id&&!isDetalhe&&!isCadastro?" active":""}`} onClick={()=>{setTab(n.id);setStack([]);}}>
                {n.icon}
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="main-area">
          {/* TOP BAR */}
          <div className="topbar">
            {(isDetalhe || isCadastro)
              ? <><button className="topbar-back" onClick={pop}>{I.back} Voltar</button><span style={{flex:1,fontWeight:700,fontSize:16,color:"var(--tx)"}}>{isDetalhe ? alunoAtual?.nome : (current?.data?.aluno ? "Editar Aluno" : "Novo Aluno")}</span></>
              : <><div className="topbar-logo">{NAV.find(n=>n.id===tab)?.label || "Início"}<span>Studio Pilates</span></div></>
            }
            {!isDetalhe && !isCadastro && tab==="alunos" && <button className="topbar-action" onClick={()=>push("cadastro",{})}>{I.plus} Novo aluno</button>}
          </div>

          {/* CONTENT */}
          <div className="scroll">
            {renderPage()}
          </div>
        </div>

        {/* SHEET */}
        {sheet && (
          <div className="sheet-overlay" onClick={e=>e.target===e.currentTarget&&setSheet(null)}>
            {sheet.type==="aluno" && <SheetAluno data={sheet.data} onClose={()=>setSheet(null)} onSalvar={salvarAluno}/>}
            {sheet.type==="pago"  && (
              <PagoSheet data={sheet.data} onClose={()=>setSheet(null)} onConfirmar={(formaPag)=>{marcarPago(sheet.data.alunoId,sheet.data.mes,formaPag);setSheet(null);}}/>
            )}
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function Home({ativos,inadim,aHoje,recebido,alunos,onAgenda,onMens,onPago}) {
  const mesAtual = todayStr.slice(0,7);
  const alunosHoje = alunos.filter(a=>a.diasSemana.includes(todayDow)&&a.ativo).sort((a,b)=>a.horario.localeCompare(b.horario));
  const emAberto  = alunos.filter(a=>a.mensalidades.some(m=>m.mes===mesAtual&&!m.pago));

  return (
    <>
      <div className="banner">
        <div className="banner-ico">🌿</div>
        <div className="banner-text">
          <h4>Bom dia!</h4>
          <p>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat grn"><div className="stat-num">{ativos}</div><div className="stat-label">Alunos ativos</div></div>
        <div className="stat"><div className="stat-num">{aHoje}</div><div className="stat-label">Aulas hoje</div></div>
        <div className={`stat ${inadim>0?"red":"grn"}`}><div className="stat-num">{inadim}</div><div className="stat-label">Inadimplentes</div></div>
        <div className="stat grn"><div className="stat-num" style={{fontSize:22}}>{brl(recebido)}</div><div className="stat-label">Recebido/mês</div></div>
      </div>

      {/* Aulas hoje */}
      <div className="section">
        <div className="sec-head"><h3>📅 Aulas de Hoje</h3><button className="sec-link" onClick={onAgenda}>Ver agenda →</button></div>
        {alunosHoje.length===0
          ? <div className="empty"><div className="empty-ico">☀️</div><p>Sem aulas hoje</p></div>
          : alunosHoje.map(a=>{
            const p=PLANOS.find(pl=>pl.id===a.planoId);
            const ini=a.nome.split(" ").slice(0,2).map(n=>n[0]).join("");
            return (
              <div key={a.id} className="row" style={{cursor:"default"}}>
                <div className="pill-time">{a.horario}</div>
                <div className="row-av sm">{ini}</div>
                <div className="row-body"><div className="row-name">{a.nome.split(" ").slice(0,2).join(" ")}</div><div className="row-sub">{p?.freq}x/sem</div></div>
              </div>
            );
          })
        }
      </div>

      {/* Inadimplentes */}
      {emAberto.length>0 && (
        <div className="section">
          <div className="sec-head"><h3>💳 Em aberto — {mesLabel(mesAtual)}</h3><button className="sec-link" onClick={onMens}>Ver tudo →</button></div>
          {emAberto.map(a=>{
            const m=a.mensalidades.find(mm=>mm.mes===mesAtual&&!mm.pago);
            const ini=a.nome.split(" ").slice(0,2).map(n=>n[0]).join("");
            return (
              <div key={a.id} className="row" style={{cursor:"default"}}>
                <div className="row-av sm">{ini}</div>
                <div className="row-body"><div className="row-name">{a.nome.split(" ").slice(0,2).join(" ")}</div><div className="row-sub">{brl(m?.valor||0)}</div></div>
                <button className="btn btn-ok btn-sm" onClick={()=>onPago(a.id,mesAtual)}>{I.check}</button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── ALUNOS ────────────────────────────────────────────────────────────────────
function PageAlunos({alunos,onDetalhe,onNovo}) {
  const [q,setQ]=useState("");
  const lista = alunos.filter(a=>a.nome.toLowerCase().includes(q.toLowerCase())||a.telefone.includes(q));
  const mesAtual = todayStr.slice(0,7);

  return (
    <>
      <div className="searchbar">
        {I.search}
        <input className="form-input" style={{paddingLeft:38}} placeholder="Buscar aluno…" value={q} onChange={e=>setQ(e.target.value)}/>
      </div>
      <div className="section">
        {lista.length===0
          ? <div className="empty"><div className="empty-ico">🔍</div><p>Nenhum aluno encontrado</p></div>
          : lista.map(a=>{
            const p=PLANOS.find(pl=>pl.id===a.planoId);
            const m=a.mensalidades.find(m=>m.mes===mesAtual);
            const ini=a.nome.split(" ").slice(0,2).map(n=>n[0]).join("");
            return (
              <div key={a.id} className="row" onClick={()=>onDetalhe(a)}>
                <div className="row-av">{ini}</div>
                <div className="row-body">
                  <div className="row-name">{a.nome}</div>
                  <div className="row-sub">{p?.freq}x/sem · {a.horario}</div>
                </div>
                <div className="row-end">
                  {m ? (m.pago ? <span className="badge ok">{I.check} Pago</span> : <span className="badge danger">Aberto</span>) : null}
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
function DetalheAluno({aluno,onBack,onEdit,onPago,onFreq,initialTab="info"}) {
  const [tab,setTab]=useState(initialTab);
  const p=PLANOS.find(pl=>pl.id===aluno.planoId);
  const ini=aluno.nome.split(" ").slice(0,2).map(n=>n[0]).join("");
  const mesAtual=todayStr.slice(0,7);
  const freqHoje=aluno.frequencias.find(f=>f.data===todayStr);
  const pct=aluno.frequencias.length ? Math.round(aluno.frequencias.filter(f=>f.presente).length/aluno.frequencias.length*100) : 0;

  return (
    <>
      <div className="detail-hero">
        <div className="detail-av">{ini}</div>
        <div className="detail-name">{aluno.nome}</div>
        <div className="detail-sub">{p?.freq}x/sem · {p?.duracao} · {brl(p?.valor||0)}/mês</div>
        <div style={{marginTop:10,display:"flex",gap:8}}>
          <span className={`badge ${aluno.ativo?"ok":"neu"}`}>{aluno.ativo?"Ativo":"Inativo"}</span>
          <button className="btn btn-sm" style={{background:"rgba(255,255,255,.2)",color:"#fff",gap:4}} onClick={onEdit}>{I.edit} Editar</button>
          <a href={`https://wa.me/55${aluno.telefone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
            className="btn btn-sm" style={{background:"rgba(255,255,255,.2)",color:"#fff",gap:4,textDecoration:"none"}}>
            {I.whats} WhatsApp
          </a>
        </div>
      </div>

      <div className="tabs">
        {[["info","Info"],["mens","Mensalidades"],["freq","Frequência"]].map(([k,l])=>(
          <div key={k} className={`tab${tab===k?" on":""}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="info" && (
        <>
          <div className="info-block">
            <div className="info-row"><span className="lbl">Telefone</span><span className="val">{aluno.telefone}</span></div>
            <div className="info-row"><span className="lbl">E-mail</span><span className="val">{aluno.email}</span></div>
            <div className="info-row"><span className="lbl">CPF</span><span className="val">{aluno.cpf}</span></div>
            <div className="info-row"><span className="lbl">Horário</span><span className="val">{aluno.horario}</span></div>
          </div>
          <div className="info-block">
            <div className="info-row"><span className="lbl">Dias</span><span className="val">{aluno.diasSemana.sort().map(d=>DS[d]).join(", ")}</span></div>
            <div className="info-row"><span className="lbl">Início</span><span className="val">{new Date(aluno.dataInicio+"T12:00").toLocaleDateString("pt-BR")}</span></div>
            <div className="info-row"><span className="lbl">Vencimento</span><span className="val">{new Date(aluno.dataVencimento+"T12:00").toLocaleDateString("pt-BR")}</span></div>
            <div className="info-row"><span className="lbl">Presença geral</span><span className="val" style={{color:"var(--gd)"}}>{pct}%</span></div>
          </div>
        </>
      )}

      {tab==="mens" && (
        <div className="section">
          {[...aluno.mensalidades].reverse().map(m=>(
            <div key={m.mes} className="row" style={{cursor:"default"}}>
              <div style={{flex:1}}>
                <div className="row-name">{mesLabel(m.mes)}</div>
                <div className="row-sub">{brl(m.valor)} · vence dia 10</div>
              </div>
              {m.pago
                ? <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span className="badge ok" style={{fontSize:11,padding:"2px 8px",borderRadius:20}}>Pago</span>
                    <span style={{fontSize:11,color:"var(--mu)"}}>{I.check} {m.dataPag?.split("-").reverse().join("/")}</span>
                    {m.formaPag && <span style={{fontSize:10,color:"var(--mu)"}}>{m.formaPag}</span>}
                  </div>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span className="badge" style={{background:"#fff3cd",color:"#856404",fontSize:11,padding:"2px 8px",borderRadius:20}}>Pendente</span>
                    <button className="btn btn-ok btn-sm" onClick={()=>onPago(aluno.id,m.mes)}>{I.check} Pagar</button>
                  </div>
              }
            </div>
          ))}
        </div>
      )}

      {tab==="freq" && (
        <>
          {aluno.diasSemana.includes(todayDow) && (
            <div style={{background:"var(--wm)",borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:"var(--gd)"}}>Aula de hoje — marcar presença</div>
              <div className="btn-row">
                <button className={`btn btn-sm ${freqHoje?.presente===true?"btn-ok":"btn-out"} btn-full`} onClick={()=>onFreq(aluno.id,true)}>{I.check} Presente</button>
                <button className={`btn btn-sm ${freqHoje?.presente===false?"btn-danger":"btn-out"} btn-full`} onClick={()=>onFreq(aluno.id,false)}>{I.x} Faltou</button>
              </div>
            </div>
          )}
          <div className="section">
            {aluno.frequencias.length===0
              ? <div className="empty"><div className="empty-ico">📋</div><p>Nenhuma frequência registrada</p></div>
              : [...aluno.frequencias].sort((a,b)=>b.data.localeCompare(a.data)).map(f=>(
                <div key={f.data} className="row" style={{cursor:"default"}}>
                  <span className={`fdot ${f.presente?"pres":"aus"}`}/>
                  <div className="row-body">
                    <div className="row-name">{f.data.split("-").reverse().join("/")}</div>
                    <div className="row-sub">{DS[new Date(f.data+"T12:00").getDay()]}</div>
                  </div>
                  <span className={`badge ${f.presente?"ok":"danger"}`}>{f.presente?"Presente":"Faltou"}</span>
                </div>
              ))
            }
          </div>
        </>
      )}
    </>
  );
}

// ── MENSALIDADES ──────────────────────────────────────────────────────────────
const ICONES_FORMA = {"Pix":"⚡","Cartão de Crédito":"💳","Cartão de Débito":"💳","Boleto":"📄","Dinheiro":"💵"};

function PageMens({alunos,onPago,onDetalhe}) {
  const [mes,setMes]=useState(todayStr.slice(0,7));
  const [filtro,setFiltro]=useState("todos");

  const lista = alunos.filter(a=>{
    const m=a.mensalidades.find(m=>m.mes===mes);
    if (!m) return false;
    if (filtro==="pago"&&!m.pago) return false;
    if (filtro==="aberto"&&m.pago) return false;
    return true;
  });

  const totPago   = alunos.reduce((s,a)=>{const m=a.mensalidades.find(m=>m.mes===mes&&m.pago); return m?s+m.valor:s;},0);
  const totAberto = alunos.reduce((s,a)=>{const m=a.mensalidades.find(m=>m.mes===mes&&!m.pago); return m?s+m.valor:s;},0);

  return (
    <>
      {/* Título */}
      <div style={{fontFamily:"Fraunces,serif",fontSize:20,fontWeight:600,color:"#3b5c3e",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        💳 Financeiro e Pagamento
      </div>

      {/* Totais */}
      <div className="stat-grid" style={{marginBottom:12}}>
        <div className="stat grn"><div className="stat-num" style={{fontSize:20}}>{brl(totPago)}</div><div className="stat-label">Recebido</div></div>
        <div className="stat red"><div className="stat-num" style={{fontSize:20}}>{brl(totAberto)}</div><div className="stat-label">Em aberto</div></div>
      </div>

      {/* Filtros */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input type="month" className="form-input" style={{flex:1}} value={mes} onChange={e=>setMes(e.target.value)}/>
        <select className="form-input" style={{flex:1}} value={filtro} onChange={e=>setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pago">Pagos</option>
          <option value="aberto">Em aberto</option>
        </select>
      </div>

      {/* Cards estilo step 4 */}
      {lista.length===0
        ? <div className="empty"><div className="empty-ico">💳</div><p>Nenhum registro</p></div>
        : lista.map((a,idx)=>{
          const m=a.mensalidades.find(mm=>mm.mes===mes);
          const numParcela = a.mensalidades.findIndex(mm=>mm.mes===mes)+1;
          return (
            <div key={a.id} onClick={()=>onDetalhe(a)} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              background: m?.pago ? "#f0faf3" : "#fff",
              border:`1.5px solid ${m?.pago ? "#a8c5ab" : "#e8e0d0"}`,
              borderRadius:12,padding:"14px 16px",marginBottom:8,
              transition:"all .15s",cursor:"pointer",
            }}>
              {/* Número + info */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{
                  width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  background: m?.pago ? "#3b5c3e" : "#f4efe5",
                  fontSize:12,fontWeight:700,color: m?.pago ? "#fff" : "#8c8c8c",flexShrink:0,
                }}>{numParcela}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#1e1e1e"}}>{a.nome.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:2}}>
                    {m?.vencimento
                      ? new Date(m.vencimento+"T12:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})
                      : `Vence dia ${a.diaVencimento||10}`}
                  </div>
                  {m?.pago && m?.dataPag && (
                    <div style={{fontSize:11,color:"#2e7d46",fontWeight:600,marginTop:2}}>
                      Pago em {new Date(m.dataPag+"T12:00").toLocaleDateString("pt-BR")}
                      {m.formaPag && <span style={{marginLeft:6}}>{ICONES_FORMA[m.formaPag]||""} {m.formaPag}</span>}
                    </div>
                  )}
                </div>
              </div>
              {/* Valor + status */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,fontWeight:700,color:"#1e1e1e"}}>{brl(m?.valor||0)}</span>
                {m?.pago
                  ? <span style={{
                      padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:700,
                      background:"#3b5c3e",color:"#fff",
                    }}>✓ Pago</span>
                  : <button onClick={e=>{e.stopPropagation();onPago(a.id,mes);}} style={{
                      padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",
                      fontFamily:"inherit",fontSize:12,fontWeight:700,
                      background:"#fef3e2",color:"#c47a0a",transition:"all .15s",
                    }}>◷ Pagar</button>
                }
              </div>
            </div>
          );
        })
      }
    </>
  );
}

// ── FREQUÊNCIA ────────────────────────────────────────────────────────────────
function PageFreq({alunos,onFreq}) {
  const [date,setDate]=useState(todayStr);
  const dow=new Date(date+"T12:00").getDay();
  const lista=alunos.filter(a=>a.diasSemana.includes(dow)&&a.ativo);

  return (
    <>
      <input type="date" className="form-input" style={{marginBottom:12}} value={date} max={todayStr} onChange={e=>setDate(e.target.value)}/>
      <div style={{fontSize:12,color:"var(--mu)",marginBottom:12}}>{lista.length} aluno(s) com aula em {DS[dow]}</div>
      <div className="section">
        {lista.length===0
          ? <div className="empty"><div className="empty-ico">📋</div><p>Nenhum aluno com aula nesse dia</p></div>
          : lista.map(a=>{
            const f=a.frequencias.find(ff=>ff.data===date);
            const ini=a.nome.split(" ").slice(0,2).map(n=>n[0]).join("");
            return (
              <div key={a.id} className="row" style={{cursor:"default",flexWrap:"wrap",gap:8}}>
                <div className="row-av sm">{ini}</div>
                <div className="row-body">
                  <div className="row-name">{a.nome.split(" ").slice(0,2).join(" ")}</div>
                  <div className="row-sub">{a.horario} · {f ? (f.presente?"Presente":"Faltou") : "Não registrado"}</div>
                </div>
                <div className="btn-row">
                  <button className={`btn btn-icon btn-sm ${f?.presente===true?"btn-ok":"btn-out"}`} onClick={()=>onFreq(a.id,true)}>{I.check}</button>
                  <button className={`btn btn-icon btn-sm ${f?.presente===false?"btn-danger":"btn-out"}`} onClick={()=>onFreq(a.id,false)}>{I.x}</button>
                </div>
              </div>
            );
          })
        }
      </div>
    </>
  );
}

// ── AGENDA ────────────────────────────────────────────────────────────────────
function PageAgenda({alunos,agenda,onConfirmar,onFreq}) {
  const lista=alunos.filter(a=>a.diasSemana.includes(todayDow)&&a.ativo).sort((a,b)=>a.horario.localeCompare(b.horario));
  const conf=lista.filter(a=>agenda[a.id]==="confirmado").length;
  const pend=lista.filter(a=>agenda[a.id]==="pendente").length;
  const canc=lista.filter(a=>agenda[a.id]==="cancelado").length;

  return (
    <>
      <div className="banner" style={{background:"linear-gradient(135deg,#3b5c3e,#5c7f60)"}}>
        <div className="banner-ico">📅</div>
        <div className="banner-text">
          <h4>{new Date().toLocaleDateString("pt-BR",{weekday:"long"})}</h4>
          <p>{new Date().toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"})}</p>
        </div>
      </div>

      <div className="stat-grid" style={{gridTemplateColumns:"1fr 1fr 1fr",marginBottom:14}}>
        <div className="stat grn"><div className="stat-num">{conf}</div><div className="stat-label">Confirmados</div></div>
        <div className="stat amber"><div className="stat-num">{pend}</div><div className="stat-label">Pendentes</div></div>
        <div className="stat red"><div className="stat-num">{canc}</div><div className="stat-label">Cancelados</div></div>
      </div>

      {lista.length===0
        ? <div className="empty"><div className="empty-ico">☀️</div><p>Sem aulas hoje</p></div>
        : lista.map(a=>{
          const status=agenda[a.id]||"pendente";
          const f=a.frequencias.find(ff=>ff.data===todayStr);
          const p=PLANOS.find(pl=>pl.id===a.planoId);
          return (
            <div key={a.id} className={`ag-card ${status}`}>
              <div className="ag-body">
                <div className="ag-time">{a.horario}</div>
                <div className="ag-name">{a.nome}</div>
                <div className="ag-info">{p?.freq}x/sem · 📱 {a.telefone}</div>
              </div>
              <div className="ag-actions">
                {status!=="confirmado" && <button className="btn btn-ok btn-sm" onClick={()=>onConfirmar(a.id,"confirmado")}>{I.check} Confirmar</button>}
                {status!=="cancelado"  && <button className="btn btn-danger btn-sm" onClick={()=>onConfirmar(a.id,"cancelado")}>{I.x} Cancelar</button>}
                {status==="confirmado" && <>
                  <span style={{fontSize:11,color:"var(--mu)",alignSelf:"center",marginLeft:4}}>Presença:</span>
                  <button className={`btn btn-sm ${f?.presente===true?"btn-ok":"btn-out"}`} onClick={()=>onFreq(a.id,true)}>{I.check}</button>
                  <button className={`btn btn-sm ${f?.presente===false?"btn-danger":"btn-out"}`} onClick={()=>onFreq(a.id,false)}>{I.x}</button>
                </>}
              </div>
            </div>
          );
        })
      }
    </>
  );
}

// ── SHEET ALUNO ───────────────────────────────────────────────────────────────
function PagoSheet({data,onClose,onConfirmar}) {
  const formas = ["Pix","Cartão de Crédito","Cartão de Débito","Boleto","Dinheiro"];
  const [forma,setForma] = useState(formas[0]);
  const icones = {"Pix":"⚡","Cartão de Crédito":"💳","Cartão de Débito":"💳","Boleto":"🧾","Dinheiro":"💵"};
  return (
    <div className="confirm" onClick={e=>e.stopPropagation()} style={{maxWidth:340}}>
      <h4>Registrar Pagamento</h4>
      <p style={{marginBottom:12}}>Mensalidade de <strong>{mesLabel(data.mes)}</strong></p>
      <p style={{fontSize:13,color:"var(--mu)",marginBottom:8}}>Forma de pagamento:</p>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {formas.map(f=>(
          <button key={f} onClick={()=>setForma(f)} style={{
            padding:"10px 14px",borderRadius:10,border:`2px solid ${forma===f?"var(--gd)":"var(--sd)"}`,
            background:forma===f?"var(--gd)":"var(--wh)",color:forma===f?"#fff":"var(--tx)",
            fontWeight:600,fontSize:13,cursor:"pointer",textAlign:"left",transition:"all .15s"
          }}>
            {icones[f]||"💰"} {f}
          </button>
        ))}
      </div>
      <div className="btn-row" style={{justifyContent:"center"}}>
        <button className="btn btn-out" onClick={onClose}>Cancelar</button>
        <button className="btn btn-prim" onClick={()=>onConfirmar(forma)}>Confirmar</button>
      </div>
    </div>
  );
}

function SheetAluno({data,onClose,onSalvar}) {
  const [form,setForm]=useState({
    id:data?.id||null, nome:data?.nome||"", telefone:data?.telefone||"",
    email:data?.email||"", cpf:data?.cpf||"",
    planoId:data?.planoId||"", diasSemana:data?.diasSemana||[],
    horario:data?.horario||"", dataInicio:data?.dataInicio||todayStr, dataVencimento:data?.dataVencimento||"",
  });
  const [freqSel,setFreqSel]=useState(data ? PLANOS.find(p=>p.id===data.planoId)?.freq||1 : 1);

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleDia=d=>set("diasSemana",form.diasSemana.includes(d)?form.diasSemana.filter(x=>x!==d):[...form.diasSemana,d]);

  useEffect(()=>{
    if(form.planoId&&form.dataInicio){
      const p=PLANOS.find(p=>p.id===form.planoId);
      const d=new Date(form.dataInicio+"T12:00");
      d.setMonth(d.getMonth()+p.meses);
      set("dataVencimento",fmt(d));
    }
  },[form.planoId,form.dataInicio]);

  const planoSel=PLANOS.find(p=>p.id===form.planoId);
  const valido=form.nome&&form.telefone&&form.planoId&&form.diasSemana.length&&form.horario;

  return (
    <div className="sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-handle"/>
      <div className="sheet-head">
        <h3>{data?"Editar Aluno":"Novo Aluno"}</h3>
        <button className="sheet-close" onClick={onClose}>{I.x}</button>
      </div>
      <div className="sheet-body">
        <div className="form-group">
          <label className="form-label">Nome completo *</label>
          <input className="form-input" value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Nome do aluno"/>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telefone *</label>
            <input className="form-input" value={form.telefone} onChange={e=>set("telefone",e.target.value)} placeholder="(11) 99999-9999"/>
          </div>
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input className="form-input" value={form.cpf} onChange={e=>set("cpf",e.target.value)} placeholder="000.000.000-00"/>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-input" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@email.com"/>
        </div>

        <div className="form-group">
          <label className="form-label">Frequência semanal *</label>
          <div className="plan-tabs">
            {[1,2,3].map(f=>(
              <button key={f} className={`plan-tab${freqSel===f?" on":""}`} onClick={()=>{setFreqSel(f);set("planoId","");}}>
                {f}x / semana
              </button>
            ))}
          </div>
          <div className="plan-cards">
            {PLANOS.filter(p=>p.freq===freqSel).map(p=>(
              <div key={p.id} className={`plan-card${form.planoId===p.id?" on":""}`} onClick={()=>set("planoId",p.id)}>
                <div className="pd">{p.duracao}</div>
                <div className="pv">{brl(p.valor)}/mês</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Dias da semana *</label>
          <div className="dias-row">
            {DS.map((d,i)=>(
              <button key={i} className={`dia-btn${form.diasSemana.includes(i)?" on":""}`} onClick={()=>toggleDia(i)}>{d}</button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Horário *</label>
            <select className="form-input" value={form.horario} onChange={e=>set("horario",e.target.value)}>
              <option value="">Selecionar</option>
              {HORARIOS.map(h=><option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Início</label>
            <input type="date" className="form-input" value={form.dataInicio} onChange={e=>set("dataInicio",e.target.value)}/>
          </div>
        </div>

        {planoSel && form.diasSemana.length>0 && (
          <div style={{background:"var(--wm)",borderRadius:10,padding:"10px 14px",fontSize:13,marginBottom:4}}>
            <strong>Resumo:</strong> {planoSel.freq}x/sem · {planoSel.duracao} · <strong>{brl(planoSel.valor)}/mês</strong>
            {form.dataVencimento && <> · Vence em {new Date(form.dataVencimento+"T12:00").toLocaleDateString("pt-BR")}</>}
          </div>
        )}
      </div>
      <div className="sheet-footer">
        <button className="btn btn-out btn-full" onClick={onClose}>Cancelar</button>
        <button className="btn btn-prim btn-full" disabled={!valido} onClick={()=>onSalvar(form)}>{I.check} {data?"Salvar":"Cadastrar"}</button>
      </div>
    </div>
  );
}
