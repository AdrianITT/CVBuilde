// achievementPhrases.js
// Banco de frases de impacto para "Logros / Responsabilidades". Plantillas con
// marcadores entre corchetes ([métrica], [acción]) que el usuario reemplaza
// con sus propios números — pensadas para arrancar rápido en vez de la hoja
// en blanco. Datos puros, sin React.

export const ACHIEVEMENT_PHRASE_CATEGORIES = [
  {
    id: "impacto",
    label: "Impacto y resultados",
    phrases: [
      "Reduje [métrica] en X% mediante [acción o herramienta].",
      "Aumenté [métrica] en X% al implementar [solución].",
      "Ahorré X horas por semana automatizando [proceso].",
      "Incrementé los ingresos en X% gracias a [iniciativa].",
      "Disminuí los costos operativos en X% al [acción].",
    ],
  },
  {
    id: "liderazgo",
    label: "Liderazgo y equipo",
    phrases: [
      "Lideré un equipo de X personas para entregar [proyecto] en X semanas/meses.",
      "Capacité a X compañeros en [tecnología o proceso], mejorando [métrica].",
      "Coordiné con X áreas para lanzar [proyecto] cumpliendo el plazo.",
      "Definí la hoja de ruta de [proyecto/producto] junto a stakeholders clave.",
      "Mentoricé a X desarrolladores junior, acelerando su curva de aprendizaje.",
    ],
  },
  {
    id: "eficiencia",
    label: "Eficiencia y procesos",
    phrases: [
      "Rediseñé el proceso de [área], reduciendo el tiempo de entrega en X%.",
      "Migré [sistema/proceso] de [tecnología A] a [tecnología B], mejorando [métrica].",
      "Eliminé X tareas manuales al automatizar [proceso] con [herramienta].",
      "Estandaricé [proceso] entre X equipos, reduciendo errores en X%.",
      "Implementé [metodología] que redujo el tiempo de ciclo en X%.",
    ],
  },
  {
    id: "tecnico",
    label: "Técnico y calidad",
    phrases: [
      "Desarrollé [funcionalidad/módulo] usado por X usuarios/clientes.",
      "Aumenté la cobertura de tests de X% a Y%, reduciendo bugs en producción.",
      "Optimicé [consulta/servicio], reduciendo el tiempo de respuesta en X%.",
      "Diseñé e implementé [arquitectura/API] que soporta X solicitudes/día.",
      "Detecté y corregí [problema crítico], evitando [consecuencia] para el negocio.",
    ],
  },
  {
    id: "comunicacion",
    label: "Comunicación y stakeholders",
    phrases: [
      "Presenté resultados de [proyecto] a directivos, obteniendo aprobación para [siguiente paso].",
      "Documenté [proceso/sistema], reduciendo el tiempo de onboarding en X%.",
      "Actué como punto de contacto entre [equipo A] y [equipo B] para [proyecto].",
      "Recopilé y prioricé feedback de X usuarios para definir el roadmap de [producto].",
      "Negocié con [proveedor/cliente] logrando [resultado concreto].",
    ],
  },
];
