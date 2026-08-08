// validators.js
// Validación suave de campos del CV. No bloquea la edición: solo señala
// errores obvios (un email mal escrito, una URL con espacios) para que el
// usuario los corrija. Un valor vacío siempre se considera válido.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  if (!value?.trim()) return true;
  return EMAIL_RE.test(value.trim());
}

export function isValidUrl(value) {
  if (!value?.trim()) return true;
  const trimmed = value.trim();
  if (/\s/.test(trimmed)) return false; // las URLs no llevan espacios
  // Acepta "github.com/user", "https://..." o un dominio con punto.
  return trimmed.startsWith("http") || trimmed.includes(".");
}
