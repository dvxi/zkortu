import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/constants";

export const alt = "zkortu.pl – tenis na żywo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #ee8232 0%, #d96f22 100%)",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#1c1917", display: "flex" }} />
          <div style={{ display: "flex", fontSize: 56, fontWeight: 900, letterSpacing: -2 }}>
            zkortu<span style={{ opacity: 0.55, fontWeight: 600 }}>.pl</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>Tenis na żywo</div>
          <div style={{ fontSize: 28, opacity: 0.8, maxWidth: 900 }}>{SITE_DESCRIPTION}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
