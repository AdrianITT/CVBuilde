import { describe, expect, it } from "vitest";
import {
  createCvProfile,
  duplicateArrayItem,
  initialCV,
  moveArrayItem,
  normalizeCv,
  normalizeProfile,
} from "./cvModel.js";

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

describe("moveArrayItem", () => {
  it("intercambia el elemento con el siguiente al mover hacia abajo", () => {
    expect(moveArrayItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("intercambia el elemento con el anterior al mover hacia arriba", () => {
    expect(moveArrayItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("no hace nada si el destino queda fuera de rango", () => {
    const arr = ["a", "b", "c"];
    expect(moveArrayItem(arr, 0, -1)).toBe(arr);
    expect(moveArrayItem(arr, 2, 1)).toBe(arr);
  });
});

describe("duplicateArrayItem", () => {
  it("inserta una copia justo después del original", () => {
    expect(duplicateArrayItem(["a", "b"], 0)).toEqual(["a", "a", "b"]);
  });

  it("clona objetos anidados sin compartir referencia", () => {
    const original = [{ nombre: "React", logros: ["x"] }];
    const result = duplicateArrayItem(original, 0);
    result[1].logros.push("y");
    expect(original[0].logros).toEqual(["x"]);
  });

  it("no hace nada con un índice fuera de rango", () => {
    const arr = ["a"];
    expect(duplicateArrayItem(arr, 5)).toBe(arr);
  });
});
