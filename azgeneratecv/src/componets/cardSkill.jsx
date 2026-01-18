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
      <div className="flex flex-wrap gap-2 items-end">
        <label className="floating-label">
          <input
            className="input input-md"
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

        <label className="floating-label">
          <select
            className="select select-md"
            value={skillNivel}
            onChange={(e) => setSkillNivel(e.target.value)}
          >
            {niveles.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>Nivel</span>
        </label>

        <button type="button" className="btn btn-outline" onClick={addSkill}>
          + Agregar
        </button>
      </div>

      <div className="overflow-x-auto">
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
