// the same bloke as on peng.ly, drawn from the same paths
export const viewBox = '-255 0 510 465';
export const body =
  'M0 0 C98 0 119 67 119 134 C119 238 127 259 227 375 C242 393 255 427 255 450 V465 H-255 V450 C-255 427 -242 393 -227 375 C-127 259 -119 238 -119 134 C-119 67 -98 0 0 0 Z';
export const belly = 'M-171 465 V405 A171 171 0 0 1 171 405 V465 Z';
export const beak =
  'M0 176 C55 176 98 184 98 197 C98 221 20 276 0 276 C-20 276 -98 221 -98 197 C-98 184 -55 176 0 176 Z';
export const eyes = ['M-63 160 A37 49 0 1 1 -17 158 Z', 'M17 158 A37 49 0 1 1 63 160 Z'];
// odd eyes, the left one's always been a bit bigger
export const pupils = [
  { cx: -40, cy: 128, r: 19 },
  { cx: 40, cy: 128, r: 15.5 },
];

// a flat copy for places with no stylesheet, like the share images
export function penguinSvg(ink: string, beakColour: string) {
  const white = eyes.map((d) => `<path fill="#fff" d="${d}"/>`).join('');
  const dots = pupils.map(({ cx, cy, r }) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${ink}"><path d="${body}"/><path fill="#fff" d="${belly}"/><path d="${beak}" fill="${beakColour}" stroke="${ink}" stroke-width="32" paint-order="stroke"/>${white}${dots}</svg>`;
}
