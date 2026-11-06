export function getSubdomainFromHost() {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const params = new URLSearchParams(window.location.search);
    const ind = params.get("industry");
    return ind || null;
  }

  const BASE_DOMAIN = "gerboai.com";

  // Exact match or www → no subdomain
  if (hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`) {
    return null;
  }

  // Anything else ending in .gerboai.com → strip the suffix to get the subdomain
  if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    return hostname.slice(0, -(`.${BASE_DOMAIN}`.length)).toLowerCase();
  }

  return null;
}