export default function CvPreview({ data, onClose }) {
  const p = data?.personal ?? {};
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const experiencia = Array.isArray(data?.experiencia) ? data.experiencia : [];
  const educacion = Array.isArray(data?.educacion) ? data.educacion : [];

  const formatMes = (value) => {
    if (!value) return "";
    const [y, m] = value.split("-");
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mm = parseInt(m, 10);
    if (!mm) return value;
    return `${meses[mm - 1]} ${y}`;
  };

  const downloadPDF = () => {
    // 1) Tomamos el HTML del CV
    const cvEl = document.getElementById("cv-paper");
    if (!cvEl) return;

    // 2) Estilos “Harvard” inline para impresión consistente
    const printStyles = `
    <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cv { max-width: 780px; margin: 0 auto; }

    .headline { font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px; }
    .name { font-size: 28px; font-weight: 800; letter-spacing: 0.2px; line-height: 1.05; }
    .meta { margin-top: 7px; font-size: 11.5px; line-height: 1.4; }
    .meta a { color: #111; text-decoration: none; }
    .meta span { display: inline-block; margin-right: 12px; }

    .divider { border: 0; border-top: 1px solid #111; margin: 12px 0 10px; }

    .section { margin-top: 12px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 6px; }

    .row { display: flex; justify-content: space-between; gap: 14px; }
    .left { flex: 1; }
    .right { white-space: nowrap; font-size: 11.5px; }

    .role { font-weight: 800; font-size: 12px; }
    .sub { font-size: 11.5px; margin-top: 2px; color: #333; }

    .text { font-size: 11.5px; line-height: 1.55; white-space: pre-line; }

    .skills-grid { display: grid; grid-template-columns: 110px 1fr; gap: 6px 12px; font-size: 11.5px; line-height: 1.55; }
    .skills-label { font-weight: 800; }

    .bullets { margin: 6px 0 0; padding-left: 18px; }
    .bullets li { margin: 3px 0; font-size: 11.5px; line-height: 1.45; }

    /* evitar cortes feos */
    .avoid-break { break-inside: avoid; page-break-inside: avoid; }

    /* más compacto en impresión */
    p { margin: 0; }
    </style>
    `;


    // 3) Abrimos ventana nueva para imprimir
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) return;

    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>CV - ${p.nombreCompleto || "cv"}</title>
          ${printStyles}
        </head>
        <body>
          ${cvEl.outerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl">
        {/* barra botones */}
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-bold text-lg">Vista previa CV (Harvard)</h3>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={downloadPDF}>
              Descargar PDF
            </button>
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        {/* ===== Harvard / ATS friendly ===== */}
        <div id="cv-paper" className="cv bg-white text-black rounded-xl p-8 mt-4">
          {/* Header */}
          <div className="name">{p.nombreCompleto || "Tu Nombre"}</div>

            <div className="meta">
            {p.ciudadEstado && <span>{p.ciudadEstado}</span>}
            {p.telefono && <span><a href={`tel:${p.telefono}`}>{p.telefono}</a></span>}
            {p.correo && <span><a href={`mailto:${p.correo}`}>{p.correo}</a></span>}
            {p.linkedin && <span>LinkedIn: <a href={p.linkedin} target="_blank" rel="noreferrer">{p.linkedin}</a></span>}
            {p.github && <span>GitHub: <a href={p.github} target="_blank" rel="noreferrer">{p.github}</a></span>}
            {p.web && <span>Web: <a href={p.web} target="_blank" rel="noreferrer">{p.web}</a></span>}
            </div>


          <hr className="divider" />

          {/* Resumen */}
          {data?.resumen?.trim() ? (
            <section className="section avoid-break">
              <div className="section-title">Resumen</div>
              <div className="text">{data.resumen}</div>
            </section>
          ) : null}

          {/* Skills (Harvard estilo: línea) */}
            {skills.length ? (
            <section className="section avoid-break">
                <div className="section-title">Skills</div>

                {(() => {
                const norm = (x) => (x || "").toLowerCase();

                const buckets = {
                    "Languages": [],
                    "Frameworks": [],
                    "Tools": [],
                    "Other": [],
                };

                const frameworksKeywords = ["react", "next", "django", "flask", "node", "express", "vue", "angular", ".net", "spring"];
                const toolsKeywords = ["git", "docker", "aws", "linux", "mysql", "postgres", "sql", "vite", "webpack", "figma"];

                skills
                    .filter((s) => (s?.nombre ?? "").trim())
                    .forEach((s) => {
                    const n = norm(s.nombre);
                    const label = `${s.nombre}${s.nivel ? ` (${s.nivel})` : ""}`;

                    if (frameworksKeywords.some((k) => n.includes(k))) buckets.Frameworks.push(label);
                    else if (toolsKeywords.some((k) => n.includes(k))) buckets.Tools.push(label);
                    else if (["javascript", "typescript", "python", "java", "c#", "c++", "go"].some((k) => n.includes(k))) buckets.Languages.push(label);
                    else buckets.Other.push(label);
                    });

                const rows = Object.entries(buckets).filter(([, arr]) => arr.length);

                return (
                    <div className="skills-grid">
                    {rows.map(([title, arr]) => (
                        <div key={title} className="contents">
                        <div className="skills-label">{title}:</div>
                        <div>{arr.join(" • ")}</div>
                        </div>
                    ))}
                    </div>
                );
                })()}
            </section>
            ) : null}


          {/* Experiencia */}
          {experiencia.length ? (
            <section className="section">
              <div className="section-title">Experiencia</div>

              <div className="grid gap-3">
                {experiencia.map((exp, idx) => {
                  const inicio = formatMes(exp.fechaInicio);
                  const fin = exp.actualmente ? "Actual" : formatMes(exp.fechaFin);

                  const vacio =
                    !exp.puesto?.trim() &&
                    !exp.empresa?.trim() &&
                    !exp.ciudad?.trim() &&
                    !inicio &&
                    !fin;

                  if (vacio) return null;

                  const titulo = `${exp.puesto || "Puesto"}${exp.empresa ? `, ${exp.empresa}` : ""}`;
                  const lugar = exp.ciudad?.trim() ? exp.ciudad : "";

                  return (
                    <div key={idx} className="avoid-break">
                      <div className="row">
                        <div className="left">
                          <div style={{ fontWeight: 700, fontSize: "12px" }}>{titulo}</div>

                          {lugar ? <div className="sub">{lugar}</div> : null}
                        </div>
                        <div className="right">
                          {inicio || fin ? `${inicio} – ${fin}` : ""}
                        </div>
                      </div>

                      {Array.isArray(exp.logros) && exp.logros.some((l) => l.trim()) ? (
                        <ul className="bullets">
                          {exp.logros
                            .filter((l) => l.trim())
                            .map((l, i) => (
                              <li key={i}>{l}</li>
                            ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Educación */}
          {educacion.length ? (
            <section className="section">
              <div className="section-title">Educación</div>

              <div className="grid gap-3">
                {educacion.map((edu, idx) => {
                  const inicio = formatMes(edu.fechaInicio);
                  const fin = formatMes(edu.fechaFin);

                  const vacio =
                    !edu.grado?.trim() &&
                    !edu.institucion?.trim() &&
                    !edu.ciudad?.trim() &&
                    !inicio &&
                    !fin &&
                    !edu.detalles?.trim();

                  if (vacio) return null;

                  const titulo = `${edu.grado || "Grado"}${edu.institucion ? `, ${edu.institucion}` : ""}`;
                  const lugar = edu.ciudad?.trim() ? edu.ciudad : "";

                  return (
                    <div key={idx} className="avoid-break">
                      <div className="row">
                        <div className="left">
                          <div className="role">{titulo}</div>
                          {lugar ? <div className="sub">{lugar}</div> : null}
                        </div>
                        <div className="right">
                          {inicio || fin ? `${inicio} – ${fin}` : ""}
                        </div>
                      </div>

                      {edu.detalles?.trim() ? (
                        <div className="text" style={{ marginTop: 6 }}>
                          {edu.detalles}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
