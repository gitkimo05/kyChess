export function getResultText(result: string, termination: string): string {
  if (result === '1-0') return `White wins — ${termination}`;
  if (result === '0-1') return `Black wins — ${termination}`;
  if (result === '1/2-1/2') return `Draw — ${termination}`;
  return 'Game in progress';
}