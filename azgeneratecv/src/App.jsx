// App.jsx
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import CardSkill from "./componets/CardSkill.jsx";
import CvPreview from "./componets/CvPreview.jsx";

const STORAGE_KEY = "cv_v1";
const fileInputId = "cv-json-import";

const initialCV = {
  personal: {
    nombreCompleto: "",
    ciudadEstado: "",
    correo: "",
    telefono: "",
    github: "",
    web: "",
    linkedin: "",
  },
  resumen: "",
  experiencia: [
    {
      puesto: "",
      empresa: "",
      ciudad: "",
      fechaInicio: "",
      fechaFin: "",
      actualmente: false,
      logros: [""],
    },
  ],
  educacion: [
    {
      grado: "",
      institucion: "",
      ciudad: "",
      fechaInicio: "",
      fechaFin: "",
      detalles: "",
    },
  ],
  skills: [
    { id: "s1", nombre: "React", nivel: "Intermedio" },
    { id: "s2", nombre: "Django", nivel: "Intermedio" },
  ],
};

const makeId = () => crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`;

// ✅ IMPORTANT: function (no const) para poder usarla antes sin errores
function normalizeCv(raw, initialCV, makeId) {
  const src = raw && typeof raw === "object" ? raw : {};

  // Skills
  const srcSkills = Array.isArray(src.skills) ? src.skills : [];
  const fixedSkills = srcSkills.map((s) => ({
    id: s?.id ?? makeId(),
    nombre: s?.nombre ?? "",
    nivel: s?.nivel ?? "Intermedio",
  }));

  // Experiencia
  const srcExp = Array.isArray(src.experiencia) ? src.experiencia : [];
  const fixedExp =
    srcExp.length > 0
      ? srcExp.map((e) => ({
          puesto: e?.puesto ?? "",
          empresa: e?.empresa ?? "",
          ciudad: e?.ciudad ?? "",
          fechaInicio: e?.fechaInicio ?? "",
          fechaFin: e?.fechaFin ?? "",
          actualmente: Boolean(e?.actualmente),
          logros:
            Array.isArray(e?.logros) && e.logros.length > 0
              ? e.logros.map((l) => String(l ?? ""))
              : [""],
        }))
      : initialCV.experiencia;

  // Educación
  const srcEdu = Array.isArray(src.educacion) ? src.educacion : [];
  const fixedEdu =
    srcEdu.length > 0
      ? srcEdu.map((e) => ({
          grado: e?.grado ?? "",
          institucion: e?.institucion ?? "",
          ciudad: e?.ciudad ?? "",
          fechaInicio: e?.fechaInicio ?? "",
          fechaFin: e?.fechaFin ?? "",
          detalles: e?.detalles ?? "",
        }))
      : initialCV.educacion;

  return {
    ...initialCV,
    ...src,
    personal: { ...initialCV.personal, ...(src.personal ?? {}) },
    resumen: src.resumen ?? "",
    skills: fixedSkills,
    experiencia: fixedExp,
    educacion: fixedEdu,
  };
}

export default function App() {
  const [cvData, setCvData] = useState(initialCV);
  const [openPreview, setOpenPreview] = useState(false);

  // ===== Load storage =====
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setCvData(normalizeCv(parsed, initialCV, makeId));
    } catch (error) {
      console.error("Error leyendo localStorage:", error);
    }
  }, []);

  // ===== Autosave =====
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch (error) {
      console.error("Error guardando localStorage:", error);
    }
  }, [cvData]);

  // ===== Helpers =====
  const setPersonal = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const updateArrayItem = (key, index, field, value) => {
    setCvData((prev) => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  };

  const addItem = (key, template) => {
    setCvData((prev) => ({ ...prev, [key]: [...prev[key], template] }));
  };

  const removeItem = (key, index) => {
    setCvData((prev) => {
      const arr = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: arr.length ? arr : [initialCV[key][0]] };
    });
  };

  const updateLogro = (expIndex, logroIndex, value) => {
    setCvData((prev) => {
      const experiencia = [...prev.experiencia];
      const item = { ...experiencia[expIndex] };
      const logros = [...item.logros];
      logros[logroIndex] = value;
      item.logros = logros;
      experiencia[expIndex] = item;
      return { ...prev, experiencia };
    });
  };

  const addLogro = (expIndex) => {
    setCvData((prev) => {
      const experiencia = [...prev.experiencia];
      const item = { ...experiencia[expIndex] };
      item.logros = [...item.logros, ""];
      experiencia[expIndex] = item;
      return { ...prev, experiencia };
    });
  };

  const removeLogro = (expIndex, logroIndex) => {
    setCvData((prev) => {
      const experiencia = [...prev.experiencia];
      const item = { ...experiencia[expIndex] };
      item.logros = item.logros.filter((_, i) => i !== logroIndex);
      if (item.logros.length === 0) item.logros = [""];
      experiencia[expIndex] = item;
      return { ...prev, experiencia };
    });
  };

  const jsonPreview = useMemo(() => JSON.stringify(cvData, null, 2), [cvData]);

  const handleExport = () => {
    const blob = new Blob([jsonPreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (file) => {
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      alert("Selecciona un archivo .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = JSON.parse(text);

        const normalized = normalizeCv(parsed, initialCV, makeId);
        setCvData(normalized);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

        alert("✅ JSON importado correctamente");
      } catch (err) {
        console.error(err);
        alert("❌ JSON inválido o corrupto");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* ===== Topbar sticky ===== */}
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start gap-3">
          <div className="text-lg font-bold">CV Builder -AZ-</div>
          <div className="badge badge-outline">ATS</div>
        </div>

        <div className="navbar-end gap-2">
          <button className="btn btn-sm btn-primary" onClick={handleExport}>
            Exportar JSON
          </button>

          <input
            id={fileInputId}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleImportJsonFile(file);
              e.target.value = "";
            }}
          />

          <button
            className="btn btn-sm btn-outline"
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            Importar JSON
          </button>

          <button className="btn btn-sm btn-secondary" onClick={() => setOpenPreview(true)}>
            Vista previa / PDF
          </button>

          <button
            className="btn btn-sm"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setCvData(initialCV);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* LEFT: Form */}
          <div className="lg:col-span-7 space-y-4">
            {/* Datos personales */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Datos personales</h2>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="floating-label">
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      className="input input-bordered w-full"
                      value={cvData.personal.nombreCompleto}
                      onChange={(e) => setPersonal("nombreCompleto", e.target.value)}
                    />
                    <span>Nombre Completo</span>
                  </label>

                  <label className="floating-label">
                    <input
                      type="text"
                      placeholder="Ciudad y Estado"
                      className="input input-bordered w-full"
                      value={cvData.personal.ciudadEstado}
                      onChange={(e) => setPersonal("ciudadEstado", e.target.value)}
                    />
                    <span>Ciudad y Estado</span>
                  </label>

                  <label className="floating-label">
                    <input
                      type="email"
                      placeholder="Correo"
                      className="input input-bordered w-full"
                      value={cvData.personal.correo}
                      onChange={(e) => setPersonal("correo", e.target.value)}
                    />
                    <span>Correo</span>
                  </label>

                  <label className="floating-label">
                    <input
                      type="text"
                      placeholder="Cel/Tel"
                      className="input input-bordered w-full"
                      value={cvData.personal.telefono}
                      onChange={(e) => setPersonal("telefono", e.target.value)}
                    />
                    <span>Cel / Tel</span>
                  </label>

                  <label className="floating-label">
                    <input
                      type="text"
                      placeholder="GitHub"
                      className="input input-bordered w-full"
                      value={cvData.personal.github}
                      onChange={(e) => setPersonal("github", e.target.value)}
                    />
                    <span>GitHub</span>
                  </label>

                  <label className="floating-label">
                    <input
                      type="text"
                      placeholder="Web"
                      className="input input-bordered w-full"
                      value={cvData.personal.web}
                      onChange={(e) => setPersonal("web", e.target.value)}
                    />
                    <span>Web</span>
                  </label>

                  <label className="floating-label md:col-span-2">
                    <input
                      type="text"
                      placeholder="LinkedIn"
                      className="input input-bordered w-full"
                      value={cvData.personal.linkedin}
                      onChange={(e) => setPersonal("linkedin", e.target.value)}
                    />
                    <span>LinkedIn</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Resumen</h2>
                <textarea
                  placeholder="2–3 líneas: stack + valor + impacto"
                  className="textarea textarea-bordered w-full min-h-[110px]"
                  value={cvData.resumen}
                  onChange={(e) => setCvData((p) => ({ ...p, resumen: e.target.value }))}
                />
                <div className="text-xs opacity-60 mt-2">
                  Tip: “Full-stack (Django/React) enfocado en automatización, PDFs/Excel y APIs…”
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Skills</h2>
                <CardSkill
                  value={cvData.skills}
                  onChange={(next) =>
                    setCvData((p) => ({
                      ...p,
                      skills: typeof next === "function" ? next(p.skills) : next,
                    }))
                  }
                />
              </div>
            </div>

            {/* Experiencia */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="card-title">Experiencia</h2>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      addItem("experiencia", {
                        puesto: "",
                        empresa: "",
                        ciudad: "",
                        fechaInicio: "",
                        fechaFin: "",
                        actualmente: false,
                        logros: [""],
                      })
                    }
                  >
                    + Agregar
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {cvData.experiencia.map((exp, i) => (
                    <div key={i} className="rounded-2xl border border-base-300 p-4">
                      <div className="flex items-center justify-between mb-2">
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
                              onChange={(e) =>
                                updateArrayItem("experiencia", i, "fechaInicio", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium opacity-80">Fin</label>
                            <input
                              type="month"
                              disabled={exp.actualmente}
                              className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                              value={exp.fechaFin}
                              onChange={(e) =>
                                updateArrayItem("experiencia", i, "fechaFin", e.target.value)
                              }
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
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">Logros / Responsabilidades</div>
                          <button className="btn btn-xs btn-outline" onClick={() => addLogro(i)}>
                            + Logro
                          </button>
                        </div>

                        <div className="mt-2 grid gap-2">
                          {exp.logros.map((l, li) => (
                            <div key={li} className="flex gap-2">
                              <input
                                className="input input-bordered w-full"
                                placeholder={`Logro #${li + 1}`}
                                value={l}
                                onChange={(e) => updateLogro(i, li, e.target.value)}
                              />
                              <button className="btn btn-ghost" onClick={() => removeLogro(i, li)}>
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

            {/* Educación */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="card-title">Educación</h2>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      addItem("educacion", {
                        grado: "",
                        institucion: "",
                        ciudad: "",
                        fechaInicio: "",
                        fechaFin: "",
                        detalles: "",
                      })
                    }
                  >
                    + Agregar
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {cvData.educacion.map((edu, i) => (
                    <div key={i} className="rounded-2xl border border-base-300 p-4">
                      <div className="flex items-center justify-between mb-2">
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
                            onChange={(e) =>
                              updateArrayItem("educacion", i, "fechaInicio", e.target.value)
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium opacity-80">Fin</label>
                          <input
                            type="month"
                            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={edu.fechaFin}
                            onChange={(e) =>
                              updateArrayItem("educacion", i, "fechaFin", e.target.value)
                            }
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
          </div>

          {/* RIGHT: JSON Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Preview JSON</h3>
                  <div className="badge badge-ghost">Autosave</div>
                </div>

                <pre className="mt-3 p-3 rounded-xl bg-base-200 text-xs overflow-auto max-h-[560px] border border-base-300">
                  {jsonPreview}
                </pre>
              </div>
            </div>

            <div className="alert alert-info">
              <span className="text-sm">
                Tip: usa logros con números (tiempo ahorrado, % reducción, # reportes, etc.).
              </span>
            </div>
          </div>
        </div>

        {/* Modal preview */}
        {openPreview && <CvPreview data={cvData} onClose={() => setOpenPreview(false)} />}
      </div>
    </div>
  );
}
