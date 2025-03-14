// Type representing an HSLA color
export type HSLA = {
  h: number
  s: number
  l: number
  a: number
}

// Convert HSLA colors -> hex for interface elements
export function hslaToHex(hsla: HSLA) {
  const a = hsla.s * Math.min(hsla.l, 1 - hsla.l)
  const f = (n: number) => {
    const k = (n + hsla.h / 30) % 12
    const val = hsla.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * val).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Interpolate colors in HSLA space
export function hslaInterp(c1: HSLA, c2: HSLA) {
  let interp = { h: 0, s: 0, l: 0, a: 1 } as HSLA

  let hmax = Math.max(c1.h, c2.h)
  let hmin = Math.min(c1.h, c2.h)
  let hmid = (hmax + hmin) / 2
  interp.h = hmax - hmin <= 180 ? hmid : (hmid + 180) % 360

  interp.s = (c1.s + c2.s) / 2
  interp.l = (c1.l + c2.l) / 2
  return interp
}