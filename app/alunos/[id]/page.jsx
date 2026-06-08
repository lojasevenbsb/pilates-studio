"use client";
import { Suspense } from "react";
import DetalheAluno from "@/src/views/DetalheAluno";
export default function DetalhePage() {
  return <Suspense><DetalheAluno /></Suspense>;
}
