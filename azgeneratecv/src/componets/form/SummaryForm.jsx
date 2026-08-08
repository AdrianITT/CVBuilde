// Resumen profesional del CV.
export default function SummaryForm({ value, onChange }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <h2 className="card-title">Resumen</h2>
        <textarea
          placeholder="2–3 líneas: stack + valor + impacto"
          className="textarea textarea-bordered w-full min-h-[110px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="text-xs opacity-60 mt-2">
          Tip: “Full-stack (Django/React) enfocado en automatización, PDFs/Excel y APIs…”
        </div>
      </div>
    </div>
  );
}
