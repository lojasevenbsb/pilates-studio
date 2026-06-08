"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";

const api = async (url, opts = {}) => {
  const res  = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro na requisição");
  return json.data;
};
const jsonOpts = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function useAgendamentos(filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== null))
  );
  return useQuery({
    queryKey: queryKeys.agendamentos(filters),
    queryFn:  () => api(`/api/agendamentos?${params}`),
  });
}

export function useCreateAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/agendamentos", jsonOpts("POST", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
}

export function useUpdateAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }) => api(`/api/agendamentos/${id}`, jsonOpts("PUT", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
}

export function useDeleteAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/api/agendamentos/${id}`, { method: "DELETE" }),
    onSuccess:  ()   => qc.invalidateQueries({ queryKey: ["agendamentos"] }),
  });
}
