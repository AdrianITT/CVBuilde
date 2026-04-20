const TYPO_RULES = [
  ["ocacionar", "ocasionar"],
  ["ocacion", "ocasion"],
  ["ocaciones", "ocasiones"],
  ["luesgo", "luego"],
  ["platilla", "plantilla"],
  ["plantia", "plantilla"],
  ["nuestre", "muestre"],
  ["desarollador", "desarrollador"],
  ["desarollo", "desarrollo"],
  ["responsavilidad", "responsabilidad"],
  ["responsavilidades", "responsabilidades"],
  ["tecnolojia", "tecnologia"],
  ["javacript", "JavaScript"],
  ["javascrip", "JavaScript"],
  ["typscript", "TypeScript"],
  ["phyton", "Python"],
  ["postgress", "Postgres"],
  ["posgresql", "PostgreSQL"],
  ["liderasgo", "liderazgo"],
  ["comunicacionn", "comunicacion"],
  ["colavoracion", "colaboracion"],
];

const FIELD_LABELS = {
  resumen: "Resumen",
  personal: "Datos personales",
  experiencia: "Experiencia",
  educacion: "Educacion",
  logros: "Logros",
  skills: "Skills",
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withCase(original, replacement) {
  if (original.toUpperCase() === original) return replacement.toUpperCase();
  if (original[0]?.toUpperCase() === original[0]) {
    return `${replacement[0]?.toUpperCase() ?? ""}${replacement.slice(1)}`;
  }
  return replacement;
}

function replaceFirstWord(value, wrong, replacement) {
  const pattern = new RegExp(`\\b${escapeRegExp(wrong)}\\b`, "i");
  const match = value.match(pattern);
  if (!match) return value;
  return value.replace(pattern, withCase(match[0], replacement));
}

function getFieldLabel(path) {
  if (!path.length) return "CV";
  const root = FIELD_LABELS[path[0]] ?? path[0];
  const index = typeof path[1] === "number" ? ` #${path[1] + 1}` : "";
  const child = FIELD_LABELS[path[2]] ?? path[2] ?? "";
  return child ? `${root}${index} / ${child}` : `${root}${index}`;
}

function collectTextFields(data) {
  const fields = [
    { path: ["resumen"], value: data?.resumen },
    { path: ["personal", "ciudadEstado"], value: data?.personal?.ciudadEstado },
  ];

  (Array.isArray(data?.experiencia) ? data.experiencia : []).forEach((exp, index) => {
    fields.push(
      { path: ["experiencia", index, "puesto"], value: exp.puesto },
      { path: ["experiencia", index, "empresa"], value: exp.empresa },
      { path: ["experiencia", index, "ciudad"], value: exp.ciudad }
    );

    (Array.isArray(exp.logros) ? exp.logros : []).forEach((logro, logroIndex) => {
      fields.push({ path: ["experiencia", index, "logros", logroIndex], value: logro });
    });
  });

  (Array.isArray(data?.educacion) ? data.educacion : []).forEach((edu, index) => {
    fields.push(
      { path: ["educacion", index, "grado"], value: edu.grado },
      { path: ["educacion", index, "institucion"], value: edu.institucion },
      { path: ["educacion", index, "ciudad"], value: edu.ciudad },
      { path: ["educacion", index, "detalles"], value: edu.detalles }
    );
  });

  (Array.isArray(data?.skills) ? data.skills : []).forEach((skill, index) => {
    fields.push({ path: ["skills", index, "nombre"], value: skill.nombre });
  });

  return fields.filter((field) => typeof field.value === "string" && field.value.trim());
}

function repeatedWordsIssue(field) {
  const repeatedPattern = /\b([\p{L}\p{M}]+)\s+\1\b/iu;
  const match = field.value.match(repeatedPattern);
  if (!match) return null;

  return {
    id: `${field.path.join(".")}-repeat-${match.index}`,
    path: field.path,
    field: getFieldLabel(field.path),
    found: match[0],
    suggestion: match[1],
    reason: "Palabra repetida",
    nextValue: field.value.replace(repeatedPattern, match[1]),
  };
}

function typoIssues(field) {
  return TYPO_RULES.flatMap(([wrong, replacement]) => {
    const pattern = new RegExp(`\\b${escapeRegExp(wrong)}\\b`, "i");
    const match = field.value.match(pattern);
    if (!match) return [];

    return [
      {
        id: `${field.path.join(".")}-${wrong}-${match.index}`,
        path: field.path,
        field: getFieldLabel(field.path),
        found: match[0],
        suggestion: withCase(match[0], replacement),
        reason: "Posible error ortografico",
        nextValue: replaceFirstWord(field.value, wrong, replacement),
      },
    ];
  });
}

function findIssues(data) {
  const issues = [];

  collectTextFields(data).forEach((field) => {
    const repeated = repeatedWordsIssue(field);
    if (repeated) issues.push(repeated);
    issues.push(...typoIssues(field));
  });

  return issues.slice(0, 8);
}

export default function SpellChecker({ data, onApply }) {
  const issues = findIssues(data);

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Corrector ortografico</h3>
            <p className="text-xs opacity-60">Revisa errores comunes y palabras repetidas dentro del CV.</p>
          </div>
          <div className={`badge ${issues.length ? "badge-warning" : "badge-success"}`}>
            {issues.length ? `${issues.length} alerta${issues.length === 1 ? "" : "s"}` : "OK"}
          </div>
        </div>

        {issues.length ? (
          <div className="grid gap-2">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-base-300 p-3">
                <div className="text-xs font-semibold opacity-70">{issue.field}</div>
                <div className="mt-1 text-sm">
                  <span className="font-semibold">{issue.found}</span>
                  <span className="opacity-60">{" -> "}</span>
                  <span className="font-semibold text-success">{issue.suggestion}</span>
                </div>
                <div className="mt-1 text-xs opacity-60">{issue.reason}</div>
                <button className="btn btn-xs btn-outline mt-2" onClick={() => onApply?.(issue)}>
                  Aplicar sugerencia
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm opacity-70">
            No encontre errores comunes en los campos principales.
          </div>
        )}
      </div>
    </div>
  );
}
