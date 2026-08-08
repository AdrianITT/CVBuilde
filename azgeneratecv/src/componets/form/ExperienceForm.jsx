// Sección de experiencia laboral, con logros editables por puesto.
const EMPTY_EXPERIENCE = {
  puesto: "",
  empresa: "",
  ciudad: "",
  fechaInicio: "",
  fechaFin: "",
  actualmente: false,
  logros: [""],
};

export default function ExperienceForm({
  items,
  addItem,
  removeItem,
  updateArrayItem,
  updateLogro,
  addLogro,
  removeLogro,
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title">Experiencia</h2>
          <button
            className="btn btn-sm btn-outline w-full sm:w-auto"
            onClick={() => addItem("experiencia", { ...EMPTY_EXPERIENCE, logros: [""] })}
          >
            + Agregar
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {items.map((exp, i) => (
            <div key={i} className="rounded-lg border border-base-300 p-3 sm:rounded-2xl sm:p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">Experiencia #{i + 1}</div>
                <button className="btn btn-xs btn-ghost" onClick={() => removeItem("experiencia", i)}>
                  Eliminar
                </button>
              </div>

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
                  <button className="btn btn-xs btn-outline" onClick={() => addLogro(i)}>
                    + Logro
                  </button>
                </div>

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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
