import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

// ─── Mesh config ──────────────────────────────────────────────────────────────
export const CR = 4;
export const CC = 4;
export const FR = 20;
export const FC = 20;

export const FREQS = [
  [0.28, 0.20, 0.33, 0.25],
  [0.22, 0.35, 0.18, 0.30],
  [0.31, 0.17, 0.26, 0.38],
  [0.19, 0.34, 0.23, 0.27],
];
export const PHASE = [
  [0.0, 1.2, 2.5, 0.8],
  [1.7, 0.4, 2.1, 1.0],
  [0.6, 1.9, 0.3, 2.3],
  [1.4, 0.1, 1.1, 2.7],
];

// Variant 1 — warm rose / peach
export const V1_HUES = [
  [345, 352, 18, 28],
  [338, 348, 12, 22],
  [342, 346, 355, 16],
  [332, 340, 350,  8],
];
export const V1_SAT = 42;
export const V1_LIT = 84;

// Variant 2 — cool periwinkle / lavender
export const V2_HUES = [
  [210, 220, 232, 245],
  [205, 215, 228, 240],
  [212, 224, 235, 248],
  [200, 212, 226, 242],
];
export const V2_SAT = 38;
export const V2_LIT = 88;

// ─── Worklet helpers ──────────────────────────────────────────────────────────
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  'worklet';
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0, g = 0, b = 0;
  if      (hh < 60)  { r = c; g = x; }
  else if (hh < 120) { r = x; g = c; }
  else if (hh < 180) {         g = c; b = x; }
  else if (hh < 240) {         g = x; b = c; }
  else if (hh < 300) { r = x;         b = c; }
  else               { r = c;         b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function bilinear(
  c00: [number, number, number], c10: [number, number, number],
  c01: [number, number, number], c11: [number, number, number],
  tx: number, ty: number,
): [number, number, number] {
  'worklet';
  const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty);
  const w01 = (1 - tx) * ty,       w11 = tx * ty;
  return [
    Math.round(c00[0]*w00 + c10[0]*w10 + c01[0]*w01 + c11[0]*w11),
    Math.round(c00[1]*w00 + c10[1]*w10 + c01[1]*w01 + c11[1]*w11),
    Math.round(c00[2]*w00 + c10[2]*w10 + c01[2]*w01 + c11[2]*w11),
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useMeshColors(
  time: SharedValue<number>,
  variantAnim: SharedValue<number>,
) {
  return useDerivedValue(() => {
    const t = time.value;
    const v = variantAnim.value;
    const swing = 10;

    const ctrl: Array<Array<[number, number, number]>> = [];
    for (let r = 0; r < CR; r++) {
      const row: Array<[number, number, number]> = [];
      for (let c = 0; c < CC; c++) {
        const osc = Math.sin(FREQS[r][c] * t + PHASE[r][c]);
        const h1 = V1_HUES[r][c] + osc * swing;
        const h2 = V2_HUES[r][c] + osc * (swing * 0.6);
        const hue = h1 * (1 - v) + h2 * v;
        const sat = V1_SAT * (1 - v) + V2_SAT * v;
        const lit = V1_LIT * (1 - v) + V2_LIT * v;
        row.push(hslToRgb(hue, sat, lit));
      }
      ctrl.push(row);
    }

    const result: string[] = [];
    for (let row = 0; row <= FR; row++) {
      for (let col = 0; col <= FC; col++) {
        const gx = (col / FC) * (CC - 1);
        const gy = (row / FR) * (CR - 1);
        const cx0 = Math.min(Math.floor(gx), CC - 2);
        const cy0 = Math.min(Math.floor(gy), CR - 2);
        const [r, g, b] = bilinear(
          ctrl[cy0][cx0], ctrl[cy0][cx0 + 1],
          ctrl[cy0 + 1][cx0], ctrl[cy0 + 1][cx0 + 1],
          gx - cx0, gy - cy0,
        );
        result.push(`rgb(${r},${g},${b})`);
      }
    }
    return result;
  });
}
