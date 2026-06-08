"use client";
import { createContext, useContext, useState } from "react";
import { useToast } from "../hooks/useToast.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, showToast] = useToast();
  const [sheet, setSheet]  = useState(null);

  const openPago = (alunoId, mes) => setSheet({ type: "pago", data: { alunoId, mes } });

  return (
    <AppContext.Provider value={{ toast, showToast, sheet, setSheet, openPago }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
