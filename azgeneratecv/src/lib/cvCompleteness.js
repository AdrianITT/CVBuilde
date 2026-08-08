// cvCompleteness.js
// Calcula qué tan completo está el CV, para guiar al usuario sobre qué
// llenar primero. Función pura, sin React.

function hasText(value) {
  return Boolean(value && String(value).trim());
}

const CHECKS = [
  { key: "nombre", label: "Nombre completo", test: (cv) => hasText(cv?.personal?.nombreCompleto) },
  { key: "contacto", label: "Correo o teléfono", test: (cv) => hasText(cv?.personal?.correo) || hasText(cv?.personal?.telefono) },
  { key: "resumen", label: "Resumen profesional", test: (cv) => hasText(cv?.resumen) },
  { key: "skills", label: "Al menos una skill", test: (cv) => (Array.isArray(cv?.skills) ? cv.skills : []).some((s) => hasText(s?.nombre)) },
  {
    key: "experiencia",
    label: "Una experiencia con puesto y empresa",
    test: (cv) => (Array.isArray(cv?.experiencia) ? cv.experiencia : []).some((e) => hasText(e?.puesto) && hasText(e?.empresa)),
  },
  {
    key: "educacion",
    label: "Una educación con grado e institución",
    test: (cv) => (Array.isArray(cv?.educacion) ? cv.educacion : []).some((e) => hasText(e?.grado) && hasText(e?.institucion)),
  },
];

export function getCvCompleteness(cvData) {
  const checks = CHECKS.map(({ key, label, test }) => ({ key, label, done: test(cvData) }));
  const doneCount = checks.filter((c) => c.done).length;

  return {
    checks,
    doneCount,
    total: checks.length,
    percent: Math.round((doneCount / checks.length) * 100),
  };
}
