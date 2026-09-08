import type { BalloonPaint } from "@/components/Balloon";

/**
 * Silhouettes fed to the balloon renderer.
 *
 * Everything is painted with round caps and joins and then fattened with a
 * stroke pass, because the distance transform inherits whatever corners the
 * source shape has: a mitred join becomes a spike on the inflated mesh.
 */

/** A word, set heavy and rounded, thickened until the letters nearly touch. */
export function wordPaint(text: string, weight = 700): BalloonPaint {
  return (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Find the size that fills the box, then leave a margin the inflation can
    // grow into — an inflated glyph reads wider than its flat outline.
    let size = Math.round(h * 0.82);
    const font = (px: number) =>
      `${weight} ${px}px "Fredoka", "Segoe UI", "Trebuchet MS", sans-serif`;
    ctx.font = font(size);
    const targetWidth = w * 0.9;
    const measured = ctx.measureText(text).width;
    if (measured > 0) {
      size = Math.min(size, Math.floor((size * targetWidth) / measured));
      ctx.font = font(size);
    }

    ctx.lineWidth = size * 0.16;
    ctx.strokeText(text, w / 2, h / 2);
    ctx.fillText(text, w / 2, h / 2);
  };
}

/**
 * The mark: a fat chevron with a bar under its heel — a command prompt,
 * inflated. It is the one glyph on the site that has to work at 24px in the
 * taskbar and at 400px floating beside the hero, so it is built from three
 * strokes and nothing else.
 */
export const markPaint: BalloonPaint = (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const unit = Math.min(w, h);
  ctx.lineWidth = unit * 0.19;

  const cx = w * 0.44;
  const cy = h * 0.42;
  const arm = unit * 0.24;

  ctx.beginPath();
  ctx.moveTo(cx - arm * 0.85, cy - arm);
  ctx.lineTo(cx + arm * 0.55, cy);
  ctx.lineTo(cx - arm * 0.85, cy + arm);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.76);
  ctx.lineTo(w * 0.74, h * 0.76);
  ctx.stroke();
};

/** Flat SVG twin of `markPaint`, for favicons, buttons and the start orb. */
export const MARK_PATH =
  "M28 26 L54 44 L28 62 M46 78 L74 78";
