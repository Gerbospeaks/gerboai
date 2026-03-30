export function getSubdomain() {
  const host = window.location.hostname; // e.g. "mechanics.solidflo.co.za"
  const parts = host.split('.');
  
  // If subdomain exists (more than 2 parts)
  if (parts.length >= 3) {
    return parts[0]; // returns "mechanics", "healthcare", etc.
  }
  
  return null; // main domain, no subdomain
}