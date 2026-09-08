"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildBalloon, skyEnvironment } from "@/lib/balloon";

export type BalloonPaint = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) => void;

type Props = {
  paint: BalloonPaint;
  /** Mask aspect ratio, width / height. Drives the canvas box too. */
  aspect: number;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible name — the balloon is a picture of a word, so it needs one. */
  label: string;
  color?: string;
  inflate?: number;
  bulge?: number;
  /** Degrees of tilt the pointer can induce. */
  sway?: number;
  /** Slow idle bob, in world units. */
  bob?: number;
  resolution?: number;
};

/**
 * One balloon, rendered live. Everything here is deliberately self-contained:
 * no scene graph is shared between instances, because each balloon is sized to
 * its own box and the whole thing is cheap enough that a second WebGL context
 * costs less than the plumbing to share one.
 *
 * The renderer parks itself whenever the element is off-screen or the tab is
 * hidden. A page with five of these otherwise spins five render loops for
 * content nobody is looking at.
 */
export function Balloon({
  paint,
  aspect,
  className,
  style,
  label,
  color = "#7ff03a",
  inflate = 0.3,
  bulge = 1,
  sway = 9,
  bob = 0.06,
  resolution = 250,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef(paint);

  // Declared before the scene effect so it has already run by the time the
  // renderer rasterises the mask on mount.
  useEffect(() => {
    paintRef.current = paint;
  }, [paint]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    const cleanups: Array<() => void> = [];

    const start = async () => {
      // The mask is rasterised from a webfont; rasterising before it loads
      // silently bakes the fallback font into the geometry.
      try {
        await document.fonts.ready;
      } catch {
        /* fonts API unavailable — fall through with whatever is loaded */
      }
      if (disposed) return;

      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // No WebGL. The CSS fallback underneath stays visible.
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const canvas = renderer.domElement;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      host.appendChild(canvas);
      host.dataset.live = "true";

      const scene = new THREE.Scene();
      scene.environment = skyEnvironment(renderer);

      const maskWidth = 1100;
      const maskHeight = Math.round(maskWidth / aspect);
      const { geometry, worldHeight } = buildBalloon({
        paint: paintRef.current,
        maskWidth,
        maskHeight,
        worldWidth: 2,
        inflate,
        bulge,
        resolution,
      });

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        metalness: 0,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        transmission: 0.32,
        thickness: 0.5,
        ior: 1.42,
        envMapIntensity: 1.5,
        specularIntensity: 1,
        sheen: 0.6,
        sheenColor: new THREE.Color("#eaffd0"),
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      group.add(mesh);
      scene.add(group);

      // Key light high and left, matching the sun in the wallpaper, plus a
      // cool bounce from below so the underside of each tube stays readable.
      const key = new THREE.DirectionalLight("#ffffff", 2.6);
      key.position.set(-1.6, 2.2, 2.4);
      scene.add(key);
      const rim = new THREE.DirectionalLight("#9ffff0", 1.4);
      rim.position.set(2.2, -1.4, 1.2);
      scene.add(rim);
      scene.add(new THREE.AmbientLight("#cdeeff", 0.5));

      const camera = new THREE.PerspectiveCamera(26, aspect, 0.1, 40);

      const fit = () => {
        const rect = host.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        renderer!.setSize(width, height, false);
        camera.aspect = width / height;

        // Frame the mesh so it fills the box on whichever axis binds first.
        const vFov = (camera.fov * Math.PI) / 180;
        const distForHeight =
          (worldHeight * 1.22) / 2 / Math.tan(vFov / 2);
        const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
        const distForWidth = (2 * 1.16) / 2 / Math.tan(hFov / 2);
        camera.position.z = Math.max(distForHeight, distForWidth);
        camera.updateProjectionMatrix();
      };
      fit();

      const observer = new ResizeObserver(fit);
      observer.observe(host);
      cleanups.push(() => observer.disconnect());

      const pointer = { x: 0, y: 0 };
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      if (!reduced) {
        window.addEventListener("pointermove", onPointerMove, {
          passive: true,
        });
        cleanups.push(() =>
          window.removeEventListener("pointermove", onPointerMove),
        );
      }

      let visible = true;
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { rootMargin: "120px" },
      );
      io.observe(host);
      cleanups.push(() => io.disconnect());

      const radians = (sway * Math.PI) / 180;
      const clock = new THREE.Clock();
      let yaw = 0;
      let pitch = 0;

      const tick = () => {
        frame = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;

        const t = clock.getElapsedTime();
        const targetYaw = reduced ? 0 : pointer.x * radians;
        const targetPitch = reduced ? 0 : -pointer.y * radians * 0.55;
        yaw += (targetYaw - yaw) * 0.05;
        pitch += (targetPitch - pitch) * 0.05;

        group.rotation.y = yaw + (reduced ? 0 : Math.sin(t * 0.42) * 0.05);
        group.rotation.x = pitch + (reduced ? 0 : Math.sin(t * 0.31) * 0.03);
        group.rotation.z = reduced ? 0 : Math.sin(t * 0.24) * 0.015;
        group.position.y = reduced ? 0 : Math.sin(t * 0.55) * bob;

        renderer!.render(scene, camera);
      };
      tick();

      cleanups.push(() => {
        cancelAnimationFrame(frame);
        geometry.dispose();
        material.dispose();
        scene.environment?.dispose();
        renderer!.dispose();
        canvas.remove();
        delete host.dataset.live;
      });
    };

    void start();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, [aspect, color, inflate, bulge, sway, bob, resolution, label]);

  return (
    <div ref={hostRef} className={className} style={style} aria-label={label} />
  );
}
