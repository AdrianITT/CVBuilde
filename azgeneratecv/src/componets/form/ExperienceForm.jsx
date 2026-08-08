// Sección de experiencia laboral, con logros editables por puesto.
import { useState } from "react";
import AchievementPhraseBank from "../AchievementPhraseBank.jsx";

const EMPTY_EXPERIENCE = {
  puesto: "",
  empresa: "",
  ciudad: "",
  fechaInicio: "",
  fechaFin: "",
  actualmente: false,
  logros: [""],
};

function summarizeExperience(exp) {
  const title = [exp.puesto, exp.empresa].filter((part) => part?.trim()).join(" · ");
  return title || "Sin completar";
}

export default function ExperienceForm({
  items,
  addItem,
  removeItem,
  moveItem,
  duplicateItem,
  updateArrayItem,
  updateLogro,
  addLogro,
  addLogroWithValue,
  removeLogro,
}) {
  // [ux-fix] Colapsable local: con varias experiencias el formulario se hace
  // muy largo. Las tarjetas nuevas siempre abren expandidas (no están en el Set).
  const [collapsed, setCollapsed] = useState(() => new Set());
  // Índices con el banco de frases abierto (se cierra al elegir una frase).
  const [openPhraseBank, setOpenPhraseBank] = useState(() => new Set());

  const toggleCollapsed = (index) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const togglePhraseBank = (index) => {
    setOpenPhraseBank((prev) => {
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
          <h2 className="card-title">Experiencia</h2>
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
              onClick={() => addItem("experiencia", { ...EMPTY_EXPERIENCE, logros: [""] })}
            >
              + Agregar
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {items.map((exp, i) => {
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
                      <div className="font-semibold">Experiencia #{i + 1}</div>
                      {isCollapsed ? (
                        <div className="truncate text-xs opacity-60">{summarizeExperience(exp)}</div>
                      ) : null}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      title="Subir"
                      disabled={i === 0}
                      onClick={() => moveItem("experiencia", i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      title="Bajar"
                      disabled={i === items.length - 1}
                      onClick={() => moveItem("experiencia", i, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => duplicateItem("experiencia", i)}
                    >
                      Duplicar
                    </button>
                    <button className="btn btn-xs btn-ghost" onClick={() => removeItem("experiencia", i)}>
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
                          placeholder="Puesto"
                          value={exp.puesto}
                          onChange={(e) => updateArrayItem("experiencia", i, "puesto", e.target.value)}
                        />
                        <span>Puesto</span>
                      </label>

                      <label className="floating-label">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Empresa"
                          value={exp.empresa}
                          onChange={(e) => updateArrayItem("experiencia", i, "empresa", e.target.value)}
                        />
                        <span>Empresa</span>
                      </label>

                      <label className="floating-label">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Ciudad"
                          value={exp.ciudad}
                          onChange={(e) => updateArrayItem("experiencia", i, "ciudad", e.target.value)}
                        />
                        <span>Ciudad</span>
                      </label>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium opacity-80">Inicio</label>
                          <input
                            type="month"
                            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={exp.fechaInicio}
                            onChange={(e) => updateArrayItem("experiencia", i, "fechaInicio", e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium opacity-80">Fin</label>
                          <input
                            type="month"
                            disabled={exp.actualmente}
                            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={exp.fechaFin}
                            onChange={(e) => updateArrayItem("experiencia", i, "fechaFin", e.target.value)}
                          />
                        </div>
                      </div>

                      <label className="label cursor-pointer justify-start gap-2 md:col-span-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={exp.actualmente}
                          onChange={(e) => updateArrayItem("experiencia", i, "actualmente", e.target.checked)}
                        />
                        <span className="label-text">Actualmente aquí</span>
                      </label>
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold">Logros / Responsabilidades</div>
                        <div className="flex items-center gap-1">
                          <button type="button" className="btn btn-xs btn-ghost" onClick={() => togglePhraseBank(i)}>
                            💡 Frases sugeridas
                          </button>
                          <button className="btn btn-xs btn-outline" onClick={() => addLogro(i)}>
                            + Logro
                          </button>
                        </div>
                      </div>

                      {openPhraseBank.has(i) ? (
                        <AchievementPhraseBank
                          onSelect={(phrase) => {
                            addLogroWithValue(i, phrase);
                            togglePhraseBank(i);
                          }}
                          onClose={() => togglePhraseBank(i)}
                        />
                      ) : null}

                      <div className="mt-2 grid gap-2">
                        {exp.logros.map((l, li) => (
                          <div key={li} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input
                              className="input input-bordered w-full"
                              placeholder={`Logro #${li + 1}`}
                              value={l}
                              onChange={(e) => updateLogro(i, li, e.target.value)}
                            />
                            <button className="btn btn-ghost w-full sm:w-auto" onClick={() => removeLogro(i, li)}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
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
