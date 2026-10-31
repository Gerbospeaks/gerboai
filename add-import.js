const fs = require("fs");
const path = require("path");
const pages = path.join(__dirname, "src", "pages");
const IMPORT =
  'import { useCurrency, resolveCurrency, formatMoney, convert } from "../../contexts/CurrencyContext";\n';

for (const dir of fs.readdirSync(pages)) {
  const file = path.join(pages, dir, "Templates.jsx");
  if (!fs.existsSync(file)) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("convert(") || src.includes("contexts/CurrencyContext")) continue;
  src = src.replace(/^(import .*\n)(?![\s\S]*^import )/m, "$1" + IMPORT);
  fs.writeFileSync(file, src);
  console.log("updated", file);
}