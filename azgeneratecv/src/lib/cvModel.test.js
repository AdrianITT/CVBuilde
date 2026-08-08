import { describe, expect, it } from "vitest";
import { createCvProfile, initialCV, normalizeCv, normalizeProfile } from "./cvModel.js";

describe("normalizeCv", () => {
  it("devuelve una estructura completa a partir de undefined", () => {
    const cv = normalizeCv(undefined);
    expect(cv.templateStyle).toBe("harvard");
    expect(cv.personal.nombreCompleto).toBe("");
    expect(Array.isArray(cv.experiencia)).toBe(true);
    expect(cv.experiencia.length).toBeGreaterThan(0);
  });

  it("normaliza un templateStyle inválido al por defecto", () => {
    expect(normalizeCv({ templateStyle: "noexiste" }).templateStyle).toBe("harvard");
  });

  it("asigna un id a las skills que no lo tienen", () => {
    const cv = normalizeCv({ skills: [{ nombre: "React", nivel: "Avanzado" }] });
    expect(cv.skills[0].id).toBeTruthy();
    expect(cv.skills[0].nombre).toBe("React");
  });

  it("rellena logros vacíos con un string vacío", () => {
    const cv = normalizeCv({ experiencia: [{ puesto: "Dev" }] });
    expect(cv.experiencia[0].logros).toEqual([""]);
    expect(cv.experiencia[0].actualmente).toBe(false);
  });

  it("usa la experiencia por defecto cuando llega un array vacío", () => {
    const cv = normalizeCv({ experiencia: [] });
    expect(cv.experiencia).toEqual(initialCV.experiencia);
  });

  it("preserva el contenido de campos válidos", () => {
    const cv = normalizeCv({ resumen: "Hola", personal: { correo: "a@b.com" } });
    expect(cv.resumen).toBe("Hola");
    expect(cv.personal.correo).toBe("a@b.com");
  });
});

describe("createCvProfile", () => {
  it("crea un perfil con nombre, id y datos normalizados", () => {
    const profile = createCvProfile("Mi CV");
    expect(profile.name).toBe("Mi CV");
    expect(profile.id).toBeTruthy();
    expect(profile.data.templateStyle).toBe("harvard");
  });

  it("usa el nombre por defecto cuando está vacío o en blanco", () => {
    expect(createCvProfile("").name).toBe("CV Principal");
    expect(createCvProfile("   ").name).toBe("CV Principal");
  });
});

describe("normalizeProfile", () => {
  it("conserva el nombre y normaliza los datos", () => {
    const profile = normalizeProfile({ name: "X", data: { resumen: "hi" } }, 0);
    expect(profile.name).toBe("X");
    expect(profile.data.resumen).toBe("hi");
  });

  it("genera nombres por defecto según el índice", () => {
    expect(normalizeProfile({}, 0).name).toBe("CV Principal");
    expect(normalizeProfile({}, 1).name).toBe("CV 2");
  });

  it("acepta datos en la forma legacy (sin envoltorio .data)", () => {
    const profile = normalizeProfile({ resumen: "legacy" }, 0);
    expect(profile.data.resumen).toBe("legacy");
  });
});
