import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Nirmanee Digital Print House — custom printing in Kalutara, Sri Lanka";

// Latin-only text: the default OG font has no Sinhala glyphs.
export default function OpengraphImage() {
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
          background: "#faf6ef",
          color: "#141a2e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: "#0070c0", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 40, fontWeight: 700 }}>N</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>Nirmanee</span>
            <span style={{ fontSize: 20, letterSpacing: 4, color: "#005c9f" }}>DIGITAL PRINT HOUSE</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>Your photos and ideas, printed with care.</span>
          <span style={{ fontSize: 30, color: "#333a52" }}>Mugs · Frames · Crystal · Laser engraving · Banners · T-shirts</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 26, color: "#333a52" }}>
          <span style={{ background: "#fce8c2", padding: "8px 18px", borderRadius: 999 }}>Proof before print</span>
          <span style={{ background: "#eaf3fb", padding: "8px 18px", borderRadius: 999 }}>Pickup Kalutara · Islandwide delivery</span>
        </div>
      </div>
    ),
    size,
  );
}
