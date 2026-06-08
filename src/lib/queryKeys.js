export const queryKeys = {
  alunos:        (filters = {}) => ["alunos", filters],
  aluno:         (id)           => ["alunos", id],
  agendamentos:  (filters = {}) => ["agendamentos", filters],
  instrutores:   ()             => ["instrutores"],
  modalidades:   ()             => ["modalidades"],
  planos:        ()             => ["planos"],
  configuracoes: ()             => ["configuracoes"],
};
