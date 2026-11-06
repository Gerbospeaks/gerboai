
export function injectDynamicManifest(subdomain) {
  const manifest = {
    name: `Solid Flo – ${subdomain}`,
    short_name: "GerboAI",
    start_url: `https://${subdomain}.gerboai.com/login`,
    scope: `https://${subdomain}.gerboai.com/`,
    display: "standalone",
    background_color: "#f8f9fc",
    theme_color: "#1655e0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  // Remove any existing manifest link
  const existing = document.querySelector("link[rel='manifest']");
  if (existing) existing.remove();

  // Inject a blob URL as the manifest
  const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = url;
  document.head.appendChild(link);
}