// cvStyles.js
// Catálogo de plantillas del CV y helpers de estilo. Datos puros, sin React.
export const DEFAULT_CV_STYLE_ID = "harvard";

export const CV_TEMPLATE_STYLES = [
  {
    id: "harvard",
    name: "Harvard",
    label: "Por defecto",
    description: "Clasico, ATS y sobrio para postulaciones formales.",
    accent: "#111827",
    soft: "#f3f4f6",
    font: "Arial, Helvetica, sans-serif",
    layout: "classic",
  },
  {
    id: "executive",
    name: "Ejecutivo",
    label: "Directivo",
    description: "Encabezado fuerte con separadores claros.",
    accent: "#0f766e",
    soft: "#ecfdf5",
    font: "Georgia, 'Times New Roman', serif",
    layout: "executive",
  },
  {
    id: "technical",
    name: "Tecnico",
    label: "Tech",
    description: "Columna lateral para skills y datos de contacto.",
    accent: "#2563eb",
    soft: "#eff6ff",
    font: "Arial, Helvetica, sans-serif",
    layout: "sidebar",
  },
  {
    id: "modern",
    name: "Moderno",
    label: "Actual",
    description: "Mas aire visual sin perder legibilidad en PDF.",
    accent: "#7c3aed",
    soft: "#f5f3ff",
    font: "'Segoe UI', Arial, Helvetica, sans-serif",
    layout: "modern",
  },
  {
    id: "compact",
    name: "Compacto",
    label: "Una pagina",
    description: "Denso y ordenado cuando hay mucha experiencia.",
    accent: "#b45309",
    soft: "#fffbeb",
    font: "Arial, Helvetica, sans-serif",
    layout: "compact",
  },
  {
    id: "photo",
    name: "Foto Profesional",
    label: "Con foto",
    description: "Perfil visual con foto, ideal para roles publicos o creativos.",
    accent: "#be123c",
    soft: "#fff1f2",
    font: "'Segoe UI', Arial, Helvetica, sans-serif",
    layout: "photo",
  },
];

export const DEFAULT_TEMPLATE_SETTINGS = {
  accentColor: "",
  fontScale: 1,
  lineHeight: 1.5,
  sectionSpacing: 12,
};

export function normalizeCvStyleId(styleId) {
  return CV_TEMPLATE_STYLES.some((style) => style.id === styleId) ? styleId : DEFAULT_CV_STYLE_ID;
}

export function getCvStyle(styleId) {
  const safeStyleId = normalizeCvStyleId(styleId);
  return CV_TEMPLATE_STYLES.find((style) => style.id === safeStyleId) ?? CV_TEMPLATE_STYLES[0];
}

export function getTemplateSettings(data, styleId) {
  const settings = data?.templateSettings?.[styleId] ?? {};
  return {
    ...DEFAULT_TEMPLATE_SETTINGS,
    ...settings,
  };
}

export function getStyleAccent(style, settings) {
  return settings.accentColor || style.accent;
}

export function getSoftColor(accentColor) {
  if (!accentColor || !accentColor.startsWith("#") || ![4, 7].includes(accentColor.length)) return "#f3f4f6";

  const normalized =
    accentColor.length === 4
      ? `#${accentColor[1]}${accentColor[1]}${accentColor[2]}${accentColor[2]}${accentColor[3]}${accentColor[3]}`
      : accentColor;
  const hex = normalized.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (channel) => Math.round(channel * 0.12 + 255 * 0.88);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
