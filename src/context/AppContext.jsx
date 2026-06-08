import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast }        from "../hooks/useToast";
import {
  PLANOS,
  ALUNOS_INIT,
  AGENDAMENTOS_INIT,
  INSTRUTORES_INIT,
  MODALIDADES_INIT,
  todayStr,
} from "../constants";
import { proxHora } from "../utils/format";

const AppContext = createContext(null);

/** Gera agendamentos para um aluno novo com contrato. Retorna a quantidade gerada. */
function _gerarAgendamentos(aluno, baseId, setAgendamentos) {
  if (!aluno.dataInicio || !aluno.dataTermino || !(aluno.diasSemana?.length)) return 0;
  const horarios = aluno.horariosPorDia || {};
  const novos    = [];
  const end      = new Date(aluno.dataTermino + "T12:00");
  const cur      = new Date(aluno.dataInicio  + "T12:00");
  let   ctr      = 0;
  while (cur <= end) {
    const dow = cur.getDay();
    if (aluno.diasSemana.includes(dow)) {
      const horaI = horarios[dow] || aluno.horario || "08:00";
      novos.push({
        id:         baseId + ctr++,
        alunoId:    aluno.id,
        alunoNome:  aluno.nome,
        data:       cur.toISOString().split("T")[0],
        horaInicio: horaI,
        horaFim:    proxHora(horaI),
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
}

export function AppProvider({ children }) {
  // ── Estado persistido ────────────────────────────────────────────────────
  const [alunos,       setAlunos]       = useLocalStorage("pilates_alunos",        ALUNOS_INIT);
  const [agendamentos, setAgendamentos] = useLocalStorage("pilates_agendamentos",   AGENDAMENTOS_INIT);
  const [instrutores,  setInstrutores]  = useLocalStorage("pilates_instrutores",    INSTRUTORES_INIT);
  const [modalidades,  setModalidades]  = useLocalStorage("pilates_modalidades",    MODALIDADES_INIT);

  // ── Estado volátil (UI) ──────────────────────────────────────────────────
  const [toast, showToast] = useToast();
  const [stack, setStack]  = useState([]);
  const [sheet, setSheet]  = useState(null); // { type, data }

  // ── Navegação ────────────────────────────────────────────────────────────
  const push    = (screen, data = {}) => setStack(s => [...s, { screen, data }]);
  const pop     = ()                  => setStack(s => s.slice(0, -1));
  const current = stack[stack.length - 1] ?? null;

  // ── Helpers de data ──────────────────────────────────────────────────────
  const mesAtual = todayStr.slice(0, 7);

  // ── Mutações de alunos ───────────────────────────────────────────────────
  const salvarAluno = dados => {
    if (dados.id && alunos.find(a => a.id === dados.id)) {
      setAlunos(p => p.map(a => a.id === dados.id ? { ...a, ...dados } : a));
      showToast("✓ Dados atualizados");
    } else {
      const plano = PLANOS.find(p => p.id === dados.planoId);
      const newId = Date.now();
      const newA  = {
        ...dados,
        id:   newId,
        ativo: true,
        mensalidades: dados.mensalidades?.length
          ? dados.mensalidades
          : [{ mes: mesAtual, vencimento: `${mesAtual}-${dados.diaVencimento||"10"}`, valor: plano?.valor || Number(dados.valorPlano) || 0, pago: false, dataPag: null, formaPag: null }],
        frequencias: [],
      };
      setAlunos(p => [...p, newA]);

      // Gerar agendamentos automáticos se o aluno tem contrato completo
      const qtdAulas = _gerarAgendamentos(newA, newId, setAgendamentos);
      showToast(qtdAulas
        ? `✓ Aluno cadastrado · ${qtdAulas} aulas agendadas`
        : "✓ Aluno cadastrado"
      );
    }
    setSheet(null);
  };

  const marcarPago = (alunoId, mes, formaPag) => {
    setAlunos(p => p.map(a =>
      a.id !== alunoId ? a : {
        ...a,
        mensalidades: a.mensalidades.map(m =>
          m.mes !== mes ? m : { ...m, pago: true, dataPag: todayStr, formaPag: formaPag ?? null }
        ),
      }
    ));
    showToast("✓ Pagamento registrado");
  };

  const registrarFreq = (alunoId, presente) => {
    setAlunos(p => p.map(a => {
      if (a.id !== alunoId) return a;
      const existente = a.frequencias.find(f => f.data === todayStr);
      const frequencias = existente
        ? a.frequencias.map(f => f.data === todayStr ? { ...f, presente } : f)
        : [...a.frequencias, { data: todayStr, presente }];
      return { ...a, frequencias };
    }));
    showToast(presente ? "✓ Presença registrada" : "✓ Falta registrada");
  };

  // ── Abertura do sheet de pagamento ───────────────────────────────────────
  const openPago = (alunoId, mes) => {
    setSheet({ type: "pago", data: { alunoId, mes } });
  };

  return (
    <AppContext.Provider value={{
      // dados
      alunos, setAlunos,
      agendamentos, setAgendamentos,
      instrutores, setInstrutores,
      modalidades, setModalidades,
      // UI
      toast, showToast,
      stack, sheet, setSheet,
      // navegação
      push, pop, current,
      // helpers
      mesAtual,
      // mutações
      salvarAluno, marcarPago, registrarFreq, openPago,
    }}>
      {children}
    </AppContext.Provider>
  );
}

/** Hook de conveniência */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
