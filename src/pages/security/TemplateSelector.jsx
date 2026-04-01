import React, { useState } from "react";
import {
  Check,
  Shield,
  AlertTriangle,
  Eye,
  Clipboard,
  Radio,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE FONTS IMPORT
// ─────────────────────────────────────────────────────────────────────────────
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// businessInfo → companyInfo ADAPTER
// Maps the BusinessSettingsModal / Firestore field names to the internal
// companyInfo shape used by every template below.
// ─────────────────────────────────────────────────────────────────────────────
export const normaliseBusinessInfo = (businessInfo = {}) => ({
  // identity
  companyName: businessInfo.businessName || businessInfo.companyName || "",
  tagline: businessInfo.tagline || "Vigilance · Protection · Response",
  logoUrl: businessInfo.logoUrl || "",
  // address
  addressLine1: businessInfo.addressLine1 || "",
  addressLine2: businessInfo.addressLine2 || "",
  city: businessInfo.city || "",
  postalCode: businessInfo.postalCode || "",
  // contact
  phone: businessInfo.primaryPhone || businessInfo.phone || "",
  // banking
  bankName: businessInfo.bankName || "First National Bank",
  accountNumber: businessInfo.accountNumber || "",
  branchCode: businessInfo.branchCode || "",
  // security-specific (pass through if already present)
  psiraNumber: businessInfo.psiraNumber || "",
});

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg0: "#f0f2f5",
  bg1: "#ffffff",
  bg2: "#f8f9fb",
  bg3: "#f2f4f7",
  bg4: "#e8ecf2",
  border: "#d4dae4",
  borderLight: "#e2e6ee",
  textPrimary: "#1a2035",
  textSecondary: "#4a5568",
  textMuted: "#9aa5b4",
  textLabel: "#6b7a92",
  gold: "#b8922a",
  goldDim: "#9a7a1e",
  goldGlow: "#b8922a18",
  silver: "#64748b",
  blue: "#2c5fad",
  blueDim: "#1e4a8a",
  danger: "#b91c1c",
  dangerBg: "#fef2f2",
  warn: "#b45309",
  warnBg: "#fffbeb",
  ok: "#15803d",
  okBg: "#f0fdf4",
};

const FONT = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Segoe UI', Helvetica, sans-serif",
  mono: "'DM Mono', 'Courier New', monospace",
};

const today = () => new Date().toLocaleDateString("en-ZA");

// ── Section Bar ────────────────────────────────────────────────────────────
const SectionBar = ({
  children,
  bg = C.bg4,
  color = C.gold,
  accent = C.gold,
}) => (
  <div
    style={{
      background: bg,
      color,
      padding: "7px 14px",
      fontFamily: FONT.body,
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      borderLeft: `3px solid ${accent}`,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <span style={{ color: accent, fontSize: 8 }}>◆</span>
    {children}
  </div>
);

// ── Info Cell ──────────────────────────────────────────────────────────────
const InfoCell = ({ title, rows, style = {} }) => (
  <div
    style={{ border: `1px solid ${C.border}`, overflow: "hidden", ...style }}
  >
    <SectionBar>{title}</SectionBar>
    <div style={{ padding: "10px 14px", background: C.bg2 }}>
      {rows.map(([label, val]) => (
        <div
          key={label}
          style={{
            fontSize: 11,
            lineHeight: 2,
            fontFamily: FONT.body,
            color: C.textPrimary,
            display: "flex",
            gap: 6,
          }}
        >
          <span
            style={{
              color: C.textLabel,
              minWidth: 86,
              flexShrink: 0,
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <span style={{ fontWeight: 400 }}>{val || "—"}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Table ──────────────────────────────────────────────────────────────────
const SecTable = ({ headers, rows, accentCol = -1 }) => (
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 11,
      fontFamily: FONT.body,
    }}
  >
    <thead>
      <tr style={{ background: C.bg4 }}>
        {headers.map((h, i) => (
          <th
            key={h}
            style={{
              padding: "9px 14px",
              textAlign: i === 0 ? "left" : "center",
              color: C.gold,
              fontWeight: 700,
              letterSpacing: 1.5,
              fontSize: 9.5,
              textTransform: "uppercase",
              borderBottom: `1px solid ${C.gold}`,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr
          key={i}
          style={{
            background: i % 2 === 0 ? C.bg2 : C.bg3,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                padding: "8px 14px",
                textAlign: j === 0 ? "left" : "center",
                color: j === accentCol ? C.gold : C.textPrimary,
                fontWeight: j === accentCol ? 600 : 400,
                borderRight: `1px solid ${C.border}`,
                fontSize: 11,
              }}
            >
              {cell || "—"}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

// ── Banking Block ──────────────────────────────────────────────────────────
const BankingBlock = ({ companyInfo }) => (
  <div
    style={{
      background: C.bg3,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.gold}`,
      padding: "12px 16px",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        fontFamily: FONT.body,
        fontWeight: 700,
        fontSize: 9.5,
        color: C.gold,
        letterSpacing: 2,
        marginBottom: 10,
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 7 }}>◆</span> Payment &amp; Banking Details
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
        fontSize: 11,
        fontFamily: FONT.body,
        color: C.textPrimary,
      }}
    >
      {[
        ["Bank", companyInfo.bankName || "First National Bank"],
        ["Account Holder", companyInfo.companyName || "—"],
        ["Account Number", companyInfo.accountNumber || "—"],
        ["Branch Code", companyInfo.branchCode || "—"],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 5 }}>
          <span style={{ color: C.textLabel, fontWeight: 500 }}>{k}:</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Signature Strip ────────────────────────────────────────────────────────
const SigStrip = ({ labels = ["Officer", "Supervisor", "Client"] }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${labels.length}, 1fr)`,
      gap: 16,
      marginBottom: 16,
    }}
  >
    {labels.map((label) => (
      <div key={label}>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 9.5,
            color: C.textLabel,
            letterSpacing: 1.5,
            marginBottom: 5,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          style={{ borderBottom: `1px solid ${C.borderLight}`, height: 32 }}
        />
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 9,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          Signature / Date / Stamp
        </div>
      </div>
    ))}
  </div>
);

// ── Footer ─────────────────────────────────────────────────────────────────
const SecFooter = ({ text = "Restricted — Authorised Personnel Only" }) => (
  <div
    style={{
      borderTop: `1px solid ${C.border}`,
      paddingTop: 10,
      marginTop: 6,
      fontFamily: FONT.body,
      fontSize: 9.5,
      color: C.textMuted,
      textAlign: "center",
      letterSpacing: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    }}
  >
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <span style={{ color: C.textLabel, textTransform: "uppercase" }}>
      ◆ {text} ◆
    </span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

// ── Security Stamp ─────────────────────────────────────────────────────────
const SecStamp = ({
  text = "AUTHORISED",
  color = C.gold,
  showDate = true,
  size = "medium",
}) => {
  const s = size === "small" ? 88 : size === "large" ? 148 : 118;
  return (
    <div
      style={{
        display: "inline-block",
        transform: "rotate(-6deg)",
        opacity: 0.78,
      }}
    >
      <svg width={s} height={s} viewBox="0 0 118 118">
        <rect
          x="5"
          y="5"
          width="108"
          height="108"
          fill="none"
          stroke={color}
          strokeWidth="3"
        />
        <rect
          x="10"
          y="10"
          width="98"
          height="98"
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <text
          x="59"
          y="46"
          textAnchor="middle"
          fill={color}
          fontSize="8.5"
          fontWeight="700"
          fontFamily={FONT.body}
          letterSpacing="3"
        >
          SECURITY
        </text>
        <text
          x="59"
          y="63"
          textAnchor="middle"
          fill={color}
          fontSize="15"
          fontWeight="900"
          fontFamily={FONT.display}
          letterSpacing="1"
        >
          {text}
        </text>
        {showDate && (
          <text
            x="59"
            y="77"
            textAnchor="middle"
            fill={color}
            fontSize="8"
            fontFamily={FONT.mono}
          >
            {today()}
          </text>
        )}
        <text
          x="59"
          y="92"
          textAnchor="middle"
          fill={color}
          fontSize="7"
          fontFamily={FONT.body}
          letterSpacing="3"
        >
          CLASSIFIED
        </text>
      </svg>
    </div>
  );
};

// ── Page Wrapper ───────────────────────────────────────────────────────────
const SecPage = ({ children, style = {} }) => (
  <div
    style={{
      background: C.bg1,
      padding: "14mm 18mm",
      color: C.textPrimary,
      position: "relative",
      minHeight: "100%",
      ...style,
    }}
  >
    <FontImport />
    <div style={{ background: "transparent", position: "relative" }}>
      {children}
    </div>
  </div>
);

// ── Refined Header ─────────────────────────────────────────────────────────
const SecHeader = ({
  companyInfo,
  reportNumber,
  reportType,
  metaRows = [],
}) => (
  <div
    style={{
      borderBottom: `1px solid ${C.border}`,
      paddingBottom: 16,
      marginBottom: 18,
    }}
  >
    <div
      style={{
        height: 3,
        background: `linear-gradient(90deg, ${C.gold}, ${C.goldDim}, transparent)`,
        marginBottom: 16,
      }}
    />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      {/* Left: Logo + Company */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 64, height: 64, flexShrink: 0 }}>
          {companyInfo.logoUrl ? (
            <img
              src={companyInfo.logoUrl}
              alt="Logo"
              style={{ width: 64, height: 64, objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                background: C.bg4,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield style={{ color: C.gold, width: 32, height: 32 }} />
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 20,
              color: C.textPrimary,
              letterSpacing: 1,
              lineHeight: 1.1,
              marginBottom: 3,
            }}
          >
            {companyInfo.companyName || "Sentinel Security Operations"}
          </div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 9.5,
              color: C.gold,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            {companyInfo.tagline || "Vigilance · Protection · Response"}
          </div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 10,
              color: C.textLabel,
              lineHeight: 1.8,
            }}
          >
            <div>{companyInfo.addressLine1}</div>
            <div>
              {companyInfo.city} {companyInfo.postalCode}
            </div>
            <div>
              Tel: {companyInfo.phone} &nbsp;|&nbsp; PSiRA:{" "}
              {companyInfo.psiraNumber || "N/A"}
            </div>
          </div>
        </div>
      </div>
      {/* Right: Report type + meta box */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 22,
            color: C.gold,
            letterSpacing: 1,
            textTransform: "uppercase",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          {reportType}
        </div>
        <div
          style={{
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderTop: `2px solid ${C.gold}`,
            padding: "10px 16px",
            fontSize: 10.5,
            fontFamily: FONT.body,
            minWidth: 200,
          }}
        >
          {[
            ["Report No.", reportNumber],
            ["Date Issued", today()],
            ...metaRows,
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                marginBottom: 4,
              }}
            >
              <span style={{ color: C.textLabel, fontWeight: 500 }}>{k}</span>
              <span style={{ color: C.textPrimary, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 — DEFAULT: INCIDENT REPORT
// Accepts either `businessInfo` (from Firestore/BusinessSettingsModal)
// or `companyInfo` (legacy). businessInfo takes priority.
// ═══════════════════════════════════════════════════════════════════════════
export const DefaultTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "INC-2025-0001",
  reportType = "Incident Report",
  officerName,
  officerBadge,
  officerRank,
  siteName,
  siteAddress,
  siteZone,
  incidentDate,
  incidentTime,
  incidentCategory,
  items = [],
  summaryNotes,
  threatLevel = "MEDIUM",
  showStamp = false,
  stampText = "CLEARED",
  stampColor = C.gold,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  const tlColors = {
    LOW: C.ok,
    MEDIUM: C.warn,
    HIGH: C.danger,
    CRITICAL: "#8b0000",
  };
  const tc = tlColors[threatLevel] || C.warn;
  return (
    <SecPage>
      <SecHeader
        companyInfo={companyInfo}
        reportNumber={reportNumber}
        reportType={reportType}
        metaRows={[
          ["Threat Level", threatLevel],
          ["Category", incidentCategory || "—"],
          ["Status", "Filed"],
        ]}
      />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: tc + "22",
          border: `1px solid ${tc}`,
          color: tc,
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: 10.5,
          letterSpacing: 2,
          padding: "6px 16px",
          marginBottom: 16,
          textTransform: "uppercase",
        }}
      >
        <AlertTriangle style={{ width: 13, height: 13 }} />
        Threat Level: {threatLevel}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <InfoCell
          title="Reporting Officer"
          rows={[
            ["Name", officerName],
            ["Badge No.", officerBadge],
            ["Rank", officerRank],
          ]}
        />
        <InfoCell
          title="Site Details"
          rows={[
            ["Site", siteName],
            ["Address", siteAddress],
            ["Zone", siteZone],
          ]}
        />
        <InfoCell
          title="Incident Details"
          rows={[
            ["Date", incidentDate || today()],
            ["Time", incidentTime],
            ["Category", incidentCategory],
          ]}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionBar>Observations &amp; Findings</SectionBar>
        <SecTable
          headers={[
            "Observation / Finding",
            "Time",
            "Zone / Location",
            "Priority",
          ]}
          rows={items.map((i) => [
            i.description || i.finding,
            i.time || i.qty,
            i.zone || i.rate,
            i.priority || i.amount,
          ])}
          accentCol={3}
        />
      </div>
      {summaryNotes && (
        <div
          style={{
            background: C.dangerBg,
            border: `1px solid ${C.danger}22`,
            borderLeft: `3px solid ${C.danger}`,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 11,
            fontFamily: FONT.body,
            color: C.textPrimary,
            lineHeight: 1.8,
          }}
        >
          <div
            style={{
              color: C.danger,
              fontWeight: 700,
              marginBottom: 6,
              letterSpacing: 1.5,
              fontSize: 9.5,
              textTransform: "uppercase",
            }}
          >
            ◆ Incident Summary
          </div>
          {summaryNotes}
        </div>
      )}
      <SigStrip labels={["Officer", "Supervisor", "Client"]} />
      <BankingBlock companyInfo={companyInfo} />
      {showStamp && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <SecStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
          />
        </div>
      )}
      <SecFooter text="Classified — Authorised Personnel Only — Do Not Distribute" />
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 — CLASSIC: GUARD PATROL REPORT
// ═══════════════════════════════════════════════════════════════════════════
export const ClassicTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "PAT-2025-0001",
  reportType = "Guard Patrol Report",
  officerName,
  officerBadge,
  officerRank,
  siteName,
  siteAddress,
  siteZone,
  incidentDate,
  incidentTime,
  items = [],
  showStamp = false,
  stampText = "Patrol Complete",
  stampColor = C.gold,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  return (
    <SecPage>
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          textAlign: "center",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 18,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.border})`,
            }}
          />
          <div
            style={{
              width: 58,
              height: 58,
              border: `1px solid ${C.border}`,
              background: C.bg4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {companyInfo.logoUrl ? (
              <img
                src={companyInfo.logoUrl}
                alt="Logo"
                style={{ width: 50, height: 50, objectFit: "contain" }}
              />
            ) : (
              <Radio style={{ color: C.gold, width: 26, height: 26 }} />
            )}
          </div>
          <div
            style={{
              flex: 1,
              height: 1,
              background: `linear-gradient(90deg, ${C.border}, transparent)`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 22,
            color: C.textPrimary,
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          {companyInfo.companyName || "Sentinel Security Operations"}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 9.5,
            color: C.gold,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {companyInfo.tagline || "Vigilance · Protection · Response"}
        </div>
        <div
          style={{ fontFamily: FONT.body, fontSize: 10, color: C.textLabel }}
        >
          {companyInfo.addressLine1} &nbsp;|&nbsp; Tel: {companyInfo.phone}{" "}
          &nbsp;|&nbsp; PSiRA: {companyInfo.psiraNumber || "N/A"}
        </div>
        <div
          style={{
            marginTop: 14,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 14,
          }}
        >
          <div
            style={{
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 20,
              color: C.gold,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            {reportType}
          </div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 10.5,
              color: C.textLabel,
            }}
          >
            Ref: {reportNumber} &nbsp;|&nbsp; Date: {today()}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <InfoCell
          title="Patrol Officer"
          rows={[
            ["Name", officerName],
            ["Badge No.", officerBadge],
            ["Rank", officerRank],
          ]}
        />
        <InfoCell
          title="Patrol Site"
          rows={[
            ["Site", siteName],
            ["Address", siteAddress],
            ["Zone", siteZone],
          ]}
        />
        <InfoCell
          title="Patrol Period"
          rows={[
            ["Date", incidentDate || today()],
            ["Start Time", incidentTime],
            ["Shift", "Alpha"],
          ]}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionBar>Checkpoint Log</SectionBar>
        <SecTable
          headers={["Checkpoint / Observation", "Time", "Zone", "Status"]}
          rows={items.map((i) => [
            i.description || i.checkpoint,
            i.time || i.qty,
            i.zone || i.rate,
            i.status || i.amount || "Clear",
          ])}
          accentCol={3}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            border: `1px solid ${C.border}`,
            minWidth: 240,
            overflow: "hidden",
          }}
        >
          <SectionBar>Patrol Summary</SectionBar>
          <div
            style={{
              background: C.bg2,
              padding: 12,
              fontSize: 11,
              fontFamily: FONT.body,
              color: C.textPrimary,
            }}
          >
            {[
              ["Checkpoints Logged", items.length],
              [
                "All Clear",
                items.filter((i) => (i.status || "Clear") === "Clear").length,
              ],
              [
                "Anomalies",
                items.filter((i) => i.status && i.status !== "Clear").length,
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: C.textLabel, fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ fontWeight: 700, color: C.gold }}>{val}</span>
              </div>
            ))}
            <div
              style={{
                background: C.bg4,
                margin: "8px -12px -12px",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.textLabel }}>Patrol Status</span>
              <span style={{ color: C.gold }}>Complete</span>
            </div>
          </div>
        </div>
      </div>
      <SigStrip labels={["Officer", "Supervisor", "Site Manager"]} />
      <BankingBlock companyInfo={companyInfo} />
      {showStamp && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <SecStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
          />
        </div>
      )}
      <SecFooter text="Guard Patrol Log — Confidential Operational Record" />
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 — MODERN: RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════
export const ModernTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "RSK-2025-0001",
  reportType = "Risk Assessment",
  officerName,
  officerBadge,
  officerRank,
  siteName,
  siteAddress,
  siteZone,
  incidentDate,
  items = [],
  threatLevel = "MEDIUM",
  showStamp = false,
  stampText = "ASSESSED",
  stampColor = C.gold,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  const sevColor = (sev) => {
    const s = String(sev || "").toUpperCase();
    if (s === "CRITICAL" || s === "HIGH") return C.danger;
    if (s === "MEDIUM") return C.warn;
    return C.ok;
  };
  return (
    <SecPage>
      <SecHeader
        companyInfo={companyInfo}
        reportNumber={reportNumber}
        reportType={reportType}
        metaRows={[
          ["Threat Level", threatLevel],
          ["Type", "Risk Assessment"],
        ]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <SectionBar>Assessing Officer</SectionBar>
          <div style={{ padding: "12px 14px", background: C.bg2 }}>
            <div
              style={{
                fontFamily: FONT.display,
                fontSize: 18,
                fontWeight: 600,
                color: C.textPrimary,
                marginBottom: 4,
              }}
            >
              {officerName || "—"}
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: 10.5,
                color: C.textLabel,
              }}
            >
              {officerRank || "Officer"} &nbsp;|&nbsp; Badge:{" "}
              {officerBadge || "—"}
            </div>
          </div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <SectionBar>Assessment Site</SectionBar>
          <div style={{ padding: "12px 14px", background: C.bg2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                fontFamily: FONT.body,
                fontSize: 11,
                color: C.textPrimary,
              }}
            >
              {[
                ["Site", siteName],
                ["Zone", siteZone],
                ["Address", siteAddress],
                ["Date", incidentDate || today()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 5 }}>
                  <span style={{ color: C.textLabel, fontWeight: 500 }}>
                    {k}:
                  </span>
                  <span>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionBar>Risk Register</SectionBar>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            fontFamily: FONT.body,
          }}
        >
          <thead>
            <tr style={{ background: C.bg4 }}>
              {[
                "Risk / Finding",
                "Severity",
                "Likelihood",
                "Location",
                "Recommendation",
              ].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 14px",
                    textAlign: i === 0 ? "left" : "center",
                    color: C.gold,
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontSize: 9.5,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${C.gold}`,
                    borderRight: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? C.bg2 : C.bg3,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <td style={{ padding: "8px 14px", color: C.textPrimary }}>
                  {item.description || item.risk || "—"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px 14px",
                    color: sevColor(item.severity || item.qty),
                    fontWeight: 700,
                  }}
                >
                  {item.severity || item.qty || "—"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px 14px",
                    color: C.textSecondary,
                  }}
                >
                  {item.likelihood || "Medium"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px 14px",
                    color: C.textSecondary,
                  }}
                >
                  {item.location || item.rate || "—"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "8px 14px",
                    color: C.textPrimary,
                  }}
                >
                  {item.recommendation || item.amount || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            border: `1px solid ${C.border}`,
            minWidth: 260,
            overflow: "hidden",
          }}
        >
          <SectionBar>Risk Summary</SectionBar>
          <div
            style={{
              background: C.bg2,
              padding: 12,
              fontSize: 11,
              fontFamily: FONT.body,
            }}
          >
            {[
              ["Total Risks Identified", items.length],
              [
                "High / Critical",
                items.filter((i) =>
                  ["HIGH", "CRITICAL"].includes(
                    (i.severity || "").toUpperCase(),
                  ),
                ).length,
              ],
              [
                "Medium",
                items.filter(
                  (i) => (i.severity || "").toUpperCase() === "MEDIUM",
                ).length,
              ],
              [
                "Low",
                items.filter((i) =>
                  ["LOW", ""].includes((i.severity || "").toUpperCase()),
                ).length,
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: C.textLabel, fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ fontWeight: 700, color: C.gold }}>{val}</span>
              </div>
            ))}
            <div
              style={{
                background: C.bg4,
                margin: "8px -12px -12px",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: C.textLabel }}>Overall Risk</span>
              <span style={{ color: C.gold }}>{threatLevel}</span>
            </div>
          </div>
        </div>
      </div>
      <SigStrip labels={["Assessor", "Supervisor", "Client Representative"]} />
      <BankingBlock companyInfo={companyInfo} />
      {showStamp && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <SecStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
          />
        </div>
      )}
      <SecFooter text="Risk Assessment — Sensitive Operational Document" />
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 — ELEGANT: EXECUTIVE SECURITY BRIEF
// ═══════════════════════════════════════════════════════════════════════════
export const ElegantTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "EXC-2025-0001",
  reportType = "Executive Security Brief",
  officerName,
  officerBadge,
  officerRank,
  siteName,
  siteAddress,
  incidentDate,
  items = [],
  showStamp = false,
  stampText = "APPROVED",
  stampColor = C.gold,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  return (
    <SecPage>
      <div style={{ border: `1px solid ${C.gold}`, padding: "18px 22px" }}>
        <div style={{ border: `1px solid ${C.border}`, padding: "16px 20px" }}>
          <div
            style={{
              textAlign: "center",
              borderBottom: `1px solid ${C.border}`,
              paddingBottom: 18,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  border: `1px solid ${C.gold}`,
                  background: C.bg4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {companyInfo.logoUrl ? (
                  <img
                    src={companyInfo.logoUrl}
                    alt="Logo"
                    style={{ width: 62, height: 62, objectFit: "contain" }}
                  />
                ) : (
                  <Shield style={{ color: C.gold, width: 34, height: 34 }} />
                )}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 22,
                color: C.textPrimary,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              {companyInfo.companyName || "Sentinel Security Operations"}
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: 9.5,
                color: C.gold,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {companyInfo.tagline || "Vigilance · Protection · Response"}
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: 10,
                color: C.textLabel,
              }}
            >
              {companyInfo.addressLine1} &nbsp;|&nbsp; PSiRA:{" "}
              {companyInfo.psiraNumber || "N/A"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "14px 0 10px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${C.border})`,
                }}
              />
              <span style={{ color: C.gold, fontSize: 14 }}>◆</span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: `linear-gradient(90deg, ${C.border}, transparent)`,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 20,
                color: C.gold,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              {reportType}
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: 10.5,
                color: C.textLabel,
              }}
            >
              Ref: {reportNumber} &nbsp;|&nbsp; Date: {today()}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginBottom: 18,
            }}
          >
            {[
              {
                title: "Prepared By",
                rows: [
                  ["Name", officerName],
                  ["Rank", officerRank],
                  ["Badge", officerBadge],
                ],
              },
              {
                title: "Site & Period",
                rows: [
                  ["Site", siteName],
                  ["Address", siteAddress],
                  ["Period", incidentDate || today()],
                ],
              },
            ].map(({ title, rows }) => (
              <div key={title}>
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontWeight: 700,
                    fontSize: 9.5,
                    color: C.gold,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 5,
                    marginBottom: 10,
                  }}
                >
                  {title}
                </div>
                {rows.map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 11,
                      lineHeight: 1.9,
                      color: C.textPrimary,
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        color: C.textLabel,
                        minWidth: 76,
                        flexShrink: 0,
                        fontWeight: 500,
                      }}
                    >
                      {k}:
                    </span>
                    <span>{v || "—"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <SectionBar>Executive Findings</SectionBar>
            <SecTable
              headers={[
                "Finding / Observation",
                "Priority",
                "Status",
                "Action Required",
              ]}
              rows={items.map((i) => [
                i.description || i.finding,
                i.priority || i.qty,
                i.status || i.rate,
                i.action || i.amount,
              ])}
              accentCol={1}
            />
          </div>
          <SigStrip labels={["Officer", "Director", "Client"]} />
          <BankingBlock companyInfo={companyInfo} />
          {showStamp && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <SecStamp
                text={stampText}
                color={stampColor}
                showDate={showStampDate}
              />
            </div>
          )}
          <SecFooter text="Executive Brief — Eyes Only — Restricted Distribution" />
        </div>
      </div>
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 — SPEED: RAPID RESPONSE REPORT
// ═══════════════════════════════════════════════════════════════════════════
export const SpeedTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "RRT-2025-0001",
  reportType = "Rapid Response Report",
  officerName,
  officerBadge,
  officerRank,
  siteName,
  siteAddress,
  incidentDate,
  incidentTime,
  items = [],
  threatLevel = "HIGH",
  showStamp = false,
  stampText = "RESPONDED",
  stampColor = C.danger,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  return (
    <SecPage style={{ background: C.bg0 }}>
      <div
        style={{
          background: C.danger,
          color: "#fff",
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: 10.5,
          letterSpacing: 3,
          padding: "8px 16px",
          marginBottom: 16,
          textAlign: "center",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <AlertTriangle style={{ width: 13, height: 13 }} />
        Rapid Response — Active Incident Record
        <AlertTriangle style={{ width: 13, height: 13 }} />
      </div>
      <div
        style={{
          borderBottom: `1px solid ${C.danger}44`,
          paddingBottom: 16,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${C.danger}, ${C.danger}44, transparent)`,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  border: `2px solid ${C.danger}66`,
                  background: C.bg3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {companyInfo.logoUrl ? (
                  <img
                    src={companyInfo.logoUrl}
                    alt="Logo"
                    style={{ width: 52, height: 52, objectFit: "contain" }}
                  />
                ) : (
                  <AlertTriangle
                    style={{ color: C.danger, width: 28, height: 28 }}
                  />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.textPrimary,
                    letterSpacing: 0.5,
                    marginBottom: 3,
                  }}
                >
                  {companyInfo.companyName || "Sentinel Security Operations"}
                </div>
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 9.5,
                    color: C.danger,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Rapid Response Unit
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT.body,
                fontSize: 10,
                color: C.textLabel,
              }}
            >
              {companyInfo.addressLine1} &nbsp;|&nbsp; {companyInfo.phone}{" "}
              &nbsp;|&nbsp; PSiRA: {companyInfo.psiraNumber || "N/A"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 22,
                color: C.danger,
                marginBottom: 10,
                letterSpacing: 0.5,
              }}
            >
              {reportType}
            </div>
            <div
              style={{
                background: C.dangerBg,
                border: `1px solid ${C.danger}44`,
                borderTop: `2px solid ${C.danger}`,
                padding: "10px 16px",
                fontFamily: FONT.body,
                minWidth: 200,
              }}
            >
              <div
                style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary }}
              >
                # {reportNumber}
              </div>
              <div style={{ fontSize: 10.5, color: C.textLabel, marginTop: 4 }}>
                {today()} · {incidentTime || "—"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.danger,
                  marginTop: 5,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Threat: {threatLevel}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <InfoCell
          title="Responding Officer"
          rows={[
            ["Name", officerName],
            ["Badge No.", officerBadge],
            ["Rank", officerRank],
          ]}
        />
        <InfoCell
          title="Incident Site"
          rows={[
            ["Site", siteName],
            ["Address", siteAddress],
            ["Date", incidentDate || today()],
          ]}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionBar bg={C.dangerBg} color={C.danger} accent={C.danger}>
          Action / Event Log
        </SectionBar>
        <SecTable
          headers={["Action / Event", "Time", "Zone", "Outcome"]}
          rows={items.map((i) => [
            i.description || i.action,
            i.time || i.qty,
            i.zone || i.rate,
            i.outcome || i.amount,
          ])}
          accentCol={3}
        />
      </div>
      <SigStrip labels={["Responding Officer", "Control Room", "Client"]} />
      <BankingBlock companyInfo={companyInfo} />
      {showStamp && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <SecStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
          />
        </div>
      )}
      <SecFooter text="Rapid Response Log — For Official Use Only" />
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 6 — DIAGNOSTIC: SITE INSPECTION REPORT
// ═══════════════════════════════════════════════════════════════════════════
export const DiagnosticTemplate = ({
  businessInfo,
  companyInfo: _companyInfo = {},
  reportNumber = "INS-2025-0001",
  reportType = "Site Inspection Report",
  officerName,
  officerBadge,
  siteName,
  siteAddress,
  siteZone,
  incidentDate,
  items = [],
  showStamp = false,
  stampText = "INSPECTED",
  stampColor = C.gold,
  showStampDate = true,
}) => {
  const companyInfo = businessInfo
    ? normaliseBusinessInfo(businessInfo)
    : _companyInfo;
  const passed = items.filter((i) => (i.result || "PASS") !== "FAIL").length;
  const failed = items.length - passed;
  const pct = items.length ? Math.round((passed / items.length) * 100) : 0;
  const statusColor = pct >= 80 ? C.ok : pct >= 60 ? C.warn : C.danger;
  const statusLabel =
    pct >= 80 ? "Compliant" : pct >= 60 ? "Conditional" : "Non-Compliant";
  return (
    <SecPage>
      <SecHeader
        companyInfo={companyInfo}
        reportNumber={reportNumber}
        reportType={reportType}
        metaRows={[
          ["Type", "Site Inspection"],
          ["Compliance", `${pct}%`],
        ]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <InfoCell
          title="Inspector Details"
          rows={[
            ["Inspector", officerName],
            ["Badge No.", officerBadge],
            ["Date", incidentDate || today()],
          ]}
        />
        <InfoCell
          title="Site Details"
          rows={[
            ["Site Name", siteName],
            ["Address", siteAddress],
            ["Zone", siteZone],
          ]}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionBar>Inspection Checklist</SectionBar>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            fontFamily: FONT.body,
          }}
        >
          <thead>
            <tr style={{ background: C.bg4 }}>
              {[
                "Inspection Item",
                "Category",
                "Result",
                "Notes / Deficiency",
              ].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 14px",
                    textAlign: i === 0 ? "left" : "center",
                    color: C.gold,
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontSize: 9.5,
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${C.gold}`,
                    borderRight: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const result = item.result || "PASS";
              const rc =
                result === "FAIL"
                  ? C.danger
                  : result === "N/A"
                    ? C.textMuted
                    : C.ok;
              return (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? C.bg2 : C.bg3,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <td style={{ padding: "8px 14px", color: C.textPrimary }}>
                    {item.description || item.inspectionItem || "—"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 14px",
                      color: C.textSecondary,
                    }}
                  >
                    {item.category || item.qty || "General"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "8px 14px",
                      color: rc,
                      fontWeight: 700,
                    }}
                  >
                    {result === "PASS"
                      ? "✓ Pass"
                      : result === "FAIL"
                        ? "✗ Fail"
                        : result}
                  </td>
                  <td
                    style={{
                      padding: "8px 14px",
                      color: C.textMuted,
                      fontSize: 10,
                    }}
                  >
                    {item.notes || item.amount || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            border: `1px solid ${C.border}`,
            minWidth: 280,
            overflow: "hidden",
          }}
        >
          <SectionBar>Compliance Summary</SectionBar>
          <div
            style={{
              background: C.bg2,
              padding: 12,
              fontSize: 11,
              fontFamily: FONT.body,
            }}
          >
            {[
              ["Items Inspected", items.length],
              ["Passed", passed],
              ["Failed", failed],
              ["N/A", items.filter((i) => i.result === "N/A").length],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: C.textLabel, fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ fontWeight: 700, color: C.gold }}>{val}</span>
              </div>
            ))}
            <div style={{ margin: "10px 0 6px" }}>
              <div
                style={{
                  background: C.bg4,
                  height: 8,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: statusColor,
                    height: "100%",
                    width: `${pct}%`,
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: 9.5,
                  color: C.textLabel,
                  marginTop: 4,
                }}
              >
                {pct}% Compliance
              </div>
            </div>
            <div
              style={{
                background: statusColor + "22",
                border: `1px solid ${statusColor}33`,
                margin: "6px -12px -12px",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
              }}
            >
              <span style={{ color: C.textLabel }}>Overall Status</span>
              <span style={{ color: statusColor }}>{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>
      <SigStrip labels={["Inspector", "Supervisor", "Site Representative"]} />
      <BankingBlock companyInfo={companyInfo} />
      {showStamp && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <SecStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
          />
        </div>
      )}
      <SecFooter text="Site Inspection Record — Retain for Compliance & Audit Purposes" />
    </SecPage>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════
export const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const templateNames = {
    default: "Incident Report",
    classic: "Guard Patrol Report",
    modern: "Risk Assessment",
    elegant: "Executive Brief",
    speed: "Rapid Response",
    diagnostic: "Site Inspection",
  };
  return (
    <div style={{ position: "relative" }}>
      <FontImport />
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 18px",
          background: C.bg3,
          border: `1px solid ${C.border}`,
          color: C.textPrimary,
          fontFamily: FONT.body,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          letterSpacing: 0.5,
        }}
      >
        <Shield style={{ width: 14, height: 14, color: C.gold }} />
        {templateNames[selectedTemplate] || "Select Template"}
        <span style={{ marginLeft: 4, color: C.textLabel }}>▾</span>
      </button>
      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              background: C.bg3,
              border: `1px solid ${C.border}`,
              borderTop: `2px solid ${C.gold}`,
              zIndex: 20,
              minWidth: 260,
              boxShadow: "0 8px 32px #00000066",
            }}
          >
            <div
              style={{
                padding: "8px 14px 4px",
                fontFamily: FONT.body,
                fontSize: 9.5,
                color: C.textMuted,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              ◆ Report Templates
            </div>
            {Object.entries(templateNames).map(([id, name]) => (
              <button
                key={id}
                onClick={() => {
                  onTemplateChange(id);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  background: selectedTemplate === id ? C.bg4 : "transparent",
                  color: selectedTemplate === id ? C.gold : C.textPrimary,
                  fontFamily: FONT.body,
                  fontSize: 12,
                  fontWeight: selectedTemplate === id ? 600 : 400,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  letterSpacing: 0.3,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span>{name}</span>
                {selectedTemplate === id && (
                  <Check style={{ width: 13, height: 13 }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE RENDERER
// Accepts `businessInfo` (Firestore shape) OR legacy `companyInfo`.
// ═══════════════════════════════════════════════════════════════════════════
export const TemplateRenderer = ({
  templateId,
  reportType,
  businessInfo, // ← from BusinessSettingsModal / Firestore
  companyInfo, // ← legacy fallback
  stampText = "AUTHORISED",
  stampColor = C.gold,
  showStampDate = true,
  showStamp = false,
  ...props
}) => {
  const tProps = {
    ...props,
    reportType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
    businessInfo,
    companyInfo,
  };
  switch (templateId) {
    case "default":
      return <DefaultTemplate {...tProps} />;
    case "classic":
      return <ClassicTemplate {...tProps} />;
    case "modern":
      return <ModernTemplate {...tProps} />;
    case "elegant":
    case "premium":
      return <ElegantTemplate {...tProps} />;
    case "speed":
      return <SpeedTemplate {...tProps} />;
    case "diagnostic":
      return <DiagnosticTemplate {...tProps} />;
    default:
      return <DefaultTemplate {...tProps} />;
  }
};

export default TemplateSelector;
