// Datos personales del CV. Valida (suave) email y URLs.
import { isValidEmail, isValidUrl } from "../../lib/validators.js";

const FIELDS = [
  { key: "nombreCompleto", label: "Nombre Completo", type: "text", full: false, recommended: true },
  { key: "ciudadEstado", label: "Ciudad y Estado", type: "text", full: false },
  { key: "correo", label: "Correo", type: "email", full: false, validate: isValidEmail, error: "Correo no válido", recommended: true },
  { key: "telefono", label: "Cel / Tel", type: "text", full: false },
  { key: "github", label: "GitHub", type: "text", full: false, validate: isValidUrl, error: "URL no válida" },
  { key: "web", label: "Web", type: "text", full: false, validate: isValidUrl, error: "URL no válida" },
  { key: "linkedin", label: "LinkedIn", type: "text", full: true, validate: isValidUrl, error: "URL no válida" },
];

export default function PersonalForm({ personal, setPersonal }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <h2 className="card-title">Datos personales</h2>
        <p className="text-xs opacity-60 -mt-2">
          <span className="text-primary">*</span> recomendado para que tu CV se vea completo.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {FIELDS.map((field) => {
            const value = personal[field.key];
            const invalid = field.validate ? !field.validate(value) : false;

            return (
              <label key={field.key} className={`floating-label ${field.full ? "md:col-span-2" : ""}`}>
                <input
                  type={field.type}
                  placeholder={field.label}
                  className={`input input-bordered w-full ${invalid ? "input-error" : ""}`}
                  value={value}
                  aria-invalid={invalid}
                  onChange={(e) => setPersonal(field.key, e.target.value)}
                />
                <span>
                  {field.label}
                  {field.recommended ? <span className="text-primary"> *</span> : null}
                </span>
                {invalid ? <span className="mt-1 block text-xs text-error">{field.error}</span> : null}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
