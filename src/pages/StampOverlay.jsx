/**
 * StampOverlay.jsx
 *
 * Drop this onto any document wrapper (position: relative).
 * It reads stampConfig (from StampSignatureModal's onConfirm) and renders
 * the stamp and/or signature at the saved coordinates for the given page.
 *
 * Props:
 *   stampConfig   – { pageConfigs, signatureDataUrl, stampStyle }
 *   pageNumber    – which page to render overlays for (default 1)
 *   containerW    – actual rendered width  of the document (px). Default 794 (full size)
 *   containerH    – actual rendered height of the document (px). Default 1123
 */

import React from "react";

const FULL_W = 794;
const FULL_H = 1123;

// ── Rectangular stamp ─────────────────────────────────────────────────────────
function RectStamp({
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
    small: {
      padding: "8px 16px",
      fontSize: "14px",
      dateSize: "10px",
      border: "2px",
    },
    medium: {
      padding: "12px 22px",
      fontSize: "18px",
      dateSize: "11px",
      border: "3px",
    },
    large: {
      padding: "18px 28px",
      fontSize: "22px",
      dateSize: "13px",
      border: "4px",
    },
  };
  const s = sizes[size] || sizes.medium;
  return (
    <div
      style={{
        display: "inline-block",
        padding: s.padding,
        border: `${s.border} solid ${color}`,
        borderRadius: "8px",
        transform: `rotate(${rotation}deg)`,
        background: `${color}14`,
        fontFamily: "Courier New, monospace",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          outline: `2px solid ${color}`,
          outlineOffset: "2px",
          fontSize: s.fontSize,
          color,
          textTransform: "uppercase",
          letterSpacing: "2px",
          textAlign: "center",
          padding: "2px 4px",
        }}
      >
        {text}
      </div>
      {showDate && (
        <div
          style={{
            fontSize: s.dateSize,
            color,
            textAlign: "center",
            marginTop: "5px",
          }}
        >
          {today}
        </div>
      )}
    </div>
  );
}

// ── Circular stamp ────────────────────────────────────────────────────────────
function CircleStamp({
  size = 160,
  companyName = "MY COMPANY",
  companyAddress = "",
  dateStr = "",
}) {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      style={{ display: "block" }}
    >
      <circle
        cx="150"
        cy="150"
        r="145"
        fill="none"
        stroke="#ce1414"
        strokeWidth="5"
        opacity=".85"
      />
      <circle
        cx="150"
        cy="150"
        r="138"
        fill="none"
        stroke="#ce1414"
        strokeWidth="3"
        opacity=".85"
      />
      <circle
        cx="150"
        cy="150"
        r="100"
        fill="none"
        stroke="#ce1414"
        strokeWidth="3"
        opacity=".85"
      />
      <path
        id={`tc-ov-${uid}`}
        d="M 40,150 A 110,110 0 0,1 260,150"
        fill="none"
      />
      <text
        fill="#ce1414"
        fontSize="20"
        fontWeight="bold"
        letterSpacing="1.5"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath href={`#tc-ov-${uid}`} startOffset="50%" textAnchor="middle">
          {companyName.toUpperCase()}
        </textPath>
      </text>
      <path
        id={`bc-ov-${uid}`}
        d="M 30,150 A 110,110 0 0,0 270,150"
        fill="none"
      />
      <text
        fill="#ce1414"
        fontSize="14"
        letterSpacing=".5"
        fontWeight="bold"
        fontFamily="Courier New,monospace"
        opacity=".85"
      >
        <textPath href={`#bc-ov-${uid}`} startOffset="50%" textAnchor="middle">
          {companyAddress}
        </textPath>
      </text>
      <text
        x="35"
        y="170"
        fill="#ce1414"
        fontSize="16"
        opacity=".85"
        textAnchor="middle"
      >
        ★
      </text>
      <text
        x="265"
        y="170"
        fill="#ce1414"
        fontSize="16"
        opacity=".85"
        textAnchor="middle"
      >
        ★
      </text>
      <text
        x="150"
        y="160"
        fill="#e74c3c"
        fontSize="18"
        fontWeight="bold"
        letterSpacing="1.5"
        fontFamily="Courier New,monospace"
        opacity=".85"
        textAnchor="middle"
      >
        {dateStr}
      </text>
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function StampOverlay({
  stampConfig,
  pageNumber = 1,
  containerW = FULL_W,
  containerH = FULL_H,
  businessInfo,
}) {
  if (!stampConfig) return null;

  const { pageConfigs, signatureDataUrl, stampStyle } = stampConfig;
  const pageCfg = pageConfigs?.[pageNumber];
  if (!pageCfg) return null;

  const scaleX = containerW / FULL_W;
  const scaleY = containerH / FULL_H;

  // Date string for circle stamp
  const now = new Date();
  const mo = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const dateStr = `${String(now.getDate()).padStart(2, "0")} ${mo[now.getMonth()]} ${now.getFullYear()}`;

  const companyName = businessInfo?.businessName ?? "MY COMPANY";
  const companyAddress = businessInfo?.email ?? businessInfo?.primaryEmail ?? "";

  return (
    <>
      {/* ── Stamp ── */}
      {pageCfg.stampEnabled && (
        <div
          style={{
            position: "absolute",
            left: pageCfg.stamp.x * scaleX,
            top: pageCfg.stamp.y * scaleY,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {stampStyle?.stampType === "rect" ? (
            <RectStamp
              text={stampStyle.text}
              color={stampStyle.color}
              showDate={stampStyle.showDate}
              rotation={stampStyle.rotation}
              size={stampStyle.size}
            />
          ) : (
            <CircleStamp
              size={pageCfg.stamp.size * scaleX}
              companyName={companyName}
              companyAddress={companyAddress}
              dateStr={dateStr}
            />
          )}
        </div>
      )}

      {/* ── Signature ── */}
      {pageCfg.sigEnabled && signatureDataUrl && (
        <div
          style={{
            position: "absolute",
            left: pageCfg.sig.x * scaleX,
            top: pageCfg.sig.y * scaleY,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <img
            src={signatureDataUrl}
            alt="signature"
            style={{
              maxWidth: 140 * scaleX,
              maxHeight: 70 * scaleY,
              display: "block",
            }}
          />
          <div
            style={{
              borderBottom: "1px dashed #333",
              marginTop: 2,
              width: 140 * scaleX,
            }}
          />
        </div>
      )}
    </>
  );
}
