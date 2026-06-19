import { useMemo, useState } from "react";

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
  ["desarollando", "desarrollando"],
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
  ["optimizacionn", "optimizacion"],
  ["automatizacoin", "automatizacion"],
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

function replaceFirstMatch(value, pattern, replacer) {
  const match = value.match(pattern);
  if (!match) return value;
  return value.replace(pattern, typeof replacer === "function" ? replacer(match) : replacer);
}

function buildSnippet(value, found) {
  if (!value || !found) return "";
  const normalizedValue = String(value);
  const index = normalizedValue.toLowerCase().indexOf(String(found).toLowerCase());
  if (index === -1) return normalizedValue.slice(0, 90);

  const start = Math.max(0, index - 22);
  const end = Math.min(normalizedValue.length, index + String(found).length + 28);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < normalizedValue.length ? "..." : "";
  return `${prefix}${normalizedValue.slice(start, end)}${suffix}`;
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

function createIssue(field, idSuffix, found, suggestion, reason, nextValue, tone = "warning") {
  return {
    id: `${field.path.join(".")}-${idSuffix}`,
    path: field.path,
    field: getFieldLabel(field.path),
    found,
    suggestion,
    reason,
    nextValue,
    snippet: buildSnippet(field.value, found),
    tone,
  };
}

function repeatedWordsIssue(field) {
  const repeatedPattern = /\b([\p{L}\p{M}]+)\s+\1\b/iu;
  const match = field.value.match(repeatedPattern);
  if (!match) return null;

  return createIssue(
    field,
    `repeat-${match.index}`,
    match[0],
    match[1],
    "Palabra repetida",
    field.value.replace(repeatedPattern, match[1]),
    "warning"
  );
}

function doubleSpacesIssue(field) {
  const pattern = / {2,}/;
  const match = field.value.match(pattern);
  if (!match) return null;

  return createIssue(
    field,
    `double-space-${match.index}`,
    "Espacios dobles",
    "Un solo espacio",
    "Hay espacios extra que se pueden limpiar.",
    replaceFirstMatch(field.value, pattern, " "),
    "neutral"
  );
}

function spaceBeforePunctuationIssue(field) {
  const pattern = /\s+([,.;:!?])/;
  const match = field.value.match(pattern);
  if (!match) return null;

  return createIssue(
    field,
    `punctuation-${match.index}`,
    match[0],
    match[1],
    "Hay un espacio antes del signo de puntuacion.",
    replaceFirstMatch(field.value, pattern, "$1"),
    "neutral"
  );
}

function typoIssues(field) {
  return TYPO_RULES.flatMap(([wrong, replacement]) => {
    const pattern = new RegExp(`\\b${escapeRegExp(wrong)}\\b`, "i");
    const match = field.value.match(pattern);
    if (!match) return [];

    return [
      createIssue(
        field,
        `${wrong}-${match.index}`,
        match[0],
        withCase(match[0], replacement),
        "Posible error ortografico",
        replaceFirstMatch(field.value, pattern, (foundMatch) => withCase(foundMatch[0], replacement)),
        "warning"
      ),
    ];
  });
}

function dedupeIssues(issues) {
  const seen = new Set();

  return issues.filter((issue) => {
    const key = `${issue.path.join(".")}|${issue.found}|${issue.suggestion}|${issue.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findIssues(data) {
  const issues = [];

  collectTextFields(data).forEach((field) => {
    const repeated = repeatedWordsIssue(field);
    const doubleSpaces = doubleSpacesIssue(field);
    const punctuation = spaceBeforePunctuationIssue(field);

    if (repeated) issues.push(repeated);
    if (doubleSpaces) issues.push(doubleSpaces);
    if (punctuation) issues.push(punctuation);
    issues.push(...typoIssues(field));
  });

  return dedupeIssues(issues).slice(0, 10);
}

function IssueBadge({ tone }) {
  const badgeClass =
    tone === "warning" ? "badge-warning" : tone === "neutral" ? "badge-ghost" : "badge-success";
  const label = tone === "warning" ? "Revision" : tone === "neutral" ? "Formato" : "OK";

  return <span className={`badge badge-sm ${badgeClass}`}>{label}</span>;
}

export default function SpellChecker({ data, onApply, onApplyAll }) {
  const allIssues = useMemo(() => findIssues(data), [data]);
  const dataFingerprint = useMemo(() => allIssues.map((issue) => issue.id).join("|"), [allIssues]);
  const [dismissedState, setDismissedState] = useState({ fingerprint: "", ids: [] });
  const dismissedIds = dismissedState.fingerprint === dataFingerprint ? dismissedState.ids : [];
  const visibleIssues = allIssues.filter((issue) => !dismissedIds.includes(issue.id));

  const dismissIssue = (issueId) => {
    setDismissedState((prev) => ({
      fingerprint: dataFingerprint,
      ids: prev.fingerprint === dataFingerprint ? [...prev.ids, issueId] : [issueId],
    }));
  };

  const applyIssue = (issue) => {
    onApply?.(issue);
    dismissIssue(issue.id);
  };

  const applyAllIssues = () => {
    if (!visibleIssues.length) return;
    onApplyAll?.(visibleIssues);
    setDismissedState({
      fingerprint: dataFingerprint,
      ids: [...dismissedIds, ...visibleIssues.map((issue) => issue.id)],
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body gap-3 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold">Asistente de ortografia</h3>
            <p className="text-xs opacity-60">
              Marca errores frecuentes, repeticiones y detalles de formato para que el CV se vea mas limpio.
            </p>
          </div>
          <div className={`badge ${visibleIssues.length ? "badge-warning" : "badge-success"}`}>
            {visibleIssues.length ? `${visibleIssues.length} pendiente${visibleIssues.length === 1 ? "" : "s"}` : "Todo bien"}
          </div>
        </div>

        {visibleIssues.length ? (
          <>
            <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm">
              Encontre algunos detalles que puedes corregir en un clic. Las sugerencias son suaves para evitar falsos
              positivos y priorizan claridad antes que rigidez.
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm btn-primary w-full sm:w-auto" onClick={applyAllIssues}>
                Aplicar todo
              </button>
              <button
                className="btn btn-sm btn-ghost w-full sm:w-auto"
                onClick={() =>
                  setDismissedState({
                    fingerprint: dataFingerprint,
                    ids: allIssues.map((issue) => issue.id),
                  })
                }
              >
                Ocultar sugerencias
              </button>
            </div>

            <div className="grid gap-2">
              {visibleIssues.map((issue) => (
                <div key={issue.id} className="rounded-lg border border-base-300 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-xs font-semibold opacity-70">{issue.field}</div>
                    <IssueBadge tone={issue.tone} />
                  </div>

                  <div className="mt-2 text-sm break-words">
                    <span className="font-semibold">{issue.found}</span>
                    <span className="opacity-60"> {"->"} </span>
                    <span className="font-semibold text-success">{issue.suggestion}</span>
                  </div>

                  {issue.snippet ? (
                    <div className="mt-2 rounded-md bg-base-200 px-2 py-1 text-xs opacity-70 break-words">
                      {issue.snippet}
                    </div>
                  ) : null}

                  <div className="mt-2 text-xs opacity-60">{issue.reason}</div>

                  <div className="mt-3 grid gap-2 sm:flex">
                    <button className="btn btn-xs btn-outline w-full sm:w-auto" onClick={() => applyIssue(issue)}>
                      Aplicar sugerencia
                    </button>
                    <button className="btn btn-xs btn-ghost w-full sm:w-auto" onClick={() => dismissIssue(issue.id)}>
                      Ignorar por ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm opacity-70">
            No encontre errores comunes en los campos principales. El texto ya se ve bastante limpio.
          </div>
        )}
      </div>
    </div>
  );
}
