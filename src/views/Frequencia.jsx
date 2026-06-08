"use client";
import { useState } from "react";
import { useAlunos, useRegistrarFreq } from "../hooks/useAlunos.js";
import { useApp }    from "../context/AppContext.jsx";
import { DIAS_SEMANA, todayStr } from "../constants/index.js";
import { iniciais, primeiroNome } from "../utils/format.js";
import { I } from "../components/Icons.jsx";

export default function Frequencia() {
  const { showToast } = useApp();
  const [date, setDate] = useState(todayStr);
  const dow = new Date(date + "T12:00").getDay();

  const { data: alunos = [], isLoading } = useAlunos();
  const { mutate: registrarFreq } = useRegistrarFreq();

  const lista = alunos.filter(a => a.diasSemana?.includes(dow) && a.ativo);

  const marcar = (alunoId, presente) => {
    registrarFreq(
      { alunoId, presente, data: date },
      { onSuccess: () => showToast(presente ? "✓ Presença registrada" : "✓ Falta registrada") }
    );
  };

  if (isLoading) return <div className="empty"><p>Carregando…</p></div>;

  return (
    <>
      <input
        type="date"
        className="form-input"
        style={{ marginBottom: 12 }}
        value={date}
        max={todayStr}
        onChange={e => setDate(e.target.value)}
      />
      <div style={{ fontSize: 12, color: "var(--mu)", marginBottom: 12 }}>
        {lista.length} aluno(s) com aula em {DIAS_SEMANA[dow]}
      </div>

      <div className="section">
        {lista.length === 0
          ? <div className="empty"><div className="empty-ico">📋</div><p>Nenhum aluno com aula nesse dia</p></div>
          : lista.map(a => {
              const f = a.frequencias?.find(ff => ff.data === date);
              return (
                <div key={a._id} className="row" style={{ cursor: "default", flexWrap: "wrap", gap: 8 }}>
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
                      onClick={() => marcar(a._id, true)}
                    >{I.check}</button>
                    <button
                      className={`btn btn-icon btn-sm ${f?.presente === false ? "btn-danger" : "btn-out"}`}
                      onClick={() => marcar(a._id, false)}
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
