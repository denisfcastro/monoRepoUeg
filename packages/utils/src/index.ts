/**
 * Formata uma data para o padrão ISO string (YYYY-MM-DD).
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Gera um ID único baseado em timestamp + random.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Converte uma string para slug (URL-friendly).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Verifica se um valor é vazio (null, undefined, string vazia, array vazio, objeto vazio).
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Capitaliza a primeira letra de uma string.
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Remove valores nulos/undefined de um objeto.
 */
export function compact<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  ) as Partial<T>;
}

export * from './types';
