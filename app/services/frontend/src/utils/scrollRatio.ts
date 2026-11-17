export function scrollRatio(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const range = scrollHeight - clientHeight;
  if (range <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, scrollTop / range));
}
