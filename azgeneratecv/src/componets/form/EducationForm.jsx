// Sección de educación del CV.
import { useState } from "react";

const EMPTY_EDUCATION = {
  grado: "",
  institucion: "",
  ciudad: "",
  fechaInicio: "",
  fechaFin: "",
  detalles: "",
};

function summarizeEducation(edu) {
  const title = [edu.grado, edu.institucion].filter((part) => part?.trim()).join(" · ");
  return title || "Sin completar";
}

export default function EducationForm({ items, addItem, removeItem, moveItem, duplicateItem, updateArrayItem }) {
  // [ux-fix] Colapsable local: con varias entradas la lista se hace muy larga.
  // Las tarjetas nuevas siempre abren expandidas (no están en el Set).
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleCollapsed = (index) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title">Educación</h2>
          <div className="flex flex-wrap items-center gap-2">
            {items.length > 1 ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() =>
                  setCollapsed(collapsed.size === items.length ? new Set() : new Set(items.map((_, i) => i)))
                }
              >
                {collapsed.size === items.length ? "Expandir todo" : "Colapsar todo"}
              </button>
            ) : null}
            <button
              className="btn btn-sm btn-outline w-full sm:w-auto"
              onClick={() => addItem("educacion", { ...EMPTY_EDUCATION })}
            >
              + Agregar
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {items.map((edu, i) => {
            const isCollapsed = collapsed.has(i);

            return (
              <div key={i} className="rounded-lg border border-base-300 p-3 sm:rounded-2xl sm:p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    className="flex min-w-0 items-center gap-2 text-left"
                    onClick={() => toggleCollapsed(i)}
                  >
                    <span className={`shrink-0 transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▸</span>
                    <div className="min-w-0">
                      <div className="font-semibold">Educación #{i + 1}</div>
                      {isCollapsed ? (
                        <div className="truncate text-xs opacity-60">{summarizeEducation(edu)}</div>
                      ) : null}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      title="Subir"
                      disabled={i === 0}
                      onClick={() => moveItem("educacion", i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      title="Bajar"
                      disabled={i === items.length - 1}
                      onClick={() => moveItem("educacion", i, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => duplicateItem("educacion", i)}
                    >
                      Duplicar
                    </button>
                    <button className="btn btn-xs btn-ghost" onClick={() => removeItem("educacion", i)}>
                      Eliminar
                    </button>
                  </div>
                </div>

                {isCollapsed ? null : (
                  <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="floating-label">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Grado"
                          value={edu.grado}
                          onChange={(e) => updateArrayItem("educacion", i, "grado", e.target.value)}
                        />
                        <span>Grado</span>
                      </label>

                      <label className="floating-label">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Institución"
                          value={edu.institucion}
                          onChange={(e) => updateArrayItem("educacion", i, "institucion", e.target.value)}
                        />
                        <span>Institución</span>
                      </label>

                      <label className="floating-label">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Ciudad"
                          value={edu.ciudad}
                          onChange={(e) => updateArrayItem("educacion", i, "ciudad", e.target.value)}
                        />
                        <span>Ciudad</span>
                      </label>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium opacity-80">Inicio</label>
                          <input
                            type="month"
                            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={edu.fechaInicio}
                            onChange={(e) => updateArrayItem("educacion", i, "fechaInicio", e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium opacity-80">Fin</label>
                          <input
                            type="month"
                            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={edu.fechaFin}
                            onChange={(e) => updateArrayItem("educacion", i, "fechaFin", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Detalles (tesis, enfoque, logros, etc.)"
                        value={edu.detalles}
                        onChange={(e) => updateArrayItem("educacion", i, "detalles", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
