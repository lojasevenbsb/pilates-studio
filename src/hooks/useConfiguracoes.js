"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";

const api = async (url, opts = {}) => {
  const res  = await fetch(url, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erro na requisição");
  return json.data;
};

export function useConfiguracoes() {
  return useQuery({ queryKey: queryKeys.configuracoes(), queryFn: () => api("/api/configuracoes") });
}

export function useUpdateConfiguracoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    }),
    onSuccess: (data) => qc.setQueryData(queryKeys.configuracoes(), data),
  });
}
