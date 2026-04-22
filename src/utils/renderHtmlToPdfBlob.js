// utils/renderHtmlToPdfBlob.js
export async function renderHtmlToPdfBlob(html, filename = "document.pdf") {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import("html2pdf.js")).default;

  // Mount a hidden container
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:210mm;";
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for Tailwind CDN to load & apply styles
  await new Promise((r) => setTimeout(r, 800));

  const blob = await html2pdf()
    .set({
      margin: [10, 10, 10, 10], // mm
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .outputPdf("blob");

  document.body.removeChild(container);
  return blob;
}
