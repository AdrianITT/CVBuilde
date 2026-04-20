/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";

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

function getStyleAccent(style, settings) {
  return settings.accentColor || style.accent;
}

function getSoftColor(accentColor) {
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

export function CvDocument({ data, styleId, paperId = "cv-paper" }) {
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

export function getCvPrintStyles(styleId) {
  const style = getCvStyle(styleId);

  return `
    <style>
      @page { size: A4; margin: 0; }
      body {
        margin: 0;
        background: #ffffff;
        color: #111111;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      ${getCvCss(style.id)}
    </style>
  `;
}

export function getCvCss(styleId = DEFAULT_CV_STYLE_ID) {
  const style = getCvStyle(styleId);

  return `
    .az-cv-paper {
      --az-cv-accent: ${style.accent};
      --az-cv-soft: ${style.soft};
      --az-cv-font: ${style.font};
      box-sizing: border-box;
      width: min(210mm, 100%);
      min-height: auto;
      margin: 0 auto;
      padding: clamp(18px, 4vw, 14mm);
      background: #ffffff;
      color: #111111;
      font-family: var(--az-cv-font);
      font-size: calc(11.5px * var(--az-cv-font-scale, 1));
      line-height: var(--az-cv-line-height, 1.5);
    }
    .az-cv-paper * { box-sizing: border-box; }
    .az-cv-header {
      border-bottom: 1px solid #111111;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .az-cv-name {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.05;
      overflow-wrap: anywhere;
    }
    .az-cv-contact {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      margin-top: 7px;
      color: #333333;
      overflow-wrap: anywhere;
    }
    .az-cv-section {
      margin-top: var(--az-cv-section-spacing, 12px);
    }
    .az-cv-section-title {
      margin-bottom: 6px;
      color: #111111;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .az-cv-text {
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    .az-cv-items {
      display: grid;
      gap: 10px;
    }
    .az-cv-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
    }
    .az-cv-left {
      flex: 1;
      min-width: 0;
    }
    .az-cv-role {
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .az-cv-sub {
      margin-top: 2px;
      color: #333333;
    }
    .az-cv-date {
      color: #333333;
      white-space: nowrap;
    }
    .az-cv-bullets {
      margin: 6px 0 0;
      padding-left: 18px;
    }
    .az-cv-bullets li {
      margin: 3px 0;
      overflow-wrap: anywhere;
    }
    .az-cv-skills-grid {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 6px 12px;
    }
    .az-cv-skills-label {
      font-weight: 800;
    }
    .az-cv-skills-items {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .az-cv-skill-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .az-cv-skill-chips span {
      border: 1px solid color-mix(in srgb, var(--az-cv-accent) 40%, #ffffff);
      border-radius: 6px;
      padding: 3px 7px;
      background: var(--az-cv-soft);
      color: #111111;
    }
    .az-cv-details {
      margin-top: 6px;
    }
    .az-cv-avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .az-cv-executive .az-cv-header {
      border-bottom: 4px solid var(--az-cv-accent);
    }
    .az-cv-executive .az-cv-section-title {
      color: var(--az-cv-accent);
      border-bottom: 1px solid color-mix(in srgb, var(--az-cv-accent) 35%, #ffffff);
      padding-bottom: 3px;
    }
    .az-cv-technical {
      padding: 0;
    }
    .az-cv-sidebar-layout {
      display: grid;
      grid-template-columns: 62mm 1fr;
      min-height: 297mm;
    }
    .az-cv-sidebar {
      padding: 14mm 9mm;
      background: var(--az-cv-soft);
      border-right: 4px solid var(--az-cv-accent);
    }
    .az-cv-sidebar .az-cv-name {
      color: var(--az-cv-accent);
      font-size: 24px;
    }
    .az-cv-sidebar .az-cv-contact {
      display: grid;
      gap: 6px;
      margin-top: 12px;
    }
    .az-cv-sidebar .az-cv-section {
      margin-top: 18px;
    }
    .az-cv-main {
      padding: 14mm 12mm;
    }
    .az-cv-modern-header {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 14px;
      align-items: end;
      padding: 13px 16px;
      background: var(--az-cv-soft);
      border-left: 6px solid var(--az-cv-accent);
      margin-bottom: 14px;
    }
    .az-cv-kicker {
      color: var(--az-cv-accent);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .az-cv-modern .az-cv-section-title {
      color: var(--az-cv-accent);
    }
    .az-cv-photo-header {
      display: grid;
      grid-template-columns: 34mm 1fr;
      gap: 14px;
      align-items: center;
      padding-bottom: 13px;
      border-bottom: 5px solid var(--az-cv-accent);
      margin-bottom: 12px;
    }
    .az-cv-photo-frame {
      width: 31mm;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      display: grid;
      place-items: center;
      background: var(--az-cv-soft);
      border: 2px solid var(--az-cv-accent);
      color: var(--az-cv-accent);
      font-size: 26px;
      font-weight: 800;
    }
    .az-cv-photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .az-cv-photo-headline {
      min-width: 0;
    }
    .az-cv-photo .az-cv-section-title {
      color: var(--az-cv-accent);
    }
    .az-cv-compact {
      padding: 11mm;
      font-size: 10.8px;
      line-height: 1.38;
    }
    .az-cv-compact .az-cv-name {
      font-size: 24px;
    }
    .az-cv-compact .az-cv-section {
      margin-top: 8px;
    }
    .az-cv-compact .az-cv-items {
      gap: 7px;
    }
    @media screen {
      .az-cv-paper {
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
      }
    }
    @media screen and (max-width: 760px) {
      .az-cv-paper {
        font-size: 10.8px;
      }
      .az-cv-name {
        font-size: 23px;
      }
      .az-cv-contact {
        gap: 3px 8px;
      }
      .az-cv-row {
        display: grid;
        gap: 3px;
      }
      .az-cv-date {
        white-space: normal;
      }
      .az-cv-skills-grid {
        grid-template-columns: 1fr;
        gap: 3px;
      }
      .az-cv-sidebar-layout {
        grid-template-columns: 1fr;
        min-height: auto;
      }
      .az-cv-sidebar {
        border-right: 0;
        border-bottom: 4px solid var(--az-cv-accent);
        padding: 18px;
      }
      .az-cv-main {
        padding: 18px;
      }
      .az-cv-modern-header {
        grid-template-columns: 1fr;
        align-items: start;
      }
      .az-cv-photo-header {
        grid-template-columns: 1fr;
        justify-items: start;
      }
      .az-cv-photo-frame {
        width: 96px;
      }
    }
    @media print {
      .az-cv-paper {
        width: 210mm;
        min-height: 297mm;
        padding: 14mm;
        box-shadow: none;
      }
      .az-cv-technical {
        padding: 0;
      }
    }
  `;
}

function TemplateCard({ template, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`card w-full bg-base-100 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(template.id)}
    >
      <div className="card-body gap-3">
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

function readImageAsDataUrl(file, onDone) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Selecciona una imagen valida.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result ?? ""));
  reader.readAsDataURL(file);
}

function getLocalizedValue(value) {
  if (typeof value === "string") return value;
  if (value?.localized && typeof value.localized === "object") {
    return Object.values(value.localized)[0] ?? "";
  }
  return "";
}

function mergeLinkedInPayload(prev, payload) {
  const basicInfo = payload?.basicInfo ?? payload?.profile ?? payload ?? {};
  const firstName = getLocalizedValue(basicInfo.firstName) || basicInfo.firstName || "";
  const lastName = getLocalizedValue(basicInfo.lastName) || basicInfo.lastName || "";
  const fullName = basicInfo.name || [firstName, lastName].filter(Boolean).join(" ");
  const headline = getLocalizedValue(basicInfo.headline) || basicInfo.headline || "";
  const profileUrl = basicInfo.profileUrl || basicInfo.vanityName || payload?.profileUrl || "";
  const email = basicInfo.email || basicInfo.emailAddress || payload?.email || "";
  const photoCandidate = basicInfo.profilePicture || basicInfo.picture || basicInfo.pictureUrl || "";
  const photo = typeof photoCandidate === "string" ? photoCandidate : "";
  const currentPosition = payload?.primaryCurrentPosition ?? payload?.currentPosition;
  const education = payload?.mostRecentEducation ?? payload?.education;

  const next = {
    ...prev,
    personal: {
      ...prev.personal,
      nombreCompleto: fullName || prev.personal?.nombreCompleto || "",
      correo: email || prev.personal?.correo || "",
      linkedin: profileUrl || prev.personal?.linkedin || "",
      foto: photo || prev.personal?.foto || "",
    },
    resumen: headline || prev.resumen || "",
  };

  if (currentPosition?.title || currentPosition?.companyName) {
    next.experiencia = [
      {
        puesto: currentPosition.title || "",
        empresa: currentPosition.companyName || currentPosition.company?.name || "",
        ciudad: currentPosition.location || "",
        fechaInicio: "",
        fechaFin: "",
        actualmente: true,
        logros: [headline || ""],
      },
      ...(Array.isArray(prev.experiencia) ? prev.experiencia : []),
    ];
  }

  if (education?.schoolName || education?.degreeName) {
    next.educacion = [
      {
        grado: education.degreeName || education.degree || "",
        institucion: education.schoolName || education.school || "",
        ciudad: "",
        fechaInicio: "",
        fechaFin: "",
        detalles: education.fieldOfStudy || "",
      },
      ...(Array.isArray(prev.educacion) ? prev.educacion : []),
    ];
  }

  return next;
}

function LinkedInImporter({ onDataChange }) {
  const [profileUrl, setProfileUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleImport = async () => {
    const url = profileUrl.trim();
    if (!url) {
      setStatus("Pega la URL del perfil antes de importar.");
      return;
    }

    setStatus("Conectando con el importador autorizado...");

    try {
      const response = await fetch("/api/linkedin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: url }),
      });

      if (!response.ok) {
        throw new Error("El backend de LinkedIn no esta configurado.");
      }

      const payload = await response.json();
      onDataChange((prev) => mergeLinkedInPayload(prev, payload));
      setStatus("Datos importados desde LinkedIn.");
    } catch (error) {
      console.error(error);
      setStatus("Listo para conectar: requiere un backend OAuth/API de LinkedIn autorizado. No se hace scraping desde el navegador.");
    }
  };

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-3">
      {/*<div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">Sincronizacion con LinkedIn</h3>
          <p className="text-xs opacity-70">
            Usa OAuth/API oficial desde backend y trae solo datos permitidos por el usuario.
          </p>
        </div>
        <span className="badge badge-outline">API</span>
      </div>

      <div className="mt-3 grid gap-2">
        <input
          className="input input-sm input-bordered w-full"
          placeholder="https://www.linkedin.com/in/usuario"
          value={profileUrl}
          onChange={(event) => setProfileUrl(event.target.value)}
        />
        <button className="btn btn-sm btn-outline" onClick={handleImport}>
          Importar desde LinkedIn
        </button>
        {status ? <p className="text-xs opacity-70">{status}</p> : null}
      </div> */}
    </div>
  );
}

export default function StyleCV({ value, onChange, data, onDataChange }) {
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
          <div className="card-body gap-3">
            <div>
              <h2 className="card-title text-xl">Estilos de plantilla</h2>
              <p className="text-sm opacity-70">
                Harvard sigue como base por defecto. Elige otro estilo y se guardara en el perfil, el JSON y el PDF.
              </p>
            </div>

            <div className="max-h-[430px] overflow-y-auto pr-1 lg:max-h-[38vh]">
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
              <button className="btn btn-xs btn-ghost" onClick={resetTemplateSettings}>
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
                  readImageAsDataUrl(event.target.files?.[0], updatePhoto);
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <LinkedInImporter onDataChange={onDataChange} />
        </div>
      </div>

      <div className="min-h-0 lg:col-span-7 lg:overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-sm opacity-70">Vista previa</div>
            <h3 className="text-lg font-semibold">{activeStyle.name}</h3>
          </div>
          <div className="badge badge-outline">PDF listo</div>
        </div>
        <style>{getCvCss(activeStyleId)}</style>
        <div className="overflow-auto rounded-lg bg-base-300 p-2 sm:p-4">
          <CvDocument data={data} styleId={activeStyleId} paperId="cv-template-preview" />
        </div>
      </div>
    </div>
  );
}
