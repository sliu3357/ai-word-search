import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Wordly - Word Search Generator"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #d1fae5 0%, #ffffff 50%, #fef3c7 100%)",
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        {/* Logo / 品牌标识 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 80, color: "#10b981" }}>✦</span>
          <span style={{ color: "#0f6b47", fontSize: 56 }}>Wordly</span>
        </div>

        {/* 主标题 */}
        <div
          style={{
            color: "#0f172a",
            fontSize: 72,
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Free Word Search Generator
        </div>

        {/* 副标题 */}
        <div
          style={{
            color: "#54707a",
            fontSize: 32,
            marginTop: 24,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Create custom printable puzzles with your own words
        </div>

        {/* 装饰：模拟字母网格 */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            fontSize: 36,
            fontFamily: "monospace",
            fontWeight: 800,
          }}
        >
          {["W", "O", "R", "D", "✦", "P", "L", "A", "Y"].map((char, i) => (
            <div
              key={i}
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  char === "✦"
                    ? "#ec7741"
                    : i % 2 === 0
                    ? "#a7e8c6"
                    : "#ffe9a8",
                color: char === "✦" ? "#ffffff" : "#0f6b47",
                borderRadius: 12,
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* 底部标签 */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
            fontSize: 24,
            color: "#54707a",
          }}
        >
          <span>📚 70+ Templates</span>
          <span>🖨️ Printable PDF</span>
          <span>🎮 Play Online</span>
        </div>
      </div>
    ),
    size
  )
}
