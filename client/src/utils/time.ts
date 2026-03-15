export function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeDetailed(ms: number): string {
  if (ms <= 0) return '0:00.0';
  if (ms < 20000) {
    const totalTenths = Math.ceil(ms / 100);
    const seconds = Math.floor(totalTenths / 10);
    const tenths = totalTenths % 10;
    return `0:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }
  return formatTime(ms);
}