import * as THREE from "three";

/**
 * Inflates a 2D silhouette into a balloon.
 *
 * The Aero-era look this site is built on is glossy *tubing*: letterforms and
 * glyphs that look like they were blown up with air, with a fat rounded rim
 * and a highlight sliding over the crown. Rather than ship a pre-rendered PNG
 * of that, we build it as real geometry at runtime:
 *
 *   1. rasterise the shape to an alpha mask,
 *   2. run an exact euclidean distance transform so every interior pixel knows
 *      how far it is from the outline,
 *   3. map that distance through a circular profile to get a dome height,
 *   4. blur the height field, then displace a grid by it.
 *
 * Step 4's blur is not cosmetic. The distance transform peaks along the medial
 * axis of the shape, so an unblurred height field puts a hard crease down the
 * spine of every stroke — the letters come out looking like folded paper
 * instead of tubes. The blur is what makes them read as inflated.
 */

const INF = 1e20;

/** Felzenszwalb & Huttenlocher's 1D squared-distance transform. */
function edt1d(
  f: Float64Array,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array,
  n: number,
) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;

  for (let q = 1; q < n; q++) {
    let s =
      (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dx = q - v[k];
    d[q] = dx * dx + f[v[k]];
  }
}

/**
 * Distance, in pixels, from each pixel to the nearest pixel where
 * `inside` is false. Outside pixels come back as 0.
 */
function distanceField(inside: Uint8Array, w: number, h: number): Float32Array {
  const grid = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = inside[i] ? INF : 0;

  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) f[x] = grid[row + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) grid[row + x] = d[x];
  }

  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = Math.sqrt(grid[i]);
  return out;
}

/** Separable box blur, run three times to approximate a gaussian. */
function blur(src: Float32Array, w: number, h: number, radius: number) {
  if (radius < 1) return src;
  const a = src;
  const b = new Float32Array(w * h);

  for (let pass = 0; pass < 3; pass++) {
    // horizontal
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const sx = x + k;
          if (sx < 0 || sx >= w) continue;
          sum += a[row + sx];
          count++;
        }
        b[row + x] = sum / count;
      }
    }
    // vertical
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const sy = y + k;
          if (sy < 0 || sy >= h) continue;
          sum += b[sy * w + x];
          count++;
        }
        a[y * w + x] = sum / count;
      }
    }
  }
  return a;
}

export type BalloonOptions = {
  /** Paints the silhouette in opaque white on a transparent canvas. */
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  maskWidth: number;
  maskHeight: number;
  /** World width of the finished mesh; height follows the mask's aspect. */
  worldWidth: number;
  /** Tube radius as a fraction of mask height. Bigger = fatter balloon. */
  inflate?: number;
  /** Depth of the front shell, as a multiple of the tube radius. */
  bulge?: number;
  /** How flat the back shell is relative to the front. */
  backRatio?: number;
  /** Grid cells across the mask. Higher = smoother silhouette, more triangles. */
  resolution?: number;
};

export type BalloonResult = {
  geometry: THREE.BufferGeometry;
  worldHeight: number;
};

export function buildBalloon(options: BalloonOptions): BalloonResult {
  const {
    paint,
    maskWidth,
    maskHeight,
    worldWidth,
    inflate = 0.3,
    bulge = 1,
    backRatio = 0.55,
    resolution = 260,
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = maskWidth;
  canvas.height = maskHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.clearRect(0, 0, maskWidth, maskHeight);
  paint(ctx, maskWidth, maskHeight);

  const pixels = ctx.getImageData(0, 0, maskWidth, maskHeight).data;
  const inside = new Uint8Array(maskWidth * maskHeight);
  for (let i = 0; i < inside.length; i++) {
    inside[i] = pixels[i * 4 + 3] > 127 ? 1 : 0;
  }

  const dist = distanceField(inside, maskWidth, maskHeight);

  // Circular profile: flat at the outline, full height one tube-radius in.
  const radius = Math.max(4, inflate * maskHeight);
  const height = new Float32Array(maskWidth * maskHeight);
  for (let i = 0; i < height.length; i++) {
    const t = Math.min(dist[i] / radius, 1);
    height[i] = Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
  }

  const smoothed = blur(
    height,
    maskWidth,
    maskHeight,
    Math.max(1, Math.round(radius * 0.34)),
  );

  // Coverage decides the silhouette; a light blur keeps the cut edge from
  // stair-stepping along the grid.
  const coverage = new Float32Array(maskWidth * maskHeight);
  for (let i = 0; i < coverage.length; i++) coverage[i] = inside[i];
  const softCoverage = blur(coverage, maskWidth, maskHeight, 1);

  const cols = Math.max(8, Math.round(resolution));
  const rows = Math.max(
    8,
    Math.round((resolution * maskHeight) / maskWidth),
  );
  const worldHeight = (worldWidth * maskHeight) / maskWidth;
  const depth = radius * bulge * (worldWidth / maskWidth);

  const sample = (field: Float32Array, u: number, v: number) => {
    const fx = Math.min(u * (maskWidth - 1), maskWidth - 1.001);
    const fy = Math.min(v * (maskHeight - 1), maskHeight - 1.001);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const i00 = y0 * maskWidth + x0;
    return (
      field[i00] * (1 - tx) * (1 - ty) +
      field[i00 + 1] * tx * (1 - ty) +
      field[i00 + maskWidth] * (1 - tx) * ty +
      field[i00 + maskWidth + 1] * tx * ty
    );
  };

  const vertsPerShell = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vertsPerShell * 2 * 3);
  const uvs = new Float32Array(vertsPerShell * 2 * 2);
  const covers = new Float32Array(vertsPerShell);

  for (let gy = 0; gy <= rows; gy++) {
    for (let gx = 0; gx <= cols; gx++) {
      const idx = gy * (cols + 1) + gx;
      const u = gx / cols;
      const v = gy / rows;
      const h = sample(smoothed, u, v);
      covers[idx] = sample(softCoverage, u, v);

      const x = (u - 0.5) * worldWidth;
      const y = (0.5 - v) * worldHeight;

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = h * depth;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = 1 - v;

      const back = vertsPerShell + idx;
      positions[back * 3] = x;
      positions[back * 3 + 1] = y;
      positions[back * 3 + 2] = -h * depth * backRatio;
      uvs[back * 2] = u;
      uvs[back * 2 + 1] = 1 - v;
    }
  }

  const indices: number[] = [];
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const a = gy * (cols + 1) + gx;
      const b = a + 1;
      const c = a + cols + 1;
      const d = c + 1;
      if (
        covers[a] < 0.5 ||
        covers[b] < 0.5 ||
        covers[c] < 0.5 ||
        covers[d] < 0.5
      ) {
        continue;
      }
      indices.push(a, c, b, b, c, d);
      const oa = vertsPerShell + a;
      const ob = vertsPerShell + b;
      const oc = vertsPerShell + c;
      const od = vertsPerShell + d;
      // Reversed winding so the back shell faces away from the camera.
      indices.push(oa, ob, oc, ob, od, oc);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return { geometry, worldHeight };
}

/**
 * The sky this site sits in, as an equirectangular map. Used as the
 * environment for every balloon so the reflections agree with the wallpaper
 * behind them — chrome that reflects the wrong room is the fastest way to
 * make a glossy render look pasted on.
 */
export function skyEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.52);
  sky.addColorStop(0, "#0d5fae");
  sky.addColorStop(0.55, "#5fb2ee");
  sky.addColorStop(1, "#d8f1ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h * 0.52);

  const ground = ctx.createLinearGradient(0, h * 0.5, 0, h);
  ground.addColorStop(0, "#cdf28a");
  ground.addColorStop(0.35, "#71c62c");
  ground.addColorStop(1, "#186b18");
  ctx.fillStyle = ground;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  const sun = ctx.createRadialGradient(
    w * 0.22,
    h * 0.16,
    0,
    w * 0.22,
    h * 0.16,
    h * 0.42,
  );
  sun.addColorStop(0, "rgba(255,255,255,1)");
  sun.addColorStop(0.25, "rgba(255,255,255,0.55)");
  sun.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h * 0.6);

  // A few soft clouds so the highlights have something to break up on.
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 14; i++) {
    const cx = (i * 97) % w;
    const cy = h * 0.1 + ((i * 53) % Math.round(h * 0.3));
    const r = 12 + ((i * 17) % 26);
    const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    cloud.addColorStop(0, "rgba(255,255,255,0.95)");
    cloud.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return target.texture;
}
