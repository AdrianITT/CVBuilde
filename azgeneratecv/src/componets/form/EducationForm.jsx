// Sección de educación del CV.
const EMPTY_EDUCATION = {
  grado: "",
  institucion: "",
  ciudad: "",
  fechaInicio: "",
  fechaFin: "",
  detalles: "",
};

export default function EducationForm({ items, addItem, removeItem, updateArrayItem }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title">Educación</h2>
          <button
            className="btn btn-sm btn-outline w-full sm:w-auto"
            onClick={() => addItem("educacion", { ...EMPTY_EDUCATION })}
          >
            + Agregar
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {items.map((edu, i) => (
            <div key={i} className="rounded-lg border border-base-300 p-3 sm:rounded-2xl sm:p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">Educación #{i + 1}</div>
                <button className="btn btn-xs btn-ghost" onClick={() => removeItem("educacion", i)}>
                  Eliminar
                </button>
              </div>

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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
