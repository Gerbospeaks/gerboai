import { getSubdomainFromHost } from "../utils/subdomain";
import { getIndustryConfig } from "../config/industryConfig";
 
export function useSubdomain() {
  const subdomain = getSubdomainFromHost(); // null on main domain
  const config = getIndustryConfig(subdomain);
 
  return {
    subdomain,                          // "mechanics" | null
    industry: subdomain,                // alias
    isIndustrySubdomain: !!subdomain,  // true on any industry subdomain
    config,                             // full industry config object
    // Convenience destructures from config:
    label:   config.label,
    color:   config.color,
    accent:  config.accent,
    icon:    config.icon,
    tagline: config.subheadline,
  };
}
 