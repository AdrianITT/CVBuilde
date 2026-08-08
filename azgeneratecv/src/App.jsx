// App.jsx
import { lazy, Suspense, useDeferredValue, useState } from "react";
import "./App.css";
import CardSkill from "./componets/CardSkill.jsx";
import ConfirmModal from "./componets/ConfirmModal.jsx";
import SpellChecker from "./componets/SpellChecker.jsx";
import StyleCV, { CvDocument } from "./componets/StyleCV.jsx";
import Toasts from "./componets/Toasts.jsx";
import { getCvCss } from "./lib/cvCss.js";
import { normalizeCvStyleId } from "./lib/cvStyles.js";
import EducationForm from "./componets/form/EducationForm.jsx";
import ExperienceForm from "./componets/form/ExperienceForm.jsx";
import PersonalForm from "./componets/form/PersonalForm.jsx";
import SummaryForm from "./componets/form/SummaryForm.jsx";
import { useCvProfiles } from "./hook/useCvProfiles.js";
import { useToasts } from "./hook/useToasts.js";

// [react-best-practices: bundle-dynamic-imports] CvPreview solo se carga al abrir el modal
const CvPreview = lazy(() => import("./componets/CvPreview.jsx"));

const fileInputId = "cv-json-import";

// El CSS del CV es idéntico para todos los estilos (las variables de color/fuente
// vienen inline desde CvDocument). Se calcula UNA vez y se inyecta una sola vez,
// en vez de repetir ~300 líneas de CSS en cada preview del DOM.
const CV_CSS = getCvCss();

export default function App() {
  const [openPreview, setOpenPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("cv");

  const { toasts, notify, dismiss } = useToasts();

  const {
    cvData,
    setCvData,
    profiles,
    activeProfileId,
    profileName,
    storageWarning,
    setStorageWarning,
    confirmingDelete,
    jsonPreview,
    setPersonal,
    updateArrayItem,
    addItem,
    removeItem,
    updateLogro,
    addLogro,
    removeLogro,
    handleProfileNameChange,
    handleSelectProfile,
    handleCreateProfile,
    handleDuplicateProfile,
    requestDeleteProfile,
    confirmDeleteProfile,
    cancelDeleteProfile,
    handleResetCurrentProfile,
    setValueAtPath,
    applyIssues,
    handleExport,
    handleImportJsonFile,
  } = useCvProfiles(notify);

  // [react-best-practices: rerender-use-deferred-value] El preview usa un valor
  // diferido para que el input no se sienta lento mientras se re-renderiza el CV.
  const deferredCvData = useDeferredValue(cvData);

  // Al crear un perfil nuevo, volver al formulario
  const createProfileAndFocusForm = () => {
    handleCreateProfile();
    setActiveTab("cv");
  };

  return (
    <div lang="es" spellCheck="true" className="h-screen bg-base-200 flex flex-col overflow-hidden">
      {/* CSS del CV inyectado una sola vez para todos los previews */}
      <style>{CV_CSS}</style>

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

          {/* [storage-fix] Aviso si el autosave falla (cuota llena, etc.) */}
          {storageWarning ? (
            <div role="alert" className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="text-sm">{storageWarning}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setStorageWarning("")}>
                Ocultar
              </button>
            </div>
          ) : null}

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
              <button className="btn btn-sm btn-outline sm:flex-none" onClick={createProfileAndFocusForm}>
                Nuevo perfil
              </button>
              <button className="btn btn-sm btn-outline sm:flex-none" onClick={handleDuplicateProfile}>
                Duplicar
              </button>
              <button className="btn btn-sm btn-ghost sm:flex-none" onClick={requestDeleteProfile}>
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
            {/* LEFT: Formulario */}
            <div className="min-h-0 lg:col-span-5 lg:overflow-y-auto lg:pr-2">
              <div className="space-y-4">
                <PersonalForm personal={cvData.personal} setPersonal={setPersonal} />

                <SummaryForm
                  value={cvData.resumen}
                  onChange={(value) => setCvData((p) => ({ ...p, resumen: value }))}
                />

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

                <ExperienceForm
                  items={cvData.experiencia}
                  addItem={addItem}
                  removeItem={removeItem}
                  updateArrayItem={updateArrayItem}
                  updateLogro={updateLogro}
                  addLogro={addLogro}
                  removeLogro={removeLogro}
                />

                <EducationForm
                  items={cvData.educacion}
                  addItem={addItem}
                  removeItem={removeItem}
                  updateArrayItem={updateArrayItem}
                />
              </div>
            </div>

            {/* RIGHT: Vista previa en vivo + herramientas */}
            <div className="min-h-0 lg:col-span-7 lg:overflow-y-auto lg:pr-2">
              <div className="space-y-4">

                {/* Vista previa en vivo */}
                <div className="card bg-base-100 shadow">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold">Vista previa en vivo</h3>
                        <p className="text-xs opacity-60">Se actualiza mientras escribes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="badge badge-success badge-sm">En vivo</span>
                      </div>
                    </div>
                    <div className="overflow-auto rounded-lg bg-base-300 p-2 sm:p-3">
                      <CvDocument data={deferredCvData} styleId={deferredCvData.templateStyle} paperId="cv-form-preview" />
                    </div>
                  </div>
                </div>

                {/* JSON Preview — colapsible */}
                <div className="collapse collapse-arrow bg-base-100 shadow rounded-2xl">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold text-sm">
                    <span className="flex items-center gap-2">
                      Preview JSON
                      <span className="badge badge-ghost badge-sm">Autosave</span>
                    </span>
                  </div>
                  <div className="collapse-content">
                    <pre className="json-pre mt-1 max-h-64 overflow-auto rounded-xl bg-base-200 p-3 text-xs border border-base-300">
                      {jsonPreview}
                    </pre>
                  </div>
                </div>

                <SpellChecker
                  data={cvData}
                  onApply={(issue) => setValueAtPath(issue.path, issue.nextValue)}
                  onApplyAll={applyIssues}
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
                notify={notify}
              />
            )}
          {/* [react-best-practices: rendering-conditional-render] ternary evita renders falsos */}
          {openPreview ? (
            <Suspense fallback={null}>
              <CvPreview data={cvData} onClose={() => setOpenPreview(false)} />
            </Suspense>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        open={confirmingDelete}
        title="Eliminar perfil"
        message={`¿Eliminar el perfil "${profileName.trim() || "CV Principal"}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDeleteProfile}
        onCancel={cancelDeleteProfile}
      />

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
