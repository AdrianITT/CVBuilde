import React, { memo } from "react";
import {
  CV_TEMPLATE_STYLES,
  getCvStyle,
  getSoftColor,
  getStyleAccent,
  getTemplateSettings,
  normalizeCvStyleId,
} from "../lib/cvStyles.js";

const SECTION_LABELS = {
  resumen: "Resumen",
  skills: "Skills",
  experiencia: "Experiencia",
  educacion: "Educacion",
};

const skillBuckets = {
  Languages: ["javascript", "typescript", "python", "java", "c#", "c++", "go", "php", "ruby"],
  Frameworks: ["react", "next", "django", "flask", "express", "vue", "angular", ".net", "spring", "laravel"],
  Tools: ["git", "docker", "aws", "linux", "mysql", "postgres", "sql", "vite", "webpack", "figma", "postman", "node"],
};

function formatMes(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthNumber = parseInt(month, 10);
  if (!monthNumber) return value;
  return `${meses[monthNumber - 1]} ${year}`;
}

function cleanItems(items) {
  return items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
}

function groupSkills(skills) {
  const buckets = {
    Languages: [],
    Frameworks: [],
    Tools: [],
    Other: [],
  };

  skills
    .filter((skill) => (skill?.nombre ?? "").trim())
    .filter((skill) => (skill.nombre ?? "").trim().length <= 40)
    .forEach((skill) => {
      const normalizedName = skill.nombre.toLowerCase();
      const label = `${skill.nombre}${skill.nivel ? ` (${skill.nivel})` : ""}`;
      const bucketName =
        Object.entries(skillBuckets).find(([, keywords]) =>
          keywords.some((keyword) => normalizedName.includes(keyword))
        )?.[0] ?? "Other";

      buckets[bucketName].push(label);
    });

  return Object.entries(buckets).filter(([, values]) => values.length);
}

function ContactLine({ personal }) {
  const items = cleanItems([
    personal.ciudadEstado,
    personal.telefono,
    personal.correo,
    personal.linkedin ? `LinkedIn: ${personal.linkedin}` : "",
    personal.github ? `GitHub: ${personal.github}` : "",
    personal.web ? `Web: ${personal.web}` : "",
  ]);

  if (!items.length) return null;

  return (
    <div className="az-cv-contact">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function Section({ title, children, className = "" }) {
  if (!children) return null;

  return (
    <section className={`az-cv-section ${className}`}>
      <div className="az-cv-section-title">{title}</div>
      {children}
    </section>
  );
}

function Summary({ data }) {
  if (!data?.resumen?.trim()) return null;
  return (
    <Section title={SECTION_LABELS.resumen} className="az-cv-avoid-break">
      <div className="az-cv-text">{data.resumen}</div>
    </Section>
  );
}

function Skills({ skills = [], mode = "rows" }) {
  const rows = groupSkills(Array.isArray(skills) ? skills : []);
  if (!rows.length) return null;

  if (mode === "chips") {
    return (
      <Section title={SECTION_LABELS.skills} className="az-cv-avoid-break">
        <div className="az-cv-skill-chips">
          {rows.flatMap(([, values]) => values).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section title={SECTION_LABELS.skills} className="az-cv-avoid-break">
      <div className="az-cv-skills-grid">
        {rows.map(([title, values]) => (
          <React.Fragment key={title}>
            <div className="az-cv-skills-label">{title}:</div>
            <div className="az-cv-skills-items">{values.join(" | ")}</div>
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
}

function Experience({ experiencia = [] }) {
  const items = Array.isArray(experiencia) ? experiencia : [];
  if (!items.length) return null;

  return (
    <Section title={SECTION_LABELS.experiencia}>
      <div className="az-cv-items">
        {items.map((exp, idx) => {
          const inicio = formatMes(exp.fechaInicio);
          const fin = exp.actualmente ? "Actual" : formatMes(exp.fechaFin);
          const isEmpty = !exp.puesto?.trim() && !exp.empresa?.trim() && !exp.ciudad?.trim() && !inicio && !fin;
          if (isEmpty) return null;

          const title = `${exp.puesto || "Puesto"}${exp.empresa ? `, ${exp.empresa}` : ""}`;
          const place = exp.ciudad?.trim() ? exp.ciudad : "";
          const achievements = Array.isArray(exp.logros) ? exp.logros.filter((logro) => logro.trim()) : [];

          return (
            <div key={idx} className="az-cv-item az-cv-avoid-break">
              <div className="az-cv-row">
                <div className="az-cv-left">
                  <div className="az-cv-role">{title}</div>
                  {place ? <div className="az-cv-sub">{place}</div> : null}
                </div>
                <div className="az-cv-date">{inicio || fin ? `${inicio} - ${fin}` : ""}</div>
              </div>

              {achievements.length ? (
                <ul className="az-cv-bullets">
                  {achievements.map((achievement, index) => (
                    <li key={`${idx}-${index}`}>{achievement}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Education({ educacion = [] }) {
  const items = Array.isArray(educacion) ? educacion : [];
  if (!items.length) return null;

  return (
    <Section title={SECTION_LABELS.educacion}>
      <div className="az-cv-items">
        {items.map((edu, idx) => {
          const inicio = formatMes(edu.fechaInicio);
          const fin = formatMes(edu.fechaFin);
          const isEmpty =
            !edu.grado?.trim() &&
            !edu.institucion?.trim() &&
            !edu.ciudad?.trim() &&
            !inicio &&
            !fin &&
            !edu.detalles?.trim();

          if (isEmpty) return null;

          const title = `${edu.grado || "Grado"}${edu.institucion ? `, ${edu.institucion}` : ""}`;
          const place = edu.ciudad?.trim() ? edu.ciudad : "";

          return (
            <div key={idx} className="az-cv-item az-cv-avoid-break">
              <div className="az-cv-row">
                <div className="az-cv-left">
                  <div className="az-cv-role">{title}</div>
                  {place ? <div className="az-cv-sub">{place}</div> : null}
                </div>
                <div className="az-cv-date">{inicio || fin ? `${inicio} - ${fin}` : ""}</div>
              </div>
              {edu.detalles?.trim() ? <div className="az-cv-text az-cv-details">{edu.detalles}</div> : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ClassicLayout({ data }) {
  const personal = data?.personal ?? {};

  return (
    <>
      <header className="az-cv-header">
        <div className="az-cv-name">{personal.nombreCompleto || "Tu Nombre"}</div>
        <ContactLine personal={personal} />
      </header>
      <Summary data={data} />
      <Skills skills={data?.skills} />
      <Experience experiencia={data?.experiencia} />
      <Education educacion={data?.educacion} />
    </>
  );
}

function SidebarLayout({ data }) {
  const personal = data?.personal ?? {};

  return (
    <div className="az-cv-sidebar-layout">
      <aside className="az-cv-sidebar">
        <div className="az-cv-name">{personal.nombreCompleto || "Tu Nombre"}</div>
        <ContactLine personal={personal} />
        <Skills skills={data?.skills} mode="chips" />
      </aside>
      <main className="az-cv-main">
        <Summary data={data} />
        <Experience experiencia={data?.experiencia} />
        <Education educacion={data?.educacion} />
      </main>
    </div>
  );
}

function ModernLayout({ data }) {
  const personal = data?.personal ?? {};

  return (
    <>
      <header className="az-cv-modern-header">
        <div>
          <div className="az-cv-kicker">Curriculum Vitae</div>
          <div className="az-cv-name">{personal.nombreCompleto || "Tu Nombre"}</div>
        </div>
        <ContactLine personal={personal} />
      </header>
      <Summary data={data} />
      <Skills skills={data?.skills} mode="chips" />
      <Experience experiencia={data?.experiencia} />
      <Education educacion={data?.educacion} />
    </>
  );
}

function getInitials(name) {
  const parts = String(name || "Tu Nombre").trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CV";
}

function PhotoBlock({ personal }) {
  return (
    <div className="az-cv-photo-frame">
      {personal.foto ? (
        <img src={personal.foto} alt="Foto de perfil" />
      ) : (
        <span>{getInitials(personal.nombreCompleto)}</span>
      )}
    </div>
  );
}

function PhotoLayout({ data }) {
  const personal = data?.personal ?? {};

  return (
    <>
      <header className="az-cv-photo-header">
        <PhotoBlock personal={personal} />
        <div className="az-cv-photo-headline">
          <div className="az-cv-kicker">Perfil profesional</div>
          <div className="az-cv-name">{personal.nombreCompleto || "Tu Nombre"}</div>
          <ContactLine personal={personal} />
        </div>
      </header>
      <Summary data={data} />
      <Skills skills={data?.skills} mode="chips" />
      <Experience experiencia={data?.experiencia} />
      <Education educacion={data?.educacion} />
    </>
  );
}

// [react-best-practices: rerender-memo] Memoizado: combinado con useDeferredValue
// en el preview en vivo, evita re-renderizar todo el CV en cada tecla.
function CvDocumentImpl({ data, styleId, paperId = "cv-paper" }) {
  const style = getCvStyle(styleId ?? data?.templateStyle);
  const settings = getTemplateSettings(data, style.id);
  const accent = getStyleAccent(style, settings);
  const layout =
    style.layout === "sidebar" ? (
      <SidebarLayout data={data} />
    ) : style.layout === "modern" ? (
      <ModernLayout data={data} />
    ) : style.layout === "photo" ? (
      <PhotoLayout data={data} />
    ) : (
      <ClassicLayout data={data} />
    );

  return (
    <div
      id={paperId}
      className={`az-cv-paper az-cv-${style.id}`}
      style={{
        "--az-cv-accent": accent,
        "--az-cv-soft": settings.accentColor ? getSoftColor(accent) : style.soft,
        "--az-cv-font": style.font,
        "--az-cv-font-scale": settings.fontScale,
        "--az-cv-line-height": settings.lineHeight,
        "--az-cv-section-spacing": `${settings.sectionSpacing}px`,
      }}
    >
      {layout}
    </div>
  );
}

export const CvDocument = memo(CvDocumentImpl);

function TemplateCard({ template, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`card w-full bg-base-100 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(template.id)}
    >
      <div className="card-body gap-3 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <h3 className="card-title text-base leading-tight break-words">{template.name}</h3>
            <p className="text-sm opacity-70">{template.description}</p>
          </div>
          <span
            className={`badge h-auto min-h-6 max-w-full justify-self-start whitespace-normal px-2 py-1 text-center leading-tight sm:justify-self-end ${
              selected ? "badge-primary" : "badge-outline"
            }`}
          >
            {template.label}
          </span>
        </div>

        <div
          className="rounded-lg border border-base-300 bg-white p-3 text-black"
          style={{ borderTop: `5px solid ${template.accent}` }}
        >
          <div className="h-3 w-2/3 rounded-sm" style={{ background: template.accent }} />
          <div className="mt-3 grid gap-1.5">
            <div className="h-1.5 w-full rounded-sm bg-slate-300" />
            <div className="h-1.5 w-5/6 rounded-sm bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded-sm bg-slate-200" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-5 rounded-sm" style={{ background: template.soft }} />
            <div className="h-5 rounded-sm bg-slate-100" />
            <div className="h-5 rounded-sm bg-slate-100" />
          </div>
        </div>
      </div>
    </button>
  );
}

// [storage-fix] Redimensiona y comprime la foto antes de guardarla.
// Las fotos viven en localStorage como dataURL; sin comprimir una sola
// imagen puede ocupar varios MB y reventar la cuota (~5MB) del navegador.
const PHOTO_MAX_SIZE = 480; // px del lado mayor
const PHOTO_QUALITY = 0.82;

function compressImage(dataUrl, onDone) {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Fondo blanco para evitar que PNG transparente se vuelva negro en JPEG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    onDone(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
  };
  img.onerror = () => onDone(dataUrl); // si falla, usa el original
  img.src = dataUrl;
}

function readImageAsDataUrl(file, onDone, onError) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    onError?.("Selecciona una imagen válida.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => compressImage(String(reader.result ?? ""), onDone);
  reader.readAsDataURL(file);
}

export default function StyleCV({ value, onChange, data, onDataChange, notify = () => {} }) {
  const activeStyleId = normalizeCvStyleId(value);
  const activeStyle = getCvStyle(activeStyleId);
  const settings = getTemplateSettings(data, activeStyleId);

  const updateTemplateSetting = (field, fieldValue) => {
    onDataChange?.((prev) => ({
      ...prev,
      templateSettings: {
        ...(prev.templateSettings ?? {}),
        [activeStyleId]: {
          ...getTemplateSettings(prev, activeStyleId),
          [field]: fieldValue,
        },
      },
    }));
  };

  const resetTemplateSettings = () => {
    onDataChange?.((prev) => {
      const nextSettings = { ...(prev.templateSettings ?? {}) };
      delete nextSettings[activeStyleId];
      return { ...prev, templateSettings: nextSettings };
    });
  };

  const updatePhoto = (dataUrl) => {
    onDataChange?.((prev) => ({
      ...prev,
      personal: {
        ...(prev.personal ?? {}),
        foto: dataUrl,
      },
    }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:h-[calc(100vh-230px)] lg:min-h-0 lg:overflow-hidden">
      <div className="min-h-0 lg:col-span-5 lg:overflow-y-auto lg:pr-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3 p-4 sm:p-6">
            <div>
              <h2 className="card-title text-xl">Estilos de plantilla</h2>
              <p className="text-sm opacity-70">
                Harvard sigue como base por defecto. Elige otro estilo y se guardara en el perfil, el JSON y el PDF.
              </p>
            </div>

            <div className="max-h-[360px] overflow-y-auto pr-1 sm:max-h-[430px] lg:max-h-[38vh]">
              <div className="grid gap-3">
                {CV_TEMPLATE_STYLES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={template.id === activeStyleId}
                    onSelect={onChange}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">Configurador de UI</h3>
                <p className="text-xs opacity-70">Cambios en tiempo real solo para {activeStyle.name}.</p>
              </div>
              <button className="btn btn-xs btn-ghost w-full sm:w-auto" onClick={resetTemplateSettings}>
                Reset
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Color principal</span>
                <div className="grid grid-cols-[48px_1fr] gap-2">
                  <input
                    type="color"
                    className="input input-sm input-bordered h-9 w-full p-1"
                    value={settings.accentColor || activeStyle.accent}
                    onChange={(event) => updateTemplateSetting("accentColor", event.target.value)}
                  />
                  <input
                    className="input input-sm input-bordered"
                    value={settings.accentColor || activeStyle.accent}
                    onChange={(event) => updateTemplateSetting("accentColor", event.target.value)}
                  />
                </div>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium">Tamaño de fuente: {settings.fontScale.toFixed(2)}x</span>
                <input
                  type="range"
                  min="0.9"
                  max="1.18"
                  step="0.01"
                  className="range range-sm"
                  value={settings.fontScale}
                  onChange={(event) => updateTemplateSetting("fontScale", Number(event.target.value))}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium">Interlineado: {settings.lineHeight.toFixed(2)}</span>
                <input
                  type="range"
                  min="1.25"
                  max="1.85"
                  step="0.05"
                  className="range range-sm"
                  value={settings.lineHeight}
                  onChange={(event) => updateTemplateSetting("lineHeight", Number(event.target.value))}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium">Espaciado entre secciones: {settings.sectionSpacing}px</span>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  className="range range-sm"
                  value={settings.sectionSpacing}
                  onChange={(event) => updateTemplateSetting("sectionSpacing", Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">Foto de perfil</h3>
                <p className="text-xs opacity-70">Se usa en la plantilla Foto Profesional.</p>
              </div>
              {data?.personal?.foto ? (
                <button className="btn btn-xs btn-ghost" onClick={() => updatePhoto("")}>
                  Quitar
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[72px_1fr] sm:items-center">
              <PhotoBlock personal={data?.personal ?? {}} />
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-sm file-input-bordered w-full"
                onChange={(event) => {
                  readImageAsDataUrl(event.target.files?.[0], updatePhoto, (msg) => notify(msg, "warning"));
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 lg:col-span-7 lg:overflow-y-auto">
        <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <div className="text-sm opacity-70">Vista previa</div>
            <h3 className="text-lg font-semibold">{activeStyle.name}</h3>
          </div>
          <div className="badge badge-outline justify-self-start sm:justify-self-end">PDF listo</div>
        </div>
        <div className="overflow-auto rounded-lg bg-base-300 p-2 sm:p-4">
          <CvDocument data={data} styleId={activeStyleId} paperId="cv-template-preview" />
        </div>
      </div>
    </div>
  );
}
