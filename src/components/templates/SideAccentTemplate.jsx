import React from "react";

/**
 * SideAccentTemplate
 * Converted from the "Elands Tech" static HTML letterhead.
 * Left accent rule, logo lockup top-left, right-aligned address block
 * with a thick accent border, two-column footer.
 *
 * Business identity (logo, name, address, phones, email, website) is
 * READ-ONLY and comes from the `businessInfo` prop — the same Firestore
 * doc Business Settings writes to. `data` only holds the letter body.
 */

export const sideAccentDefaultData = {
  bodyPage1: "",
};

const DEFAULT_ACCENT = "#d64f00";

function PhoneIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <path
        d="M31.342 43.173a6.323 6.323 0 0 0 0-8.942l-5.676-5.676a6.323 6.323 0 0 0-8.942 0l.01-.01-2.905 2.905c-16.851 16.851 38.547 72.248 55.398 55.398l2.905-2.905-.01.01a6.323 6.323 0 0 0 0-8.942l-5.676-5.676a6.323 6.323 0 0 0-8.942 0l-2.288 2.288c-1.84 1.84-4.768 1.96-6.78.309-6.94-5.695-13.994-12.749-19.689-19.689-1.651-2.012-1.532-4.939.309-6.78l2.286-2.29z"
        fill="none"
        stroke="#323232"
        strokeWidth="3"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M42.035 32.391c13.555 1.022 24.317 12.036 24.932 25.7"
        fill="none"
        stroke="#76a4bd"
        strokeWidth="3"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M78.352 58.092C77.72 38.139 61.88 22.025 42.035 20.977"
        fill="none"
        stroke="#76a4bd"
        strokeWidth="3"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
      <path
        d="M89.325 58.092C88.684 32.079 67.941 11.063 42.035 10"
        fill="none"
        stroke="#76a4bd"
        strokeWidth="3"
        strokeLinecap="round"
        strokeMiterlimit="10"
      />
    </svg>
  );
}

function getAddressLines(businessInfo) {
  const lines = [
    businessInfo.addressLine1,
    businessInfo.addressLine2,
    [businessInfo.city, businessInfo.postalCode].filter(Boolean).join(", "),
  ].filter(Boolean);
  return lines.length ? lines : ["Address not set"];
}

function getPhones(businessInfo) {
  return [businessInfo.primaryPhone, businessInfo.secondaryPhone].filter(
    Boolean,
  );
}

/**
 * data: { bodyPage1 } — the only editable field
 * businessInfo: read-only — { businessName, logoUrl, addressLine1, addressLine2, city, postalCode, primaryPhone, secondaryPhone, email, website }
 * onChange(nextData)
 */
export default function SideAccentTemplate({
  data,
  businessInfo = {},
  onChange,
  mode = "preview",
  page = 1,
}) {
  const isEdit = mode === "edit";
  const set = (patch) => onChange?.({ ...data, ...patch });

  const accentColor = DEFAULT_ACCENT;
  const addressLines = getAddressLines(businessInfo);
  const phones = getPhones(businessInfo);
  const email = businessInfo.email || businessInfo.businessEmail || "";
  const website = businessInfo.website || "";

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "white",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        padding: "20mm",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "15mm",
          top: 0,
          bottom: 0,
          width: 2,
          background: accentColor,
          zIndex: 0,
        }}
      />

      {page === 1 && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "15mm",
            paddingBottom: "5mm",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "60mm",
              height: "20mm",
            }}
          >
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt={`${businessInfo.businessName || "Business"} logo`}
                style={{
                  maxWidth: "40mm",
                  maxHeight: "20mm",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  width: "20mm",
                  height: "16mm",
                  border: "1px dashed #ccc",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7,
                  color: "#999",
                  flexShrink: 0,
                }}
              >
                No logo
              </div>
            )}
            <div style={{ fontWeight: "bold", fontSize: 11 }}>
              {businessInfo.businessName || "Your business name"}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              paddingRight: 10,
              textAlign: "right",
              borderRight: `10px solid ${accentColor}`,
              flexShrink: 0,
            }}
          >
            {addressLines.map((line, i) => (
              <div key={i} style={{ margin: "3px 0", fontSize: 11 }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: page === 1 ? "227mm" : "247mm",
          paddingTop: page === 1 ? 0 : 40,
          paddingBottom: 60,
        }}
      >
        {isEdit ? (
          <textarea
            value={data.bodyPage1}
            onChange={(e) => set({ bodyPage1: e.target.value })}
            placeholder="Type your letter here..."
            style={{
              width: "100%",
              minHeight: 500,
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
              minHeight: 500,
            }}
          >
            {data.bodyPage1 || (
              <span style={{ color: "#999" }}>Type your letter here...</span>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "15mm",
          left: "20mm",
          right: "20mm",
          paddingTop: "5mm",
          borderTop: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          fontSize: 10,
          background: "white",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PhoneIcon />
          <span>{phones.length ? phones.join(" | ") : "Phone not set"}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>{email || "Email not set"}</div>
          {website && <div>{website}</div>}
        </div>
      </div>
    </div>
  );
}
