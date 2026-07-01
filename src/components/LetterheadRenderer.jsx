import React from "react";
import RacingCornerTemplate, {
  racingCornerDefaultData,
} from "./templates/RacingCornerTemplate";
import SideAccentTemplate, {
  sideAccentDefaultData,
} from "./templates/SideAccentTemplate";

// ─── Registry ───────────────────────────────────────────────────────────────
// One place that knows every letterhead template: its component, its
// display name, and the shape of data it expects. Adding a new template
// later means adding one entry here.

export const LETTERHEAD_TEMPLATE_NAMES = {
  racing: "Racing Corner",
  accent: "Side Accent",
};

export const LETTERHEAD_DEFAULT_DATA = {
  racing: racingCornerDefaultData,
  accent: sideAccentDefaultData,
};

const COMPONENTS = {
  racing: RacingCornerTemplate,
  accent: SideAccentTemplate,
};

/**
 * LetterheadRenderer
 * templateId: key into LETTERHEAD_TEMPLATE_NAMES
 * data: the editable content for that template (see *DefaultData exports) —
 *       this is letter-specific content only (currently just the body text)
 * businessInfo: READ-ONLY business identity (logo, name, address, phones,
 *       email, website) sourced from users/{uid}/settings/businessInfo —
 *       the same doc Business Settings writes to. Never editable here.
 * onChange(nextData): called whenever the user edits a field (mode="edit")
 * mode: "edit" | "preview"
 * page: 1 | 2 — lets the parent show page 2 of a letter if content overflows
 */
export default function LetterheadRenderer({
  templateId,
  data,
  businessInfo = {},
  onChange,
  mode = "preview",
  page = 1,
}) {
  const Component = COMPONENTS[templateId] ?? RacingCornerTemplate;
  const safeData = data ?? LETTERHEAD_DEFAULT_DATA[templateId] ?? racingCornerDefaultData;

  return (
    <Component
      data={safeData}
      businessInfo={businessInfo}
      onChange={onChange}
      mode={mode}
      page={page}
    />
  );
}