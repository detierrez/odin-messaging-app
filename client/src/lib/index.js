export function merge() {
  return [...arguments].filter(Boolean).join(" ");
}
