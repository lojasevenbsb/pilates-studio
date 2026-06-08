"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys.js";

export function usePlanos() {
  return useQuery({
    queryKey: queryKeys.planos(),
    queryFn:  () => fetch("/api/planos").then(r => r.json()).then(r => r.data),
    staleTime: 10 * 60_000, // planos mudam raramente — cache por 10 min
  });
}
