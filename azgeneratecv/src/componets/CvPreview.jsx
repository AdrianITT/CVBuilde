import { CvDocument, getCvCss, getCvPrintStyles, getCvStyle } from "./StyleCV.jsx";

export default function CvPreview({ data, onClose }) {
  const style = getCvStyle(data?.templateStyle);
  const personal = data?.personal ?? {};

  const downloadPDF = () => {
    const cvEl = document.getElementById("cv-paper");
    if (!cvEl) return;

    const printStyles = getCvPrintStyles(style.id);
    const title = `CV - ${personal.nombreCompleto || "cv"}`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
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
    printWindow.document.close();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-[calc(100vw-1rem)] max-w-5xl">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="font-bold text-lg">Vista previa CV</h3>
            <p className="text-sm opacity-70">Plantilla: {style.name}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={downloadPDF}>
              Descargar PDF
            </button>
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <style>{getCvCss(style.id)}</style>
        <div className="mt-4 max-h-[72vh] overflow-auto rounded-lg bg-base-300 p-2 sm:p-4">
          <CvDocument data={data} styleId={style.id} />
        </div>
      </div>
    </div>
  );
}
