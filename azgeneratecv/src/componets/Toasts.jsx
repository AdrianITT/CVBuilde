// Contenedor de notificaciones (toasts) de DaisyUI.
const ALERT_CLASS = {
  success: "alert-success",
  error: "alert-error",
  warning: "alert-warning",
  info: "alert-info",
};

export default function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast toast-top toast-end z-[100]">
      {toasts.map((toast) => (
        <div key={toast.id} className={`alert ${ALERT_CLASS[toast.type] ?? "alert-info"} shadow-lg`}>
          <span className="text-sm">{toast.message}</span>
          <button
            className="btn btn-ghost btn-xs"
            aria-label="Cerrar notificación"
            onClick={() => onDismiss(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
