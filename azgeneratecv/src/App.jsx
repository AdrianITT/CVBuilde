// App.jsx
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import CardSkill from "./componets/CardSkill.jsx";
import CvPreview from "./componets/CvPreview.jsx";
import SpellChecker from "./componets/SpellChecker.jsx";
import StyleCV, { DEFAULT_CV_STYLE_ID, normalizeCvStyleId } from "./componets/StyleCV.jsx";

const STORAGE_KEY = "cv_v1";
const PROFILES_STORAGE_KEY = "cv_profiles_v1";
const PROFILE_FALLBACK_NAME = "CV Principal";
const fileInputId = "cv-json-import";

const initialCV = {
  templateStyle: DEFAULT_CV_STYLE_ID,
  templateSettings: {},
  personal: {
    nombreCompleto: "",
    ciudadEstado: "",
    correo: "",
    telefono: "",
    github: "",
    web: "",
    linkedin: "",
    foto: "",
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

// ✅ function (no const) para poder usarla antes
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
    templateStyle: normalizeCvStyleId(src.templateStyle),
    templateSettings: src.templateSettings && typeof src.templateSettings === "object" ? src.templateSettings : {},
    personal: { ...initialCV.personal, ...(src.personal ?? {}) },
    resumen: src.resumen ?? "",
    skills: fixedSkills,
    experiencia: fixedExp,
    educacion: fixedEdu,
  };
}

function createCvProfile(name, data = initialCV) {
  return {
    id: makeId(),
    name: name?.trim() || PROFILE_FALLBACK_NAME,
    updatedAt: new Date().toISOString(),
    data: normalizeCv(data, initialCV, makeId),
  };
}

function normalizeProfile(raw, index = 0) {
  const fallbackName = index === 0 ? PROFILE_FALLBACK_NAME : `CV ${index + 1}`;
  const sourceData = raw?.data ?? raw?.cvData ?? raw ?? initialCV;

  return {
    id: String(raw?.id || makeId()),
    name: String(raw?.name || fallbackName),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
    data: normalizeCv(sourceData, initialCV, makeId),
  };
}

function loadProfilesState() {
  try {
    const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      const normalizedProfiles = Array.isArray(parsed?.profiles)
        ? parsed.profiles.map((profile, index) => normalizeProfile(profile, index))
        : [];

      if (normalizedProfiles.length) {
        const activeProfileId = normalizedProfiles.some((profile) => profile.id === parsed.activeProfileId)
          ? parsed.activeProfileId
          : normalizedProfiles[0].id;
        const activeProfile = normalizedProfiles.find((profile) => profile.id === activeProfileId) ?? normalizedProfiles[0];

        return {
          profiles: normalizedProfiles,
          activeProfileId,
          profileName: activeProfile.name,
          cvData: activeProfile.data,
        };
      }
    }

    const savedLegacyCv = localStorage.getItem(STORAGE_KEY);
    const legacyCv = savedLegacyCv ? normalizeCv(JSON.parse(savedLegacyCv), initialCV, makeId) : initialCV;
    const profile = createCvProfile(PROFILE_FALLBACK_NAME, legacyCv);

    return {
      profiles: [profile],
      activeProfileId: profile.id,
      profileName: profile.name,
      cvData: profile.data,
    };
  } catch (error) {
    console.error("Error leyendo localStorage:", error);
    const profile = createCvProfile(PROFILE_FALLBACK_NAME, initialCV);

    return {
      profiles: [profile],
      activeProfileId: profile.id,
      profileName: profile.name,
      cvData: profile.data,
    };
  }
}

export default function App() {
  const [initialProfilesState] = useState(loadProfilesState);
  const [cvData, setCvData] = useState(initialProfilesState.cvData);
  const [profiles, setProfiles] = useState(initialProfilesState.profiles);
  const [activeProfileId, setActiveProfileId] = useState(initialProfilesState.activeProfileId);
  const [profileName, setProfileName] = useState(initialProfilesState.profileName);
  const [openPreview, setOpenPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("cv");

  // ===== Autosave =====
  useEffect(() => {
    try {
      const safeProfileName = profileName.trim() || PROFILE_FALLBACK_NAME;
      const storedProfiles = profiles.map((profile) =>
        profile.id === activeProfileId
          ? {
              ...profile,
              name: safeProfileName,
              updatedAt: new Date().toISOString(),
              data: cvData,
            }
          : profile
      );

      localStorage.setItem(
        PROFILES_STORAGE_KEY,
        JSON.stringify({
          version: 2,
          activeProfileId,
          profiles: storedProfiles,
        })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch (error) {
      console.error("Error guardando localStorage:", error);
    }
  }, [activeProfileId, cvData, profileName, profiles]);

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

  const getProfilesWithCurrentData = (profileList = profiles) => {
    const safeProfileName = profileName.trim() || PROFILE_FALLBACK_NAME;

    return profileList.map((profile) =>
      profile.id === activeProfileId
        ? {
            ...profile,
            name: safeProfileName,
            updatedAt: new Date().toISOString(),
            data: cvData,
          }
        : profile
    );
  };

  const handleProfileNameChange = (value) => {
    setProfileName(value);
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === activeProfileId ? { ...profile, name: value.trim() || PROFILE_FALLBACK_NAME } : profile
      )
    );
  };

  const handleSelectProfile = (profileId) => {
    if (!profileId || profileId === activeProfileId) return;

    const nextProfiles = getProfilesWithCurrentData();
    const nextProfile = nextProfiles.find((profile) => profile.id === profileId);
    if (!nextProfile) return;

    setProfiles(nextProfiles);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
  };

  const handleCreateProfile = () => {
    const currentProfiles = getProfilesWithCurrentData();
    const nextProfile = createCvProfile(`CV ${currentProfiles.length + 1}`, initialCV);

    setProfiles([...currentProfiles, nextProfile]);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
    setActiveTab("cv");
  };

  const handleDuplicateProfile = () => {
    const currentProfiles = getProfilesWithCurrentData();
    const nextProfile = createCvProfile(`${profileName.trim() || PROFILE_FALLBACK_NAME} copia`, cvData);

    setProfiles([...currentProfiles, nextProfile]);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
  };

  const handleDeleteProfile = () => {
    const currentProfiles = getProfilesWithCurrentData();
    if (currentProfiles.length <= 1) {
      alert("Debe existir al menos un perfil.");
      return;
    }

    const confirmed = confirm(`Eliminar el perfil "${profileName.trim() || PROFILE_FALLBACK_NAME}"?`);
    if (!confirmed) return;

    const remainingProfiles = currentProfiles.filter((profile) => profile.id !== activeProfileId);
    const nextProfile = remainingProfiles[0];

    setProfiles(remainingProfiles);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
  };

  const handleResetCurrentProfile = () => {
    setCvData(normalizeCv(initialCV, initialCV, makeId));
  };

  const setValueAtPath = (path, value) => {
    setCvData((prev) => {
      const update = (target, segments) => {
        const [segment, ...rest] = segments;
        if (segment === undefined) return value;

        const nextTarget = Array.isArray(target) ? [...target] : { ...target };
        nextTarget[segment] = update(nextTarget[segment], rest);
        return nextTarget;
      };

      return update(prev, path);
    });
  };

  const jsonPreview = useMemo(() => JSON.stringify(cvData, null, 2), [cvData]);

  const exportPayload = {
    app: "azgeneratecv",
    version: 2,
    activeProfileId,
    profiles: getProfilesWithCurrentData(),
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-profiles.json";
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

        if (Array.isArray(parsed?.profiles)) {
          const importedProfiles = parsed.profiles.map((profile, index) => normalizeProfile(profile, index));
          if (!importedProfiles.length) throw new Error("No hay perfiles en el JSON.");

          const importedActiveProfileId = importedProfiles.some((profile) => profile.id === parsed.activeProfileId)
            ? parsed.activeProfileId
            : importedProfiles[0].id;
          const importedActiveProfile =
            importedProfiles.find((profile) => profile.id === importedActiveProfileId) ?? importedProfiles[0];

          setProfiles(importedProfiles);
          setActiveProfileId(importedActiveProfileId);
          setProfileName(importedActiveProfile.name);
          setCvData(importedActiveProfile.data);
        } else {
          const importedProfileName = file.name.replace(/\.json$/i, "").trim() || "CV importado";
          const importedProfile = createCvProfile(importedProfileName, parsed);
          const currentProfiles = getProfilesWithCurrentData();

          setProfiles([...currentProfiles, importedProfile]);
          setActiveProfileId(importedProfile.id);
          setProfileName(importedProfile.name);
          setCvData(importedProfile.data);
        }

        alert("✅ JSON importado correctamente");
      } catch (err) {
        console.error(err);
        alert("❌ JSON inválido o corrupto");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div lang="es" spellCheck="true" className="h-screen bg-base-200 flex flex-col overflow-hidden">
      {/* ===== Topbar sticky ===== */}
      <div className="navbar sticky top-0 z-50 flex-col gap-3 bg-base-100 px-3 py-3 shadow-sm sm:flex-row sm:px-4">
        <div className="navbar-start w-full gap-3 sm:w-auto">
          <div className="min-w-0 flex-1 text-lg font-bold sm:flex-none">CV Builder -AZ-</div>
          <div className="badge badge-outline">ATS</div>
        </div>

        <div className="navbar-end grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <button className="btn btn-sm btn-primary w-full sm:w-auto" onClick={handleExport}>
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
            className="btn btn-sm btn-outline w-full sm:w-auto"
            onClick={() => document.getElementById(fileInputId)?.click()}
          >
            Importar JSON
          </button>

          <button className="btn btn-sm btn-secondary w-full sm:w-auto" onClick={() => setOpenPreview(true)}>
            Vista previa / PDF
          </button>

          <button
            className="btn btn-sm w-full sm:w-auto"
            onClick={handleResetCurrentProfile}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ===== Content wrapper (sin scroll general) ===== */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl min-h-full p-3 sm:p-4">

          <div className="mb-4 grid gap-3 rounded-lg bg-base-100 p-3 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <label className="floating-label">
                <select
                  className="select select-sm w-full"
                  value={activeProfileId}
                  onChange={(e) => handleSelectProfile(e.target.value)}
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                <span>Perfil</span>
              </label>

              <label className="floating-label">
                <input
                  className="input input-sm w-full"
                  placeholder="Nombre del perfil"
                  value={profileName}
                  onChange={(e) => handleProfileNameChange(e.target.value)}
                />
                <span>Nombre del perfil</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <button className="btn btn-sm btn-outline sm:flex-none" onClick={handleCreateProfile}>
                Nuevo perfil
              </button>
              <button className="btn btn-sm btn-outline sm:flex-none" onClick={handleDuplicateProfile}>
                Duplicar
              </button>
              <button className="btn btn-sm btn-ghost sm:flex-none" onClick={handleDeleteProfile}>
                Eliminar
              </button>
            </div>
          </div>

          {/* Tabs arriba */}
          <div className="mb-4 shrink-0">
            <div role="tablist" className="tabs tabs-box w-full overflow-x-auto">
              <button
                role="tab"
                className={`tab shrink-0 ${activeTab === "cv" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("cv")}
              >
                Formulario CV
              </button>

              <button
                role="tab"
                className={`tab shrink-0 ${activeTab === "platilla" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("platilla")}
              >
                Plantilla
              </button>
            </div>
          </div>

            {activeTab === "cv" && (
          <div className="grid gap-4 lg:grid-cols-12 lg:h-[calc(100vh-230px)] lg:min-h-0 lg:overflow-hidden">
            {/* LEFT: Form (SCROLL AQUÍ) */}
            <div className="min-h-0 lg:col-span-7 lg:overflow-y-auto lg:pr-2">
              <div className="space-y-4">
                {/* Datos personales */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body p-4 sm:p-6">
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
                  <div className="card-body p-4 sm:p-6">
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
                  <div className="card-body p-4 sm:p-6">
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
                  <div className="card-body p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="card-title">Experiencia</h2>
                      <button
                        className="btn btn-sm btn-outline w-full sm:w-auto"
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
                        <div key={i} className="rounded-lg border border-base-300 p-3 sm:rounded-2xl sm:p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold">Experiencia #{i + 1}</div>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => removeItem("experiencia", i)}
                            >
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
                                onChange={(e) =>
                                  updateArrayItem("experiencia", i, "actualmente", e.target.checked)
                                }
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

                {/* Educación */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="card-title">Educación</h2>
                      <button
                        className="btn btn-sm btn-outline w-full sm:w-auto"
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
                        <div key={i} className="rounded-lg border border-base-300 p-3 sm:rounded-2xl sm:p-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold">Educación #{i + 1}</div>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => removeItem("educacion", i)}
                            >
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
                                onChange={(e) =>
                                  updateArrayItem("educacion", i, "institucion", e.target.value)
                                }
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
                              onChange={(e) =>
                                updateArrayItem("educacion", i, "detalles", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: JSON Preview (fijo) */}
            <div className="min-h-0 lg:col-span-5 lg:overflow-hidden">
              <div className="flex min-h-0 flex-col gap-4 lg:h-full">
                <div className="card bg-base-100 shadow lg:min-h-0 lg:flex-1 lg:overflow-hidden">
                  <div className="card-body lg:h-full lg:min-h-0 lg:overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">Preview JSON</h3>
                      <div className="badge badge-ghost">Autosave</div>
                    </div>

                    <pre className="mt-3 max-h-80 min-h-0 p-3 rounded-xl bg-base-200 text-xs overflow-auto border border-base-300 lg:max-h-none lg:flex-1">
                      {jsonPreview}
                    </pre>
                  </div>
                </div>

                <SpellChecker
                  data={cvData}
                  onApply={(issue) => setValueAtPath(issue.path, issue.nextValue)}
                />

                <div className="alert alert-info">
                  <span className="text-sm">
                    Tip: usa logros con números (tiempo ahorrado, % reducción, # reportes, etc.).
                  </span>
                </div>
              </div>
            </div>
          </div>
            )}
            {activeTab === "platilla" && (
              <StyleCV
                value={cvData.templateStyle}
                data={cvData}
                onChange={(templateStyle) =>
                  setCvData((prev) => ({
                    ...prev,
                    templateStyle: normalizeCvStyleId(templateStyle),
                  }))
                }
                onDataChange={setCvData}
              />
            )}
          {/* Modal preview */}
          {openPreview && <CvPreview data={cvData} onClose={() => setOpenPreview(false)} />}
        </div>
      </div>
    </div>
  );
}
