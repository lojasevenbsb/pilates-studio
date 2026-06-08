import { useState } from "react";
import { DIAS_SEMANA, todayStr } from "../constants/index.js";
import { iniciais, primeiroNome } from "../utils/format.js";
import { I } from "../components/Icons.jsx";

/**
 * Página de frequência — marcar presença / falta por data.
 */
export default function Frequencia({ alunos, onFreq }) {
  const [date, setDate] = useState(todayStr);
  const dow   = new Date(date + "T12:00").getDay();
  const lista = alunos.filter(a => a.diasSemana.includes(dow) && a.ativo);

  return (
    <>
      <input
        type="date"
        className="form-input"
        style={{ marginBottom:12 }}
        value={date}
        max={todayStr}
        onChange={e => setDate(e.target.value)}
      />
      <div style={{ fontSize:12, color:"var(--mu)", marginBottom:12 }}>
        {lista.length} aluno(s) com aula em {DIAS_SEMANA[dow]}
      </div>

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
                    <div className="row-sub">
                      {a.horario} · {f ? (f.presente ? "Presente" : "Faltou") : "Não registrado"}
                    </div>
                  </div>
                  <div className="btn-row">
                    <button
                      className={`btn btn-icon btn-sm ${f?.presente === true ? "btn-ok" : "btn-out"}`}
                      onClick={() => onFreq(a.id, true)}
                    >{I.check}</button>
                    <button
                      className={`btn btn-icon btn-sm ${f?.presente === false ? "btn-danger" : "btn-out"}`}
                      onClick={() => onFreq(a.id, false)}
                    >{I.x}</button>
                  </div>
                </div>
              );
            })
        }
      </div>
    </>
  );
}
