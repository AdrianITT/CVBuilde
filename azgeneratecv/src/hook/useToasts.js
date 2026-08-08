// useToasts.js
// Sistema ligero de notificaciones (reemplaza alert()). Auto-descarta tras unos segundos.
import { useCallback, useState } from "react";

const TOAST_TTL = 4000;
const makeId = () => crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`;

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      const id = makeId();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), TOAST_TTL);
    },
    [dismiss]
  );

  return { toasts, notify, dismiss };
}
