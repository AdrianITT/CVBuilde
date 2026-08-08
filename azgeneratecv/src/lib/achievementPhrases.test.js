import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_PHRASE_CATEGORIES } from "./achievementPhrases.js";

describe("ACHIEVEMENT_PHRASE_CATEGORIES", () => {
  it("tiene al menos 3 categorías, cada una con id, label y frases", () => {
    expect(ACHIEVEMENT_PHRASE_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    ACHIEVEMENT_PHRASE_CATEGORIES.forEach((category) => {
      expect(category.id).toBeTruthy();
      expect(category.label).toBeTruthy();
      expect(Array.isArray(category.phrases)).toBe(true);
      expect(category.phrases.length).toBeGreaterThan(0);
    });
  });

  it("no repite ids de categoría", () => {
    const ids = ACHIEVEMENT_PHRASE_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no tiene frases vacías ni duplicadas dentro de una misma categoría", () => {
    ACHIEVEMENT_PHRASE_CATEGORIES.forEach((category) => {
      category.phrases.forEach((phrase) => expect(phrase.trim().length).toBeGreaterThan(0));
      expect(new Set(category.phrases).size).toBe(category.phrases.length);
    });
  });
});
