import { CvDocument } from "./StyleCV.jsx";
import { getCvPrintStyles } from "../lib/cvCss.js";
import { getCvStyle } from "../lib/cvStyles.js";

// [pdf-skill] Exporta a PDF con TEXTO REAL (seleccionable y legible por ATS).
// Usa un iframe oculto + window.print() en lugar de rasterizar a imagen.
// El usuario elige "Guardar como PDF" en el diálogo nativo del navegador.
function printCv(cvEl, style, title) {
  if (!cvEl) return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const cleanup = () => {
    // Espera a que el diálogo de impresión termine antes de retirar el iframe
    setTimeout(() => iframe.remove(), 1000);
  };

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${getCvPrintStyles(style.id)}
      </head>
      <body>${cvEl.outerHTML}</body>
    </html>`);
  doc.close();

  const triggerPrint = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    cleanup();
  };

  // Espera a que las imágenes (foto) carguen para no imprimir en blanco
  if (iframe.contentWindow.document.readyState === "complete") {
    triggerPrint();
  } else {
    iframe.contentWindow.addEventListener("load", triggerPrint, { once: true });
    // Fallback por si 'load' no dispara
    setTimeout(triggerPrint, 600);
  }
}

export default function CvPreview({ data, onClose }) {
  const style = getCvStyle(data?.templateStyle);
  const personal = data?.personal ?? {};

  const handleDownloadPdf = () => {
    const cvEl = document.getElementById("cv-paper");
    const title = `CV - ${personal.nombreCompleto || "cv"}`;
    printCv(cvEl, style, title);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-[calc(100vw-1rem)] max-w-5xl p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">Vista previa CV</h3>
            <p className="text-sm opacity-70">Plantilla: {style.name}</p>
          </div>
          <div className="grid gap-2 sm:flex sm:items-center">
            <button className="btn btn-primary w-full sm:w-auto" onClick={handleDownloadPdf}>
              Descargar PDF
            </button>
            <button className="btn w-full sm:w-auto" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="mt-1 text-xs opacity-60">
          En el diálogo de impresión elige <span className="font-semibold">"Guardar como PDF"</span>. El texto queda
          seleccionable y legible para sistemas ATS.
        </div>

        <div className="mt-4 max-h-[72vh] overflow-auto rounded-lg bg-base-300 p-2 sm:p-4">
          <CvDocument data={data} styleId={style.id} />
        </div>
      </div>
    </div>
  );
}
