// src/utils/subdomain.js
// Plain utility functions for subdomain detection — no React required.
// Import from here in both hooks and non-hook contexts.

import { getIndustryConfig } from "../config/industryConfig";

// Returns the subdomain string or null.
// e.g. "mechanics.solidflo.co.za" → "mechanics"
//      "solidflo.co.za"           → null
//      "localhost"                → null  (or ?industry= in dev — see below)
export function getSubdomainFromHost() {
  const hostname = window.location.hostname;

  // Dev override: ?industry=mechanics on localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const params = new URLSearchParams(window.location.search);
    const ind = params.get("industry");
    return ind || null;
  }

  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0].toLowerCase();
  return null;
}

// Returns true when the current host is an industry subdomain.
export function isIndustrySubdomain() {
  return !!getSubdomainFromHost();
}