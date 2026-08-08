// Modal de confirmación (reemplaza confirm() nativo). Cierra con Escape.
import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Confirmar",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmClass = "btn-error",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="py-4 text-sm opacity-80">{message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <button className="modal-backdrop" aria-label="Cerrar" onClick={onCancel} />
    </div>
  );
}
