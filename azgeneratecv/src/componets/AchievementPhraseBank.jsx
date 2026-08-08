// Banco de frases de impacto para logros: sugiere plantillas con verbos de
// acción y marcadores de métrica ([X%], [métrica]) para arrancar más rápido
// que la hoja en blanco. Presentacional: el padre controla si está abierto.
import { useState } from "react";
import { ACHIEVEMENT_PHRASE_CATEGORIES } from "../lib/achievementPhrases.js";

export default function AchievementPhraseBank({ onSelect, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(ACHIEVEMENT_PHRASE_CATEGORIES[0].id);

  const activeCategory =
    ACHIEVEMENT_PHRASE_CATEGORIES.find((category) => category.id === activeCategoryId) ??
    ACHIEVEMENT_PHRASE_CATEGORIES[0];

  return (
    <div className="mt-2 rounded-lg border border-base-300 bg-base-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {ACHIEVEMENT_PHRASE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`btn btn-xs ${category.id === activeCategoryId ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveCategoryId(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-xs btn-ghost" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <div className="mt-2 grid gap-1">
        {activeCategory.phrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            className="rounded-md border border-base-300 bg-base-100 px-2 py-1.5 text-left text-xs hover:border-primary"
            onClick={() => onSelect(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
