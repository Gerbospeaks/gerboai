const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pagesDir = path.join(root, "src", "pages");
const ctxFile = path.join(root, "src", "contexts", "CurrencyContext");
const NAMES = ["useCurrency", "resolveCurrency", "formatMoney", "convert"];

if (!fs.existsSync(pagesDir)) {
  console.error("Can't find", pagesDir, "- run this from the project root.");
  process.exit(1);
}

let fixed = 0;
for (const dir of fs.readdirSync(pagesDir)) {
  const file = path.join(pagesDir, dir, "Templates.jsx");
  if (!fs.existsSync(file)) continue;

  let src = fs.readFileSync(file, "utf8");
  const used = NAMES.filter((n) => new RegExp("\\b" + n + "\\s*\\(").test(src));
  if (!used.length) continue;

  // Correct relative path for this file
  let rel = path.relative(path.dirname(file), ctxFile).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;

  // Collect and remove any existing imports from the context
  const have = new Set(used);
  src = src.replace(
    /import\s*\{([^}]*)\}\s*from\s*["'][^"']*contexts\/CurrencyContext["'];?[ \t]*\r?\n?/g,
    (_, names) => {
      names.split(",").map((s) => s.trim()).filter(Boolean).forEach((n) => have.add(n));
      return "";
    }
  );

  const line = `import { ${[...have].join(", ")} } from "${rel}";\n`;
  fs.writeFileSync(file, line + src);
  fixed++;
  console.log("fixed", path.relative(root, file), "->", [...have].join(", "));
}
console.log(`Done. ${fixed} file(s) changed.`);