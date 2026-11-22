import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "StayMate — Find your people. Find your place. Live better.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const mark = await readFile(path.join(process.cwd(), "public/brand/mark-512.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #ffffff 0%, #edf5ff 55%, #e8f7ef 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 54, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#102c50" }}>Stay</span>
            <span style={{ color: "#0b7a47" }}>Mate</span>
          </div>
          <div style={{ marginTop: 36, fontSize: 68, fontWeight: 800, lineHeight: 1.05, color: "#102c50", letterSpacing: -2 }}>
            Your next home starts with the right people.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#64748b" }}>
            Roommates · Affordable places · Real costs
          </div>
          <div style={{ marginTop: 40, display: "flex" }}>
            <div style={{ background: "#1769d2", color: "#fff", fontSize: 28, fontWeight: 700, padding: "16px 34px", borderRadius: 999 }}>
              Join the early-access list
            </div>
          </div>
        </div>
        <img src={markSrc} width={340} height={340} alt="" />
      </div>
    ),
    { ...size },
  );
}
