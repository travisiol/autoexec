/**
 * The wallpaper layer. The gradient sky and hill live in CSS; this only adds
 * the clouds, whose positions are hardcoded rather than random so the server
 * and client agree on the markup.
 */
const CLOUDS = [
  { top: "6%", size: 260, duration: 190, delay: -40, opacity: 0.95 },
  { top: "14%", size: 150, duration: 140, delay: -95, opacity: 0.8 },
  { top: "3%", size: 340, duration: 260, delay: -150, opacity: 0.7 },
  { top: "26%", size: 190, duration: 165, delay: -20, opacity: 0.65 },
  { top: "38%", size: 120, duration: 120, delay: -70, opacity: 0.5 },
  { top: "20%", size: 420, duration: 320, delay: -230, opacity: 0.55 },
];

export function Desktop() {
  return (
    <>
      <div className="desktop" aria-hidden="true" />
      <div className="clouds" aria-hidden="true">
        {CLOUDS.map((cloud, i) => (
          <span
            key={i}
            className="cloud"
            style={{
              top: cloud.top,
              width: cloud.size,
              height: cloud.size * 0.42,
              opacity: cloud.opacity,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
