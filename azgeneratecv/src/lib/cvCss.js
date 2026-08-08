// cvCss.js
// CSS del documento del CV. Es idéntico para todos los estilos: las variables
// de color/fuente se aplican inline desde CvDocument, aquí solo van los fallbacks.
import { DEFAULT_CV_STYLE_ID, getCvStyle } from "./cvStyles.js";

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
