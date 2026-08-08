import { describe, expect, it } from "vitest";
import { initialCV } from "./cvModel.js";
import { getCvCompleteness } from "./cvCompleteness.js";

describe("getCvCompleteness", () => {
  it("marca todo pendiente con un CV vacío", () => {
    // initialCV trae 2 skills de ejemplo (React, Django); para el caso "vacío"
    // se limpian explícitamente para no depender de ese contenido semilla.
    const result = getCvCompleteness({ ...initialCV, skills: [] });
    expect(result.doneCount).toBe(0);
    expect(result.percent).toBe(0);
    expect(result.checks.every((c) => c.done === false)).toBe(true);
  });

  it("marca el nombre como completo cuando tiene texto", () => {
    const cv = { ...initialCV, personal: { ...initialCV.personal, nombreCompleto: "Ada Lovelace" } };
    const result = getCvCompleteness(cv);
    expect(result.checks.find((c) => c.key === "nombre").done).toBe(true);
  });

  it("acepta correo O teléfono para el check de contacto", () => {
    const conCorreo = getCvCompleteness({ ...initialCV, personal: { ...initialCV.personal, correo: "a@b.com" } });
    const conTelefono = getCvCompleteness({ ...initialCV, personal: { ...initialCV.personal, telefono: "555" } });
    expect(conCorreo.checks.find((c) => c.key === "contacto").done).toBe(true);
    expect(conTelefono.checks.find((c) => c.key === "contacto").done).toBe(true);
  });

  it("requiere puesto Y empresa para marcar experiencia completa", () => {
    const soloPuesto = getCvCompleteness({ ...initialCV, experiencia: [{ ...initialCV.experiencia[0], puesto: "Dev" }] });
    const ambos = getCvCompleteness({
      ...initialCV,
      experiencia: [{ ...initialCV.experiencia[0], puesto: "Dev", empresa: "Acme" }],
    });
    expect(soloPuesto.checks.find((c) => c.key === "experiencia").done).toBe(false);
    expect(ambos.checks.find((c) => c.key === "experiencia").done).toBe(true);
  });

  it("calcula 100% cuando todos los checks pasan", () => {
    const cv = {
      ...initialCV,
      personal: { ...initialCV.personal, nombreCompleto: "Ada", correo: "a@b.com" },
      resumen: "Full-stack developer",
      skills: [{ id: "1", nombre: "React", nivel: "Avanzado" }],
      experiencia: [{ ...initialCV.experiencia[0], puesto: "Dev", empresa: "Acme" }],
      educacion: [{ ...initialCV.educacion[0], grado: "Ing.", institucion: "UNAM" }],
    };
    const result = getCvCompleteness(cv);
    expect(result.percent).toBe(100);
    expect(result.doneCount).toBe(result.total);
  });
});
