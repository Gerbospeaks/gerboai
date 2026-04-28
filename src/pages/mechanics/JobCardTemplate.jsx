import React from "react";

/**
 * JobCardTemplate.jsx
 * Pure workshop job card — NO totals, NO invoice feel.
 *
 * Sections:
 *   1. Header (business + job card number)
 *   2. Customer / Vehicle / Assignment cards
 *   3. Customer complaint + Problems observed
 *   4. Diagnosis + Work performed
 *   5. Parts required table
 *   6. Vehicle condition checklist (Exterior, Lights, Tyres, Under Bonnet, Brakes, Interior)
 *   7. Authorisation / sign-off
 *
 * Props:
 *   jobCardNumber, businessInfo, customer, vehicle,
 *   technicianName, bayNumber, estimatedHours,
 *   faultDescription, diagnosisNotes, workPerformed,
 *   problemsObserved  (string),
 *   partsRequired     ([{ description, partNumber, qty }]),
 *   vehicleChecklist  ({ [key]: "ok"|"attention"|"replace"|"" }),
 *   customerApproved, logoBase64, sourceQuoteNumber
 */

// ── Vehicle checklist structure ──────────────────────────────────────────────
const CHECKLIST = {
  exterior: {
    color: "#3b82f6",
    label: "Exterior & Glass",
    items: [
      { key: "windscreen", label: "Windscreen / Glass" },
      { key: "wipers", label: "Wiper Blades" },
      { key: "body_left", label: "Body Panels — Left" },
      { key: "body_right", label: "Body Panels — Right" },
      { key: "bumpers", label: "Bumpers" },
      { key: "mirrors", label: "Side Mirrors" },
    ],
  },
  lights: {
    color: "#f59e0b",
    label: "Lights",
    items: [
      { key: "headlights", label: "Headlights" },
      { key: "taillights", label: "Tail / Brake Lights" },
      { key: "indicators", label: "Indicators" },
      { key: "reverse", label: "Reverse Light" },
      { key: "hazards", label: "Hazard Lights" },
    ],
  },
  tyres: {
    color: "#10b981",
    label: "Tyres",
    items: [
      { key: "tyre_fl", label: "Front Left" },
      { key: "tyre_fr", label: "Front Right" },
      { key: "tyre_rl", label: "Rear Left" },
      { key: "tyre_rr", label: "Rear Right" },
      { key: "spare", label: "Spare Tyre" },
    ],
  },
  underbonnet: {
    color: "#f97316",
    label: "Under Bonnet",
    items: [
      { key: "engine_oil", label: "Engine Oil" },
      { key: "coolant", label: "Coolant Level" },
      { key: "brake_fluid", label: "Brake Fluid" },
      { key: "power_steering", label: "Power Steering Fluid" },
      { key: "washer_fluid", label: "Washer Fluid" },
      { key: "battery", label: "Battery Condition" },
      { key: "belts", label: "Belts & Hoses" },
      { key: "air_filter", label: "Air Filter" },
    ],
  },
  brakes: {
    color: "#ef4444",
    label: "Brakes",
    items: [
      { key: "brake_pads_f", label: "Brake Pads — Front" },
      { key: "brake_pads_r", label: "Brake Pads — Rear" },
      { key: "brake_discs_f", label: "Brake Discs — Front" },
      { key: "brake_discs_r", label: "Brake Discs — Rear" },
      { key: "handbrake", label: "Handbrake" },
    ],
  },
  interior: {
    color: "#8b5cf6",
    label: "Interior",
    items: [
      { key: "seatbelts", label: "Seatbelts" },
      { key: "airbag_light", label: "Airbag Warning Light" },
      { key: "dash_lights", label: "Dashboard Warnings" },
      { key: "horn", label: "Horn" },
      { key: "ac", label: "Air Conditioning" },
    ],
  },
};

// ── Tick box component (inline SVG — no emoji needed) ───────────────────────
const Tick = ({ status }) => {
  const cfg = {
    ok: { border: "#059669", bg: "#059669", symbol: "✓", color: "#fff" },
    attention: { border: "#d97706", bg: "#fbbf24", symbol: "!", color: "#fff" },
    replace: { border: "#dc2626", bg: "#dc2626", symbol: "✕", color: "#fff" },
    "": { border: "#d1d5db", bg: "#fff", symbol: "", color: "#fff" },
  };
  const c = cfg[status] || cfg[""];
  return (
    <div
      style={{
        width: "13px",
        height: "13px",
        border: `1.5px solid ${c.border}`,
        borderRadius: "3px",
        background: c.bg,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {c.symbol && (
        <span
          style={{
            color: c.color,
            fontSize: "8px",
            fontWeight: "900",
            lineHeight: 1,
          }}
        >
          {c.symbol}
        </span>
      )}
    </div>
  );
};

const JobCardTemplate = ({
  jobCardNumber = "JC-2026-0001",
  businessInfo = {},
  customer = {},
  vehicle = {},
  technicianName = "",
  bayNumber = "",
  estimatedHours = "",
  faultDescription = "",
  diagnosisNotes = "",
  workPerformed = "",
  problemsObserved = "",
  partsRequired = [],
  vehicleChecklist = {},
  customerApproved = false,
  logoBase64 = "",
  sourceQuoteNumber = "",
}) => {
  const today = new Date().toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ── Style tokens ───────────────────────────────────────────────────────────
  const font = "'Segoe UI', Arial, sans-serif";
  const navy = "#0f172a";
  const slate = "#64748b";
  const border = "#e2e8f0";
  const bg = "#f8fafc";
  const orange = "#f97316";

  const base = {
    fontFamily: font,
    fontSize: "10px",
    color: "#1a1a2e",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  };

  // Reusable builders
  const card = (headBg, dotColor, title, children) => (
    <div
      style={{
        border: `1px solid ${border}`,
        borderRadius: "7px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: headBg,
          padding: "5px 11px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <div
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "8px",
            fontWeight: "700",
            color: "#fff",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "9px 11px", background: "#fff" }}>{children}</div>
    </div>
  );

  const fieldRow = (label, value, last = false) => (
    <div
      key={label}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: "4px",
        marginBottom: last ? 0 : "4px",
        borderBottom: last ? "none" : "1px dashed #f1f5f9",
      }}
    >
      <span
        style={{
          fontSize: "8px",
          color: slate,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          flexShrink: 0,
          marginRight: "6px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "9.5px",
          color: "#1e293b",
          fontWeight: "500",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );

  const sectionHead = (title, right = null) => (
    <div
      style={{
        fontSize: "8px",
        fontWeight: "800",
        color: orange,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        marginBottom: "7px",
        marginTop: "13px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
      }}
    >
      <span>{title}</span>
      <div style={{ flex: 1, height: "1px", background: border }} />
      {right}
    </div>
  );

  const writeBox = (content) =>
    content ? (
      <div
        style={{
          border: `1px solid ${border}`,
          borderRadius: "5px",
          minHeight: "44px",
          padding: "7px 9px",
          background: "#fafafa",
          fontSize: "9.5px",
          color: "#1e293b",
          lineHeight: "1.55",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    ) : (
      <div
        style={{
          border: "1px dashed #cbd5e1",
          borderRadius: "5px",
          minHeight: "44px",
          padding: "7px 9px",
          background: "#fafafa",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ height: "1px", background: border, marginBottom: "10px" }}
          />
        ))}
      </div>
    );

  const badge = (bg2, color, text) => (
    <span
      style={{
        background: bg2,
        color,
        fontSize: "8px",
        fontWeight: "700",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: "99px",
      }}
    >
      {text}
    </span>
  );

  // ── Checklist section ──────────────────────────────────────────────────────
  const CheckSection = ({ sectionKey }) => {
    const sec = CHECKLIST[sectionKey];
    return (
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "8px",
            fontWeight: "700",
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "3px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: sec.color,
              flexShrink: 0,
            }}
          />
          {sec.label}
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9.5px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#f1f5f9",
                  padding: "4px 6px",
                  fontSize: "7.5px",
                  fontWeight: "700",
                  color: slate,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderBottom: `1.5px solid ${border}`,
                  textAlign: "left",
                }}
              >
                Item
              </th>
              {["OK", "Attention", "Replace"].map((h) => (
                <th
                  key={h}
                  style={{
                    background: "#f1f5f9",
                    padding: "4px 6px",
                    fontSize: "7.5px",
                    fontWeight: "700",
                    color: slate,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: `1.5px solid ${border}`,
                    textAlign: "center",
                    width: "58px",
                  }}
                >
                  {h}
                </th>
              ))}
              <th
                style={{
                  background: "#f1f5f9",
                  padding: "4px 6px",
                  fontSize: "7.5px",
                  fontWeight: "700",
                  color: slate,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderBottom: `1.5px solid ${border}`,
                  textAlign: "left",
                  width: "88px",
                }}
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {sec.items.map((item) => {
              const st = vehicleChecklist?.[item.key] ?? "";
              return (
                <tr key={item.key}>
                  <td
                    style={{
                      padding: "4px 6px",
                      borderBottom: `1px solid #f1f5f9`,
                      color: "#374151",
                    }}
                  >
                    {item.label}
                  </td>
                  <td
                    style={{
                      padding: "4px 6px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                    }}
                  >
                    <Tick status={st === "ok" ? "ok" : ""} />
                  </td>
                  <td
                    style={{
                      padding: "4px 6px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                    }}
                  >
                    <Tick status={st === "attention" ? "attention" : ""} />
                  </td>
                  <td
                    style={{
                      padding: "4px 6px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                    }}
                  >
                    <Tick status={st === "replace" ? "replace" : ""} />
                  </td>
                  <td
                    style={{
                      padding: "4px 6px",
                      borderBottom: `1px solid #f1f5f9`,
                    }}
                  >
                    <div
                      style={{
                        borderBottom: `1px solid ${border}`,
                        height: "14px",
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Empty checkbox cell (parts table) ─────────────────────────────────────
  const emptyCheck = (
    <div
      style={{
        width: "13px",
        height: "13px",
        border: `1.5px solid #d1d5db`,
        borderRadius: "3px",
        background: "#fff",
        margin: "0 auto",
      }}
    />
  );

  return (
    <div
      style={{
        ...base,
        width: "210mm",
        minHeight: "297mm",
        background: "#fff",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: navy,
          padding: "16px 22px 13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              background: "#1e293b",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {logoBase64 || businessInfo.logoUrl ? (
              <img
                src={logoBase64 || businessInfo.logoUrl}
                alt="logo"
                style={{ width: "38px", height: "38px", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  background: "#334155",
                  borderRadius: "6px",
                }}
              />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#fff",
                letterSpacing: "0.02em",
                marginBottom: "2px",
              }}
            >
              {businessInfo.businessName || "Workshop"}
            </div>
            <div style={{ fontSize: "9px", color: "#94a3b8" }}>
              {[businessInfo.addressLine1, businessInfo.city]
                .filter(Boolean)
                .join(" · ")}
            </div>
            <div style={{ fontSize: "9px", color: "#94a3b8" }}>
              {[businessInfo.primaryPhone, businessInfo.secondaryPhone]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: "700",
              color: orange,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}
          >
            Workshop Job Card
          </div>
          <div
            style={{
              fontSize: "19px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "0.03em",
            }}
          >
            {jobCardNumber}
          </div>
          <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>
            {today}
          </div>
        </div>
      </div>

      {/* Orange accent */}
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg,${orange} 0%,#fb923c 55%,${navy} 100%)`,
        }}
      />

      {/* ── STATUS ROW ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: bg,
          borderBottom: `1px solid ${border}`,
          padding: "7px 22px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {badge(navy, "#fff", "Job Card")}
        {bayNumber && badge("#fef3c7", "#92400e", bayNumber)}
        {technicianName && badge("#eff6ff", "#1d4ed8", technicianName)}
        {badge(
          customerApproved ? "#dcfce7" : "#ffedd5",
          customerApproved ? "#166534" : "#9a3412",
          customerApproved ? "Customer Approved" : "Pending Approval",
        )}
        {sourceQuoteNumber && (
          <span style={{ marginLeft: "auto", fontSize: "9px", color: slate }}>
            Quote: <strong>{sourceQuoteNumber}</strong>
          </span>
        )}
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 22px" }}>
        {/* ── Customer / Vehicle / Assignment ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 0.9fr",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {card(
            "#1e3a5f",
            "#38bdf8",
            "Customer",
            <>
              {[
                ["Name", customer.name],
                ["Phone", customer.phone],
                ["Email", customer.email],
                ["Address", customer.address],
              ]
                .filter(([, v]) => v)
                .map(([l, v], i, arr) => fieldRow(l, v, i === arr.length - 1))}
            </>,
          )}

          {card(
            "#1a3d2b",
            "#34d399",
            "Vehicle",
            <>
              {[
                [
                  "Make / Model",
                  `${vehicle.make || ""} ${vehicle.model || ""}`.trim(),
                ],
                ["Year", vehicle.year],
                ["Reg No.", vehicle.registration],
                ["VIN", vehicle.vin],
                ["Mileage", vehicle.mileage ? `${vehicle.mileage} km` : ""],
                ["Pre-Auth", vehicle.preAuth],
                ["Auth Code", vehicle.authCode],
              ]
                .filter(([, v]) => v)
                .map(([l, v], i, arr) => fieldRow(l, v, i === arr.length - 1))}
            </>,
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {card(
              "#3d1f00",
              orange,
              "Assigned To",
              <>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#1e293b",
                    marginBottom: "5px",
                  }}
                >
                  {technicianName || (
                    <span style={{ color: "#cbd5e1" }}>Unassigned</span>
                  )}
                </div>
                {fieldRow(
                  "Bay",
                  <span style={{ fontWeight: "700", color: orange }}>
                    {bayNumber || "—"}
                  </span>,
                )}
                {fieldRow(
                  "Est. Hours",
                  <span style={{ fontWeight: "700", color: "#7c3aed" }}>
                    {estimatedHours || "—"}
                  </span>,
                  true,
                )}
              </>,
            )}
            {card(
              "#1e293b",
              "#f472b6",
              "Dates",
              <>
                {fieldRow("Date In", today)}
                {fieldRow(
                  "Date Out",
                  <span style={{ color: "#cbd5e1" }}>____________</span>,
                  true,
                )}
              </>,
            )}
          </div>
        </div>

        {/* ── Fault & Problems Observed ── */}
        {sectionHead("Fault & Problems Observed")}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: slate,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Customer Complaint
            </div>
            {writeBox(faultDescription)}
          </div>
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: slate,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Problems Observed by Technician
            </div>
            {writeBox(problemsObserved)}
          </div>
        </div>

        {/* ── Diagnosis & Work Performed ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: slate,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Technician Diagnosis
            </div>
            {writeBox(diagnosisNotes)}
          </div>
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: "700",
                color: slate,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "5px",
              }}
            >
              Work Performed
            </div>
            {writeBox(workPerformed)}
          </div>
        </div>

        {/* ── Parts Required ── */}
        {sectionHead("Parts Required")}
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: "7px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9.5px",
            }}
          >
            <thead>
              <tr>
                {[
                  ["#", "28px", "left"],
                  ["Part Description", "", "left"],
                  ["Part Number", "90px", "left"],
                  ["Qty", "36px", "center"],
                  ["Supplied", "68px", "center"],
                  ["Fitted", "68px", "center"],
                ].map(([h, w, align]) => (
                  <th
                    key={h}
                    style={{
                      background: navy,
                      padding: "5px 8px",
                      fontSize: "8px",
                      fontWeight: "700",
                      color: "#cbd5e1",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      borderBottom: "none",
                      textAlign: align,
                      ...(w ? { width: w } : {}),
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(partsRequired.length > 0
                ? partsRequired
                : [{}, {}, {}, {}, {}]
              ).map((part, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      color: "#94a3b8",
                      fontWeight: "600",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      color: "#374151",
                    }}
                  >
                    {part.description || (
                      <div
                        style={{
                          borderBottom: `1px solid ${border}`,
                          height: "14px",
                        }}
                      />
                    )}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      color: slate,
                    }}
                  >
                    {part.partNumber || (
                      <div
                        style={{
                          borderBottom: `1px solid ${border}`,
                          height: "14px",
                        }}
                      />
                    )}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {part.qty || (
                      <div
                        style={{
                          borderBottom: `1px solid ${border}`,
                          height: "14px",
                          width: "24px",
                          margin: "0 auto",
                        }}
                      />
                    )}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                    }}
                  >
                    {emptyCheck}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      borderBottom: `1px solid #f1f5f9`,
                      textAlign: "center",
                    }}
                  >
                    {emptyCheck}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Vehicle Condition Checklist ── */}
        {sectionHead("Vehicle Condition Checklist")}

        {/* Legend */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "8px",
          }}
        >
          {[
            {
              status: "ok",
              symbol: "✓",
              border: "#059669",
              bg: "#059669",
              label: "OK",
            },
            {
              status: "attention",
              symbol: "!",
              border: "#d97706",
              bg: "#fbbf24",
              label: "Attention",
            },
            {
              status: "replace",
              symbol: "✕",
              border: "#dc2626",
              bg: "#dc2626",
              label: "Replace",
            },
          ].map(({ symbol, border: b, bg: bg2, label }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <div
                style={{
                  width: "13px",
                  height: "13px",
                  border: `1.5px solid ${b}`,
                  borderRadius: "3px",
                  background: bg2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: "8px",
                    fontWeight: "900",
                    lineHeight: 1,
                  }}
                >
                  {symbol}
                </span>
              </div>
              <span
                style={{
                  fontSize: "8.5px",
                  color: "#475569",
                  fontWeight: "600",
                }}
              >
                {label}
              </span>
            </div>
          ))}
          <span
            style={{ fontSize: "8px", color: "#94a3b8", marginLeft: "auto" }}
          >
            Technician must tick every item on vehicle arrival
          </span>
        </div>

        {/* Two-column checklist grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <CheckSection sectionKey="exterior" />
            <CheckSection sectionKey="lights" />
            <CheckSection sectionKey="interior" />
          </div>
          <div>
            <CheckSection sectionKey="tyres" />
            <CheckSection sectionKey="underbonnet" />
            <CheckSection sectionKey="brakes" />
          </div>
        </div>

        {/* ── Authorisation ── */}
        {sectionHead(
          "Authorisation & Sign-off",
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "99px",
              border: `2px solid ${customerApproved ? "#059669" : orange}`,
              color: customerApproved ? "#059669" : orange,
              fontWeight: "800",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {customerApproved ? "✓ Approved" : "Pending"}
          </div>,
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "18px",
            marginTop: "4px",
          }}
        >
          {[
            { label: "Customer Signature", name: customer.name || "" },
            { label: "Technician Signature", name: technicianName },
            { label: "Authorised By", name: "" },
          ].map(({ label, name }) => (
            <div
              key={label}
              style={{ borderTop: `2px solid ${navy}`, paddingTop: "7px" }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: slate,
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "22px",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "#1e293b",
                  fontWeight: "600",
                }}
              >
                {name || "\u00a0"}
              </div>
            </div>
          ))}
        </div>

        {/* Terms note */}
        <div
          style={{
            marginTop: "12px",
            padding: "7px 11px",
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "5px",
            fontSize: "8.5px",
            color: slate,
            lineHeight: "1.55",
          }}
        >
          <strong style={{ color: "#374151" }}>Important: </strong>
          This job card is a workshop work-instruction document only — it does{" "}
          <strong>not</strong> constitute a tax invoice. A separate invoice will
          be issued upon completion. By signing above, the customer authorises
          all work described on this card. All parts supplied carry a 90-day
          warranty.
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: navy,
          padding: "9px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "18px",
        }}
      >
        <span style={{ fontSize: "8.5px", color: slate }}>
          {businessInfo.businessName} · {businessInfo.primaryPhone}
        </span>
        <span style={{ fontSize: "8.5px", color: slate }}>
          {jobCardNumber} · {today}
        </span>
        <span
          style={{
            fontSize: "8.5px",
            color: orange,
            fontWeight: "700",
            letterSpacing: "0.1em",
          }}
        >
          WORKSHOP JOB CARD
        </span>
      </div>
    </div>
  );
};

export default JobCardTemplate;
