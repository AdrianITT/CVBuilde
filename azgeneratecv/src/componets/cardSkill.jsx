import { useState } from "react";

const niveles = ["Básico", "Intermedio", "Avanzado", "Experto"];
const makeId = () => (crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`);

export default function CardSkill({ value = [], onChange }) {
  const [skillName, setSkillName] = useState("");
  const [skillNivel, setSkillNivel] = useState("Intermedio");

  const skills = Array.isArray(value) ? value : [];

  const addSkill = (e) => {
    e?.preventDefault?.();
    const name = skillName.trim();
    // console.log("CLICK addSkill:", { skillName, name, skillNivel });

    if (!name) return;

    const newSkill = { id: makeId(), nombre: name, nivel: skillNivel };

    // ✅ updater para evitar estados viejos
    onChange?.((prev) => [...(Array.isArray(prev) ? prev : []), newSkill]);

    setSkillName("");
    setSkillNivel("Intermedio");
  };

  const removeSkill = (id) => {
    onChange?.((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== id) : []));
  };

  const updateSkill = (id, field, val) => {
    onChange?.((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px_auto] sm:items-end">
        <label className="floating-label min-w-0">
          <input
            className="input input-md w-full"
            placeholder="Ej: React"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <span>Skill</span>
        </label>

        <label className="floating-label min-w-0">
          <select
            className="select select-md w-full"
            value={skillNivel}
            onChange={(e) => setSkillNivel(e.target.value)}
          >
            {niveles.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>Nivel</span>
        </label>

        <button type="button" className="btn btn-outline w-full sm:w-auto" onClick={addSkill}>
          + Agregar
        </button>
      </div>

      <div className="grid gap-2 sm:hidden">
        {skills.map((s) => (
          <div key={s.id} className="rounded-lg border border-base-300 bg-base-100 p-3">
            <div className="grid gap-2">
              <label className="grid gap-1 text-xs font-medium opacity-80">
                Skill
                <input
                  className="input input-sm w-full"
                  value={s.nombre}
                  onChange={(e) => updateSkill(s.id, "nombre", e.target.value)}
                />
              </label>

              <label className="grid gap-1 text-xs font-medium opacity-80">
                Nivel
                <select
                  className="select select-sm w-full"
                  value={s.nivel}
                  onChange={(e) => updateSkill(s.id, "nivel", e.target.value)}
                >
                  {niveles.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <button className="btn btn-ghost btn-sm w-full" onClick={() => removeSkill(s.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="rounded-lg border border-base-300 bg-base-200 p-3 text-sm opacity-70">
            Sin skills aun.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Nivel</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id}>
                <td>
                  <input
                    className="input input-sm w-full"
                    value={s.nombre}
                    onChange={(e) => updateSkill(s.id, "nombre", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="select select-sm w-full"
                    value={s.nivel}
                    onChange={(e) => updateSkill(s.id, "nivel", e.target.value)}
                  >
                    {niveles.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </td>
                <td className="text-right">
                  <button className="btn btn-ghost btn-sm" onClick={() => removeSkill(s.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr><td colSpan={3} className="opacity-70">Sin skills aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
