import { useState, useCallback, useRef } from "react";

const DURACAO_MS = 2200;

export function useToast() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback(msg => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), DURACAO_MS);
  }, []);

  return [message, showToast];
}
