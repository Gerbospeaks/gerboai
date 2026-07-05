import React from "react";

// Each polygon shape: outline points (300x300 viewBox) + optional straight
// top/bottom edge paths that text can run along, with their known pixel
// width so we can force-fit text to that exact width via textLength.
const SHAPES = {
  hexagon: {
    points: "82.5,15 217.5,15 285,150 217.5,285 82.5,285 15,150",
    topPath: "M 82.5,34 L 217.5,34",   topWidth: 125,
    bottomPath: "M 82.5,266 L 217.5,266", bottomWidth: 125,
  },
  pentagon: {
    points: "150,15 288,110 235,285 65,285 12,110",
    topPath: "M 78,98 L 222,98",   topWidth: 134,
    bottomPath: "M 68,266 L 232,266", bottomWidth: 154,
  },
  badge: {
    points: "150,15 275,72 275,195 150,285 25,195 25,72",
    topPath: "M 65,58 L 235,58",   topWidth: 160,
    bottomPath: "M 58,232 L 242,232", bottomWidth: 174,
  },
  diamond: {
    points: "150,15 285,150 150,285 15,150",
    // no usable flat edge — centered text only
  },
  triangle: {
    points: "150,25 275,275 25,275",
    // no usable flat top edge — centered text only
  },
};

export const STAMP_SHAPES = [
  { value: "circle", label: "Round" },
  { value: "rect", label: "Rectangle" },
  { value: "oval", label: "Oval" },
 
];

const BOX_SHAPES = { rect: "8px", oval: "50%" };

export default function ShapeStamp({
  shape = "rect",
  text = "",
  color = "#d32f2f",
  showDate = true,
  rotation = -5,
  size = "medium",
  companyName = "",
  companyAddress = "",
  dateStr = "",
}) {
    const uid = React.useId().replace(/:/g, "");
  const boxSizes = { small: 150, medium: 190, large: 230 };
  const svgSizes = { small: 130, medium: 170, large: 210 };

  // ── Rectangle / oval — roomy flexbox layout, plenty of space, no clipping ──
  if (BOX_SHAPES[shape]) {
    const w = boxSizes[size] || boxSizes.medium;
    return (
      <div
        style={{
          width: w,
          minHeight: w * 0.62,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `3px solid ${color}`,
          borderRadius: BOX_SHAPES[shape],
          transform: `rotate(${rotation}deg)`,
          background: "transparent",
          fontFamily: "Courier New, monospace",
          userSelect: "none",
          pointerEvents: "none",
          boxSizing: "border-box",
          padding: "10px",
        }}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
          {companyName && (
            <div style={{ fontWeight: "bold", fontSize: 11, color, textTransform: "uppercase", letterSpacing: "1px" }}>
              {companyName}
            </div>
          )}
          <div style={{ fontWeight: "bold", fontSize: 17, color, textTransform: "uppercase", letterSpacing: "1.5px", margin: "3px 0" }}>
            {text}
          </div>
          {companyAddress && <div style={{ fontSize: 8, color }}>{companyAddress}</div>}
          {showDate && <div style={{ fontSize: 9, color, marginTop: 3 }}>{dateStr}</div>}
        </div>
      </div>
    );
  }

  // ── Polygon shapes — SVG, text auto-fit via textLength so it can never overflow ──
  const def = SHAPES[shape] || SHAPES.hexagon;
  const px = svgSizes[size] || svgSizes.medium;
  
  const hasTop = def.topPath && companyName;
  const hasBottom = def.bottomPath && companyAddress;

  return (
    <svg
      viewBox="0 0 300 300"
      width={px}
      height={px}
      style={{ transform: `rotate(${rotation}deg)`, display: "block" }}
    >
      <polygon points={def.points} fill="transparent" stroke={color} strokeWidth="4" opacity=".9" />

      {hasTop && (
        <>
          <path id={`top-${uid}`} d={def.topPath} fill="none" />
          <text fill={color} fontSize="14" fontWeight="bold" fontFamily="Courier New, monospace">
            <textPath
              href={`#top-${uid}`}
              startOffset="50%"
              textAnchor="middle"
              textLength={def.topWidth}
              lengthAdjust="spacingAndGlyphs"
            >
              {companyName.toUpperCase()}
            </textPath>
          </text>
        </>
      )}

      {hasBottom && (
        <>
          <path id={`bot-${uid}`} d={def.bottomPath} fill="none" />
          <text fill={color} fontSize="10" fontWeight="bold" fontFamily="Courier New, monospace">
            <textPath
              href={`#bot-${uid}`}
              startOffset="50%"
              textAnchor="middle"
              textLength={def.bottomWidth}
              lengthAdjust="spacingAndGlyphs"
            >
              {companyAddress}
            </textPath>
          </text>
        </>
      )}

      {/* Center text — always auto-fits to 150px width regardless of shape */}
      <text
        x="150"
        y={hasTop || hasBottom ? "158" : "160"}
        fill={color}
        fontSize="20"
        fontWeight="bold"
        fontFamily="Courier New, monospace"
        letterSpacing="1"
        textAnchor="middle"
        textLength="150"
        lengthAdjust="spacingAndGlyphs"
      >
        {text}
      </text>

      {showDate && !hasBottom && (
        <text
          x="150"
          y="185"
          fill={color}
          fontSize="11"
          textAnchor="middle"
          fontFamily="Courier New, monospace"
          textLength="80"
          lengthAdjust="spacingAndGlyphs"
        >
          {dateStr}
        </text>
      )}
    </svg>
  );
}