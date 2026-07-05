import React from "react";

// clip-path outlines for non-rectangular / non-circular shapes.
// Add new shapes here — that's the only step needed to support a new outline.
const SHAPE_CLIP_PATHS = {
  hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  badge: "polygon(50% 0%, 93% 25%, 93% 70%, 50% 100%, 7% 70%, 7% 25%)", // shield/badge look
};

// Shapes whose text sits fine straight-on (no clip-path needed — handled
// with border-radius instead, which renders more cleanly than clip-path).
const RADIUS_SHAPES = {
  rect: "8px",
  oval: "50%",
  "rounded-square": "16%",
};

export const STAMP_SHAPES = [
  { value: "circle", label: "Round" },       // handled separately (CircleStamp)
  { value: "rect", label: "Rectangle" },
  { value: "oval", label: "Oval" },
  { value: "hexagon", label: "Hexagon" },
  { value: "diamond", label: "Diamond" },
  { value: "pentagon", label: "Pentagon" },
  { value: "badge", label: "Badge" },
  { value: "triangle", label: "Triangle" },
];

export default function ShapeStamp({
  shape = "rect",
  text = "APPROVED",
  color = "#d32f2f",
  showDate = true,
  rotation = -5,
  size = "medium",
}) {
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const sizes = {
    small: { w: 140, h: 90, fontSize: "12px", dateSize: "9px", border: "2px", padding: "10px" },
    medium: { w: 190, h: 120, fontSize: "16px", dateSize: "11px", border: "3px", padding: "14px" },
    large: { w: 240, h: 150, fontSize: "20px", dateSize: "13px", border: "4px", padding: "18px" },
  };
  const s = sizes[size] || sizes.medium;
  const clipPath = SHAPE_CLIP_PATHS[shape];
  const borderRadius = RADIUS_SHAPES[shape] ?? (clipPath ? "0" : "8px");

  // Shapes with sharp points (triangle, diamond) need their text pulled
  // toward the visual center of mass rather than the true geometric center,
  // otherwise the label crowds an edge or point.
  const contentOffset =
    shape === "triangle" ? { paddingTop: "38%" } :
    shape === "diamond" ? { padding: `${s.h * 0.3}px ${s.w * 0.22}px` } :
    {};

  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `${s.border} solid ${color}`,
        borderRadius,
        clipPath,
        transform: `rotate(${rotation}deg)`,
        background: `${color}14`,
        fontFamily: "Courier New, monospace",
        userSelect: "none",
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", padding: s.padding, ...contentOffset }}>
        <div
          style={{
            fontWeight: "bold",
            fontSize: s.fontSize,
            color,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            lineHeight: 1.15,
          }}
        >
          {text}
        </div>
        {showDate && (
          <div style={{ fontSize: s.dateSize, color, marginTop: "4px" }}>
            {today}
          </div>
        )}
      </div>
    </div>
  );
}