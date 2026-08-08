// useCvProfiles.js
// Encapsula TODO el estado de los perfiles del CV: datos, perfiles múltiples,
// autosave (con debounce), import/export y los handlers de edición.
// Mantiene App.jsx enfocado solo en el render.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROFILE_FALLBACK_NAME,
  PROFILES_STORAGE_KEY,
  STORAGE_KEY,
  createCvProfile,
  initialCV,
  loadProfilesState,
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
  const saveTimer = useRef(null);

  // ===== Autosave con debounce =====
  useEffect(() => {
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
    a.download = "cv-profiles.json";
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

        notify("JSON importado correctamente", "success");
      } catch (err) {
        console.error(err);
        notify("JSON inválido o corrupto", "error");
      }
    };
    reader.readAsText(file);
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
    jsonPreview,
    // edición de campos
    setPersonal,
    updateArrayItem,
    addItem,
    removeItem,
    updateLogro,
    addLogro,
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
    handleImportJsonFile,
  };
}
