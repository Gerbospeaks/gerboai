import { getIndustryConfig } from "../config/industryConfig";

export function getSubdomainFromHost() {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const params = new URLSearchParams(window.location.search);
    const ind = params.get("industry");
    return ind || null;
  }

  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") return parts[0].toLowerCase();
  return null;
}

export function isIndustrySubdomain() {
  return !!getSubdomainFromHost();
}