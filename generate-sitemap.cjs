/**
 * generate-sitemap.cjs
 * Place this file in your project ROOT (same folder as package.json)
 * Run: node generate-sitemap.cjs
 */

const { writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

const MAIN_URL   = "https://solidflo.co.za";
const MARKET_URL = "https://market.solidflo.co.za";
const TODAY      = new Date().toISOString().split("T")[0];

const INDUSTRY_SLUGS = [
  "mechanics", "electrical", "carpentry", "plumbing", "logistics",
  "construction", "accounting", "cleaning", "education", "health",
  "hospitality", "hvac", "landscaping", "legal", "painting",
  "pest-control", "photography", "pool", "realestate", "restaurants",
  "retail", "security", "solar", "towing", "welding", "flooring", "windows",
];

const MAIN_PAGES = [
  { loc: "/",        priority: "1.0", changefreq: "weekly"  },
  { loc: "/about",   priority: "0.6", changefreq: "monthly" },
  { loc: "/contact", priority: "0.6", changefreq: "monthly" },
  { loc: "/blogs",   priority: "0.7", changefreq: "weekly"  },
  { loc: "/privacy", priority: "0.3", changefreq: "yearly"  },
  { loc: "/terms",   priority: "0.3", changefreq: "yearly"  },
];

const MARKET_PAGES = [
  { loc: "/", priority: "0.9", changefreq: "daily" },
  ...INDUSTRY_SLUGS.map((slug) => ({
    loc: `/${slug}`, priority: "0.8", changefreq: "weekly",
  })),
];

function buildXml(baseUrl, pages) {
  const urls = pages.map(({ loc, priority, changefreq }) =>
    `  <url>\n    <loc>${baseUrl}${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${urls}\n\n</urlset>\n`;
}

// Make sure public/ folder exists
const publicDir = path.join(__dirname, "public");
if (!existsSync(publicDir)) mkdirSync(publicDir);

writeFileSync(path.join(publicDir, "sitemap.xml"),        buildXml(MAIN_URL,   MAIN_PAGES));
writeFileSync(path.join(publicDir, "market-sitemap.xml"), buildXml(MARKET_URL, MARKET_PAGES));

console.log("✅ Done!");
console.log("   public/sitemap.xml        →", MAIN_PAGES.length, "pages");
console.log("   public/market-sitemap.xml →", MARKET_PAGES.length, "pages");
console.log("\nSubmit to Google Search Console:");
console.log("   https://solidflo.co.za/sitemap.xml");
console.log("   https://market.solidflo.co.za/market-sitemap.xml");
