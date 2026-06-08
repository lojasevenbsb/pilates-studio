"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";

const api = async (url, opts = {}) => {
  const res  = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro na requisição");
  return json.data;
};
const jo = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function useInstrutores() {
  return useQuery({ queryKey: queryKeys.instrutores(), queryFn: () => api("/api/instrutores") });
}

export function useCreateInstrutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/instrutores", jo("POST", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.instrutores() }),
  });
}

export function useUpdateInstrutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }) => api(`/api/instrutores/${id}`, jo("PUT", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.instrutores() }),
  });
}

export function useDeleteInstrutor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/api/instrutores/${id}`, { method: "DELETE" }),
    onSuccess:  ()   => qc.invalidateQueries({ queryKey: queryKeys.instrutores() }),
  });
}
