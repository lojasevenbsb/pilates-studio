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

export function useModalidades() {
  return useQuery({ queryKey: queryKeys.modalidades(), queryFn: () => api("/api/modalidades") });
}

export function useCreateModalidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/modalidades", jo("POST", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.modalidades() }),
  });
}

export function useUpdateModalidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }) => api(`/api/modalidades/${id}`, jo("PUT", dados)),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.modalidades() }),
  });
}

export function useDeleteModalidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/api/modalidades/${id}`, { method: "DELETE" }),
    onSuccess:  ()   => qc.invalidateQueries({ queryKey: queryKeys.modalidades() }),
  });
}
