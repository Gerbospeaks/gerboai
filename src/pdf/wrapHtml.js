export function wrapHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Ensure Tailwind print classes work in html2pdf */
    @media print { .print\\:hidden { display: none !important; } }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>${body}</body>
</html>`;
}