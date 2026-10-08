export const CELL = 158
export const GAP = 14
export const STEP = CELL + GAP
export const MARGIN_X = 16
export const MARGIN_TOP = 40
const DOCK_SPACE = 110

export function gridSize() {
  const cols = Math.max(1, Math.floor((window.innerWidth - MARGIN_X * 2 + GAP) / STEP))
  const rows = Math.max(1, Math.floor((window.innerHeight - MARGIN_TOP - DOCK_SPACE + GAP) / STEP))
  return { cols, rows }
}