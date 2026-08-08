import { describe, expect, it } from "vitest";
import {
  DEFAULT_CV_STYLE_ID,
  DEFAULT_TEMPLATE_SETTINGS,
  getCvStyle,
  getSoftColor,
  getStyleAccent,
  getTemplateSettings,
  normalizeCvStyleId,
} from "./cvStyles.js";

describe("normalizeCvStyleId", () => {
  it("devuelve el id si existe en el catálogo", () => {
    expect(normalizeCvStyleId("modern")).toBe("modern");
    expect(normalizeCvStyleId("technical")).toBe("technical");
  });

  it("cae al estilo por defecto con ids desconocidos o vacíos", () => {
    expect(normalizeCvStyleId("inexistente")).toBe(DEFAULT_CV_STYLE_ID);
    expect(normalizeCvStyleId(undefined)).toBe(DEFAULT_CV_STYLE_ID);
    expect(normalizeCvStyleId(null)).toBe(DEFAULT_CV_STYLE_ID);
  });
});

describe("getCvStyle", () => {
  it("devuelve el objeto de estilo correcto", () => {
    expect(getCvStyle("technical").layout).toBe("sidebar");
    expect(getCvStyle("photo").layout).toBe("photo");
  });

  it("devuelve el estilo por defecto con un id inválido", () => {
    expect(getCvStyle("xxx").id).toBe(DEFAULT_CV_STYLE_ID);
  });
});

describe("getTemplateSettings", () => {
  it("devuelve los valores por defecto cuando no hay ajustes", () => {
    expect(getTemplateSettings({}, "harvard")).toEqual(DEFAULT_TEMPLATE_SETTINGS);
  });

  it("fusiona los ajustes del usuario sobre los defaults", () => {
    const data = { templateSettings: { harvard: { fontScale: 1.1 } } };
    const settings = getTemplateSettings(data, "harvard");
    expect(settings.fontScale).toBe(1.1);
    expect(settings.lineHeight).toBe(DEFAULT_TEMPLATE_SETTINGS.lineHeight);
  });
});

describe("getStyleAccent", () => {
  it("usa el accent del estilo si no hay color custom", () => {
    expect(getStyleAccent({ accent: "#111" }, { accentColor: "" })).toBe("#111");
  });

  it("prioriza el color custom del usuario", () => {
    expect(getStyleAccent({ accent: "#111" }, { accentColor: "#abc" })).toBe("#abc");
  });
});

describe("getSoftColor", () => {
  it("devuelve el fallback con entradas inválidas", () => {
    expect(getSoftColor("")).toBe("#f3f4f6");
    expect(getSoftColor(null)).toBe("#f3f4f6");
    expect(getSoftColor("rojo")).toBe("#f3f4f6");
  });

  it("mezcla el color con blanco para tonos suaves", () => {
    // mix(c) = round(c * 0.12 + 255 * 0.88)
    expect(getSoftColor("#000000")).toBe("rgb(224, 224, 224)");
    expect(getSoftColor("#ffffff")).toBe("rgb(255, 255, 255)");
  });

  it("expande el formato corto de 3 dígitos", () => {
    // #000 -> #000000
    expect(getSoftColor("#000")).toBe("rgb(224, 224, 224)");
  });
});
