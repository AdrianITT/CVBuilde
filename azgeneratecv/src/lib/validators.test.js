import { describe, expect, it } from "vitest";
import { isValidEmail, isValidUrl } from "./validators.js";

describe("isValidEmail", () => {
  it("considera válido un campo vacío", () => {
    expect(isValidEmail("")).toBe(true);
    expect(isValidEmail("   ")).toBe(true);
    expect(isValidEmail(undefined)).toBe(true);
  });

  it("acepta emails bien formados", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("nombre.apellido@dominio.mx")).toBe(true);
  });

  it("rechaza emails mal formados", () => {
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("sin-arroba.com")).toBe(false);
    expect(isValidEmail("con espacio@b.com")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("considera válido un campo vacío", () => {
    expect(isValidUrl("")).toBe(true);
    expect(isValidUrl(undefined)).toBe(true);
  });

  it("acepta dominios y URLs comunes", () => {
    expect(isValidUrl("github.com/usuario")).toBe(true);
    expect(isValidUrl("https://linkedin.com/in/x")).toBe(true);
    expect(isValidUrl("midominio.dev")).toBe(true);
  });

  it("rechaza valores con espacios o sin punto", () => {
    expect(isValidUrl("con espacio.com")).toBe(false);
    expect(isValidUrl("solotexto")).toBe(false);
  });
});
