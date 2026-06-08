"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";

const api = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro na requisição");
  return json.data;
};

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ── Queries ──────────────────────────────────────────────────────────────────

export function useAlunos(filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== null))
  );
  return useQuery({
    queryKey: queryKeys.alunos(filters),
    queryFn:  () => api(`/api/alunos?${params}`),
  });
}

export function useAluno(id) {
  return useQuery({
    queryKey: queryKeys.aluno(id),
    queryFn:  () => api(`/api/alunos/${id}`),
    enabled:  !!id,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateAluno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/alunos", json("POST", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alunos"] }),
  });
}

export function useUpdateAluno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }) => api(`/api/alunos/${id}`, json("PUT", dados)),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.aluno(data._id), data);
      qc.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}

export function useMarcarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alunoId, mes, formaPag }) =>
      api(`/api/alunos/${alunoId}/mensalidades/${mes}`, json("PATCH", { formaPag })),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.aluno(data._id), data);
      qc.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}

export function useRegistrarFreq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alunoId, presente, data }) =>
      api(`/api/alunos/${alunoId}/frequencias`, json("POST", { presente, data })),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.aluno(data._id), data);
      qc.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}

export function useDeleteAluno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/api/alunos/${id}`, { method: "DELETE" }),
    onSuccess:  ()   => qc.invalidateQueries({ queryKey: ["alunos"] }),
  });
}
