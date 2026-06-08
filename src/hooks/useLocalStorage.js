import { useState, useCallback } from "react";

/**
 * useState com persistência em localStorage.
 * API idêntica ao useState — aceita valor inicial ou função inicializadora,
 * e o setter aceita tanto valor direto quanto função updater (prev => next).
 */
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {
      // JSON inválido: ignora e usa o valor inicial
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  const setValue = useCallback(
    valueOrUpdater => {
      setState(prev => {
        const next =
          typeof valueOrUpdater === "function"
            ? valueOrUpdater(prev)
            : valueOrUpdater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          console.warn(`useLocalStorage: falha ao salvar "${key}"`);
        }
        return next;
      });
    },
    [key]
  );

  return [state, setValue];
}
