/** Convert Arabic-Indic / Persian digits to ASCII and keep digits only. */
export function sanitizeDigits(value, maxLen = 3) {
  const ascii = String(value ?? '')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
  return ascii.replace(/[^\d]/g, '').slice(0, maxLen);
}
