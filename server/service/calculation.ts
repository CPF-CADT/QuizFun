// formula 
//
// point = basePoint * (1 + TimeRemain/TimeAlloed) 
//
export function calculatePoint(basePoint: number, timeAllowed: number, timeRemain: number): number {
    if (timeAllowed <= 0) return basePoint; 
    return Math.round(basePoint * (1 + timeRemain / timeAllowed));
}
export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

