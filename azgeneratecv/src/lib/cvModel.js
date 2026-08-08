// cvModel.js
// Modelo de datos del CV: forma inicial, normalización y perfiles.
// Funciones puras (sin React) — fáciles de testear de forma aislada.
import { DEFAULT_CV_STYLE_ID, normalizeCvStyleId } from "./cvStyles.js";

export const STORAGE_KEY = "cv_v1";
export const PROFILES_STORAGE_KEY = "cv_profiles_v1";
export const PROFILES_BACKUP_KEY = "cv_profiles_backup_v1";
export const PROFILE_FALLBACK_NAME = "CV Principal";

export const initialCV = {
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

export const makeId = () => crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`;

// Mueve un elemento del array una posición (direction: -1 arriba, +1 abajo).
// Sin efecto si el destino queda fuera de rango.
export function moveArrayItem(array, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= array.length) return array;

  const next = [...array];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

// Inserta una copia profunda del elemento justo después del original.
export function duplicateArrayItem(array, index) {
  if (index < 0 || index >= array.length) return array;

  const next = [...array];
  next.splice(index + 1, 0, JSON.parse(JSON.stringify(array[index])));
  return next;
}

export function normalizeCv(raw) {
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

export function createCvProfile(name, data = initialCV) {
  return {
    id: makeId(),
    name: name?.trim() || PROFILE_FALLBACK_NAME,
    updatedAt: new Date().toISOString(),
    data: normalizeCv(data),
  };
}

export function normalizeProfile(raw, index = 0) {
  const fallbackName = index === 0 ? PROFILE_FALLBACK_NAME : `CV ${index + 1}`;
  const sourceData = raw?.data ?? raw?.cvData ?? raw ?? initialCV;

  return {
    id: String(raw?.id || makeId()),
    name: String(raw?.name || fallbackName),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
    data: normalizeCv(sourceData),
  };
}

export function loadProfilesState() {
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
    const legacyCv = savedLegacyCv ? normalizeCv(JSON.parse(savedLegacyCv)) : initialCV;
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
