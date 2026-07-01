import React from "react";
import { Mail, Globe, MapPin } from "lucide-react";

/**
 * RacingCornerTemplate
 * Converted from the "V8 Powered" static HTML letterhead.
 * Bold diagonal corner graphics, centered logo lockup, two-branch contact footer.
 *
 * Business identity (logo, name, address, phone) is READ-ONLY and comes
 * from the `businessInfo` prop — the same Firestore doc Business Settings
 * writes to. It is never part of `data` and never editable here.
 *
 * `data` only holds what's actually specific to *this letter*: the body
 * text. That's the only thing `onChange`/edit mode touches.
 */

export const racingCornerDefaultData = {
  bodyPage1: "",
};

const CORNER_RED = "#c41e3a";
const CORNER_DARK = "#000000";

function Corners() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 3,
          width: 130,
          height: 188,
          background: CORNER_RED,
          transform: "rotate(180deg)",
          clipPath:
            "polygon(0 0, 35% 15%, 35% 55%, 165% 145%, 162% 145%, 7% 40%, 0 45%, 0 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 2,
          width: 130,
          height: 202,
          background: CORNER_DARK,
          transform: "rotate(180deg)",
          clipPath: "polygon(0 202px, 130px 202px, 0 72px)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 3,
          width: 130,
          height: 188,
          background: CORNER_RED,
          clipPath:
            "polygon(0 0, 35% 15%, 35% 55%, 165% 145%, 162% 145%, 7% 40%, 0 45%, 0 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 2,
          width: 130,
          height: 202,
          background: CORNER_DARK,
          clipPath: "polygon(0 202px, 130px 202px, 0 72px)",
        }}
      />
    </>
  );
}

function ContactIcon({ children }) {
  return (
    <span style={{ color: CORNER_RED, flexShrink: 0, marginTop: 1 }}>
      {children}
    </span>
  );
}

/**
 * Builds the footer "branch" block(s) from businessInfo. The original
 * static design hand-authored two physical branches; businessInfo only
 * models one address, so we show that address + primary phone as one
 * branch, and add a second branch slot only if a secondary phone exists.
 */
function getBranches(businessInfo) {
  const lines = [
    businessInfo.addressLine1,
    businessInfo.addressLine2,
    businessInfo.city,
    businessInfo.postalCode,
  ].filter(Boolean);

  const branches = [
    {
      lines: lines.length ? lines : ["Address not set"],
      phone: businessInfo.primaryPhone || "",
    },
  ];

  if (businessInfo.secondaryPhone) {
    branches.push({
      lines,
      phone: businessInfo.secondaryPhone,
    });
  }

  return branches;
}

function Footer({ businessInfo }) {
  const branches = getBranches(businessInfo);
  const email = businessInfo.email || businessInfo.businessEmail || "";
  const website = businessInfo.website || "";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 86,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 28,
        padding: "0 150px 0 180px",
        zIndex: 4,
      }}
    >
      {branches.map((branch, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: 6, fontSize: 7.5, color: "#2b2b2b" }}
        >
          <ContactIcon>
            <MapPin size={11} />
          </ContactIcon>
          <span style={{ lineHeight: 1.45, width: 105 }}>
            {branch.lines.map((line, j) => (
              <React.Fragment key={j}>
                {line}
                <br />
              </React.Fragment>
            ))}
            {branch.phone}
          </span>
        </div>
      ))}
      {(email || website) && (
        <div style={{ fontSize: 7.5, color: "#2b2b2b" }}>
          {email && (
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              <ContactIcon>
                <Mail size={11} />
              </ContactIcon>
              <span>{email}</span>
            </div>
          )}
          {website && (
            <div style={{ display: "flex", gap: 6 }}>
              <ContactIcon>
                <Globe size={11} />
              </ContactIcon>
              <span>{website}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * mode: "edit" | "preview"
 * data: { bodyPage1 } — the only editable field
 * businessInfo: read-only — { businessName, logoUrl, addressLine1, addressLine2, city, postalCode, primaryPhone, secondaryPhone, email, website }
 * onChange(nextData)
 */
export default function RacingCornerTemplate({
  data,
  businessInfo = {},
  onChange,
  mode = "preview",
  page = 1,
}) {
  const isEdit = mode === "edit";
  const set = (patch) => onChange?.({ ...data, ...patch });

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "white",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <Corners />

      {page === 1 && (
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 50,
            width: 150,
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {businessInfo.logoUrl ? (
            <img
              src={businessInfo.logoUrl}
              alt={`${businessInfo.businessName || "Business"} logo`}
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                border: "1px dashed #ccc",
                borderRadius: 4,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 7,
                color: "#999",
                textAlign: "center",
              }}
            >
              No logo
            </div>
          )}
          <div
            style={{
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}
          >
            {businessInfo.businessName || "Your business name"}
          </div>
        </div>
      )}

      <div
        style={{
          padding:
            page === 1 ? "120px 60px 150px 60px" : "30px 60px 150px 60px",
          position: "relative",
          zIndex: 1,
          minHeight: "100%",
        }}
      >
        {isEdit ? (
          <textarea
            value={data.bodyPage1}
            onChange={(e) => set({ bodyPage1: e.target.value })}
            placeholder="Type your letter here..."
            style={{
              width: "100%",
              minHeight: 380,
              border: "1px dashed #ccc",
              fontFamily: "Arial, sans-serif",
              fontSize: 11,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              padding: 8,
            }}
          />
        ) : (
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 11,
              lineHeight: 1.5,
              minHeight: 380,
            }}
          >
            {data.bodyPage1 || (
              <span style={{ color: "#999" }}>Type your letter here...</span>
            )}
          </div>
        )}
      </div>

      <Footer businessInfo={businessInfo} />
    </div>
  );
}
