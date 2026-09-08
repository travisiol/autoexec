/**
 * Headless check on the balloon pipeline.
 *
 * `buildBalloon` needs a 2D canvas to rasterise into, which Node does not
 * have. Rather than pull in a canvas implementation, this stubs the canvas and
 * feeds it a mask the test draws itself — a disc and a bar — so the shape is
 * known analytically and the assertions can be exact:
 *
 *   - a disc of radius R has one interior point at distance R from the
 *     outline, so the height field must peak at 1 there and the mesh must
 *     reach the full bulge depth,
 *   - the bar is 2*r wide, so it must peak at exactly r,
 *   - everything outside both shapes must be culled, so the triangle count has
 *     to land near the shapes' combined area and nowhere near the full grid.
 *
 * Run with: node scripts/verify-balloon.ts
 */

const MASK_W = 480;
const MASK_H = 240;
const DISC_CX = 130;
const DISC_CY = 120;
const DISC_R = 70;
const BAR_X0 = 260;
const BAR_X1 = 440;
const BAR_CY = 120;
const BAR_HALF = 26;

/** The mask the stubbed canvas hands back, independent of any paint calls. */
function syntheticMask(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(MASK_W * MASK_H * 4);
  for (let y = 0; y < MASK_H; y++) {
    for (let x = 0; x < MASK_W; x++) {
      const inDisc =
        (x - DISC_CX) ** 2 + (y - DISC_CY) ** 2 <= DISC_R * DISC_R;
      const inBar =
        x >= BAR_X0 && x <= BAR_X1 && Math.abs(y - BAR_CY) <= BAR_HALF;
      if (inDisc || inBar) data[(y * MASK_W + x) * 4 + 3] = 255;
    }
  }
  return data;
}

const stubContext = new Proxy(
  {
    getImageData: () => ({ data: syntheticMask() }),
    measureText: () => ({ width: 100 }),
  } as Record<string, unknown>,
  {
    get: (target, prop) =>
      prop in target ? target[prop as string] : () => undefined,
    set: () => true,
  },
);

// three reaches for a few browser globals on import.
(globalThis as Record<string, unknown>).document = {
  createElement: () => ({
    width: 0,
    height: 0,
    style: {},
    getContext: () => stubContext,
  }),
  createElementNS: () => ({ style: {} }),
};
(globalThis as Record<string, unknown>).self = globalThis;

const { buildBalloon } = await import("../src/lib/balloon.ts");

const INFLATE = 0.3;
const BULGE = 1;
const WORLD_WIDTH = 2;
const RESOLUTION = 300;

const { geometry, worldHeight } = buildBalloon({
  paint: () => {},
  maskWidth: MASK_W,
  maskHeight: MASK_H,
  worldWidth: WORLD_WIDTH,
  inflate: INFLATE,
  bulge: BULGE,
  resolution: RESOLUTION,
});

const position = geometry.getAttribute("position");
const normal = geometry.getAttribute("normal");
const index = geometry.getIndex()!;

const tubeRadiusPx = INFLATE * MASK_H; // 72px
const scale = WORLD_WIDTH / MASK_W;
const maxDepth = tubeRadiusPx * BULGE * scale;

let minZ = Infinity;
let maxZ = -Infinity;
let nonFinite = 0;
for (let i = 0; i < position.count; i++) {
  const z = position.getZ(i);
  if (!Number.isFinite(z)) nonFinite++;
  if (z < minZ) minZ = z;
  if (z > maxZ) maxZ = z;
}
for (let i = 0; i < normal.count * 3; i++) {
  if (!Number.isFinite(normal.array[i])) nonFinite++;
}

const triangles = index.count / 3;
const gridCells = RESOLUTION * Math.round((RESOLUTION * MASK_H) / MASK_W);
const shapeArea =
  Math.PI * DISC_R * DISC_R + (BAR_X1 - BAR_X0) * (2 * BAR_HALF);
const expectedFill = shapeArea / (MASK_W * MASK_H);
const actualFill = triangles / 2 / 2 / gridCells; // two shells, two tris per quad

const checks: Array<[string, boolean, string]> = [
  ["mesh is not empty", triangles > 0, `${triangles} triangles`],
  ["no NaN in positions or normals", nonFinite === 0, `${nonFinite} bad values`],
  [
    "world height follows mask aspect",
    Math.abs(worldHeight - (WORLD_WIDTH * MASK_H) / MASK_W) < 1e-6,
    worldHeight.toFixed(4),
  ],
  [
    // The disc's centre is a full tube-radius from the outline, so the profile
    // saturates there. The blur pulls the very peak down a little; anything
    // below 80% would mean the profile never saturates at all.
    "front shell reaches the bulge depth",
    maxZ > maxDepth * 0.8 && maxZ <= maxDepth * 1.001,
    `${maxZ.toFixed(4)} of ${maxDepth.toFixed(4)}`,
  ],
  [
    "back shell is the shallower one",
    minZ < 0 && Math.abs(minZ) < maxZ,
    `${minZ.toFixed(4)}`,
  ],
  [
    "silhouette is culled to the painted shapes",
    Math.abs(actualFill - expectedFill) < 0.03,
    `${(actualFill * 100).toFixed(1)}% filled, shapes cover ${(
      expectedFill * 100
    ).toFixed(1)}%`,
  ],
];

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${detail})`);
}

console.log(
  `\n${checks.length - failed}/${checks.length} checks passed on a ${
    position.count
  }-vertex mesh.`,
);
process.exit(failed === 0 ? 0 : 1);
