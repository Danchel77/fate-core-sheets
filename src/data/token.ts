/** Случайный код для публичной ссылки: 12 байт в base36. */
export function newToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
}
