import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The start orb, flattened to a favicon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 64,
          background: "linear-gradient(to bottom, #bdff6d, #3fb417 55%, #17690c)",
        }}
      >
        <svg width="42" height="42" viewBox="0 0 100 100">
          <path
            d="M28 26 L54 44 L28 62 M46 78 L74 78"
            fill="none"
            stroke="#ffffff"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
