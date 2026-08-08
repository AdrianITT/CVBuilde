// useCvProfiles.js
// Encapsula TODO el estado de los perfiles del CV: datos, perfiles múltiples,
// autosave (con debounce), import/export y los handlers de edición.
// Mantiene App.jsx enfocado solo en el render.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROFILE_FALLBACK_NAME,
  PROFILES_BACKUP_KEY,
  PROFILES_STORAGE_KEY,
  STORAGE_KEY,
  createCvProfile,
  duplicateArrayItem,
  initialCV,
  loadProfilesState,
  moveArrayItem,
  normalizeCv,
  normalizeProfile,
} from "../lib/cvModel.js";

const AUTOSAVE_DELAY = 500; // ms — evita escribir localStorage en cada tecla

function updateValueAtPath(target, path, value) {
  const update = (currentTarget, segments) => {
    const [segment, ...rest] = segments;
    if (segment === undefined) return value;

    const nextTarget = Array.isArray(currentTarget) ? [...currentTarget] : { ...currentTarget };
    nextTarget[segment] = update(nextTarget[segment], rest);
    return nextTarget;
  };

  return update(target, path);
}

export function useCvProfiles(notify = () => {}) {
  const [initialProfilesState] = useState(loadProfilesState);
  const [cvData, setCvData] = useState(initialProfilesState.cvData);
  const [profiles, setProfiles] = useState(initialProfilesState.profiles);
  const [activeProfileId, setActiveProfileId] = useState(initialProfilesState.activeProfileId);
  const [profileName, setProfileName] = useState(initialProfilesState.profileName);
  const [storageWarning, setStorageWarning] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  // [ux-fix] Estado visible del autosave: el usuario no tenía forma de saber
  // si sus cambios ya se habían guardado o seguían en el debounce.
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const saveTimer = useRef(null);

  // ===== Autosave con debounce =====
  useEffect(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const safeProfileName = profileName.trim() || PROFILE_FALLBACK_NAME;
        const storedProfiles = profiles.map((profile) =>
          profile.id === activeProfileId
            ? { ...profile, name: safeProfileName, updatedAt: new Date().toISOString(), data: cvData }
            : profile
        );

        localStorage.setItem(
          PROFILES_STORAGE_KEY,
          JSON.stringify({ version: 2, activeProfileId, profiles: storedProfiles })
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
        setStorageWarning("");
        setSaveStatus("saved");
      } catch (error) {
        console.error("Error guardando localStorage:", error);
        // [storage-fix] QuotaExceededError: avisar al usuario en vez de fallar en silencio
        const isQuota =
          error?.name === "QuotaExceededError" ||
          error?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
          error?.code === 22;
        setStorageWarning(
          isQuota
            ? "No se pudo guardar: almacenamiento lleno. Reduce el tamaño de las fotos o exporta tus perfiles a JSON como respaldo."
            : "No se pudieron guardar los cambios automáticamente. Exporta a JSON para no perder tu trabajo."
        );
        setSaveStatus("idle");
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(saveTimer.current);
  }, [activeProfileId, cvData, profileName, profiles]);

  // ===== Edición de campos =====
  const setPersonal = (field, value) => {
    setCvData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
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

  const moveItem = (key, index, direction) => {
    setCvData((prev) => ({ ...prev, [key]: moveArrayItem(prev[key], index, direction) }));
  };

  const duplicateItem = (key, index) => {
    setCvData((prev) => ({ ...prev, [key]: duplicateArrayItem(prev[key], index) }));
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

  // [speed-fix] Inserta una frase del banco de logros. Si el único logro
  // existente está vacío (caso típico de una experiencia recién creada), la
  // reemplaza en vez de dejar un "Logro #1" vacío encima de la sugerencia.
  const addLogroWithValue = (expIndex, value) => {
    setCvData((prev) => {
      const experiencia = [...prev.experiencia];
      const item = { ...experiencia[expIndex] };
      item.logros =
        item.logros.length === 1 && !item.logros[0].trim() ? [value] : [...item.logros, value];
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

  // ===== Gestión de perfiles =====
  const getProfilesWithCurrentData = (profileList = profiles) => {
    const safeProfileName = profileName.trim() || PROFILE_FALLBACK_NAME;

    return profileList.map((profile) =>
      profile.id === activeProfileId
        ? { ...profile, name: safeProfileName, updatedAt: new Date().toISOString(), data: cvData }
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
  };

  const handleDuplicateProfile = () => {
    const currentProfiles = getProfilesWithCurrentData();
    const nextProfile = createCvProfile(`${profileName.trim() || PROFILE_FALLBACK_NAME} copia`, cvData);

    setProfiles([...currentProfiles, nextProfile]);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
  };

  const requestDeleteProfile = () => {
    if (profiles.length <= 1) {
      notify("Debe existir al menos un perfil.", "warning");
      return;
    }
    setConfirmingDelete(true);
  };

  const cancelDeleteProfile = () => setConfirmingDelete(false);

  const confirmDeleteProfile = () => {
    const currentProfiles = getProfilesWithCurrentData();
    const remainingProfiles = currentProfiles.filter((profile) => profile.id !== activeProfileId);
    const nextProfile = remainingProfiles[0];

    setProfiles(remainingProfiles);
    setActiveProfileId(nextProfile.id);
    setProfileName(nextProfile.name);
    setCvData(nextProfile.data);
    setConfirmingDelete(false);
    notify("Perfil eliminado.", "success");
  };

  const handleResetCurrentProfile = () => {
    setCvData(normalizeCv(initialCV));
  };

  // ===== Correcciones del SpellChecker =====
  const setValueAtPath = (path, value) => {
    setCvData((prev) => updateValueAtPath(prev, path, value));
  };

  const applyIssues = (issues) => {
    setCvData((prev) =>
      issues.reduce((nextState, issue) => updateValueAtPath(nextState, issue.path, issue.nextValue), prev)
    );
  };

  // ===== Import / Export =====
  const handleExport = () => {
    const exportPayload = {
      app: "azgeneratecv",
      version: 2,
      activeProfileId,
      profiles: getProfilesWithCurrentData(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // [json-fix] Fecha en el nombre para no pisar exports anteriores sin darse cuenta.
    const today = new Date().toISOString().slice(0, 10);
    a.download = `cv-profiles-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportActiveProfile = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    // [json-fix] Exporta solo los datos del perfil activo (sin envoltorio de
    // perfiles): al reimportarlo entra por la rama "CV suelto" y se agrega
    // como un perfil nuevo, sin disparar la confirmación de reemplazo total.
    const safeName =
      (profileName.trim() || PROFILE_FALLBACK_NAME)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-+|-+$)/g, "") || "perfil";
    // Evita nombres redundantes como "cv-cv-principal" cuando el perfil ya empieza con "cv".
    const filenameBase = safeName.startsWith("cv") ? safeName : `cv-${safeName}`;
    a.download = `${filenameBase}-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = (file) => {
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      notify("Selecciona un archivo .json", "warning");
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

          // [import-fix] Este import reemplaza TODOS los perfiles actuales: se pide
          // confirmación en vez de sobrescribir en silencio (ver requestDeleteProfile).
          setPendingImport({ profiles: importedProfiles, activeProfileId: importedActiveProfileId });
        } else {
          const importedProfileName = file.name.replace(/\.json$/i, "").trim() || "CV importado";
          const importedProfile = createCvProfile(importedProfileName, parsed);
          const currentProfiles = getProfilesWithCurrentData();

          setProfiles([...currentProfiles, importedProfile]);
          setActiveProfileId(importedProfile.id);
          setProfileName(importedProfile.name);
          setCvData(importedProfile.data);
          notify("JSON importado correctamente", "success");
        }
      } catch (err) {
        console.error(err);
        notify("JSON inválido o corrupto", "error");
      }
    };
    reader.readAsText(file);
  };

  const cancelImportProfiles = () => setPendingImport(null);

  const confirmImportProfiles = () => {
    if (!pendingImport) return;

    // [import-fix] Respaldo de seguridad de los perfiles actuales antes de
    // reemplazarlos, por si el import fue un error.
    try {
      localStorage.setItem(
        PROFILES_BACKUP_KEY,
        JSON.stringify({
          backedUpAt: new Date().toISOString(),
          activeProfileId,
          profiles: getProfilesWithCurrentData(),
        })
      );
    } catch (error) {
      console.error("Error respaldando perfiles antes de importar:", error);
    }

    const importedActiveProfile =
      pendingImport.profiles.find((profile) => profile.id === pendingImport.activeProfileId) ??
      pendingImport.profiles[0];

    setProfiles(pendingImport.profiles);
    setActiveProfileId(pendingImport.activeProfileId);
    setProfileName(importedActiveProfile.name);
    setCvData(importedActiveProfile.data);
    setPendingImport(null);
    notify("JSON importado correctamente. Tus perfiles anteriores quedaron respaldados.", "success");
  };

  const jsonPreview = useMemo(() => JSON.stringify(cvData, null, 2), [cvData]);

  return {
    // estado
    cvData,
    setCvData,
    profiles,
    activeProfileId,
    profileName,
    storageWarning,
    setStorageWarning,
    confirmingDelete,
    saveStatus,
    jsonPreview,
    // edición de campos
    setPersonal,
    updateArrayItem,
    addItem,
    removeItem,
    moveItem,
    duplicateItem,
    updateLogro,
    addLogro,
    addLogroWithValue,
    removeLogro,
    // perfiles
    handleProfileNameChange,
    handleSelectProfile,
    handleCreateProfile,
    handleDuplicateProfile,
    requestDeleteProfile,
    confirmDeleteProfile,
    cancelDeleteProfile,
    handleResetCurrentProfile,
    // spellchecker
    setValueAtPath,
    applyIssues,
    // import/export
    handleExport,
    handleExportActiveProfile,
    handleImportJsonFile,
    pendingImport,
    confirmImportProfiles,
    cancelImportProfiles,
  };
}
