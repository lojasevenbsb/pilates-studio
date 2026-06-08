"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlunos } from "../hooks/useAlunos.js";
import { usePlanos } from "../hooks/usePlanos.js";
import { todayStr }  from "../constants/index.js";
import { brl, iniciais } from "../utils/format.js";
import { I } from "../components/Icons.jsx";

export default function Alunos() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const mesAtual  = todayStr.slice(0, 7);

  const { data: alunos   = [], isLoading } = useAlunos();
  const { data: planos   = [] }            = usePlanos();

  const lista = alunos.filter(a =>
    a.nome.toLowerCase().includes(q.toLowerCase()) || a.telefone?.includes(q)
  );

  if (isLoading) return <div className="empty"><p>Carregando…</p></div>;

  return (
    <>
      <div className="searchbar">
        {I.search}
        <input
          className="form-input"
          style={{ paddingLeft: 38 }}
          placeholder="Buscar aluno…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="section">
        {lista.length === 0
          ? <div className="empty"><div className="empty-ico">🔍</div><p>Nenhum aluno encontrado</p></div>
          : lista.map(a => {
              const p = planos.find(pl => pl.id === a.planoId);
              const m = a.mensalidades?.find(m => m.mes === mesAtual);
              return (
                <div key={a._id} className="row" onClick={() => router.push(`/alunos/${a._id}`)}>
                  <div className="row-av">{iniciais(a.nome)}</div>
                  <div className="row-body">
                    <div className="row-name">{a.nome}</div>
                    <div className="row-sub">{p?.freq}x/sem · {a.horario}</div>
                  </div>
                  <div className="row-end">
                    {m
                      ? m.pago
                        ? <span className="badge ok">{I.check} Pago</span>
                        : <span className="badge danger">Aberto</span>
                      : null
                    }
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
