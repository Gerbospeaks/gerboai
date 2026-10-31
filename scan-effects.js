// Usage: node scan-effects.js src
const fs = require("fs"), path = require("path");
function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (f.name !== "node_modules") walk(p, out); }
    else if (/\.(jsx?|tsx?)$/.test(f.name)) out.push(p);
  }
  return out;
}
function findClose(s, i) { // i = index of "(" ; returns index of matching ")"
  let depth = 0, q = null;
  for (; i < s.length; i++) {
    const c = s[i], n = s[i + 1];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === "/" && n === "/") { i = s.indexOf("\n", i); if (i < 0) return -1; continue; }
    if (c === "/" && n === "*") { i = s.indexOf("*/", i) + 1; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) { depth--; if (depth === 0) return i; }
  }
  return -1;
}
function topLevelArgs(body) {
  const args = []; let depth = 0, q = null, last = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (c === "," && depth === 0) { args.push(body.slice(last, i)); last = i + 1; }
  }
  const tail = body.slice(last).trim(); if (tail) args.push(tail);
  return args;
}
function stripComments(s) { // blank out comments, keep line breaks and offsets
  let out = "", q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1];
    if (q) { out += c; if (c === "\\") { out += s[++i] || ""; } else if (c === q) q = null; continue; }
    if (c === "/" && n === "/") { while (i < s.length && s[i] !== "\n") { out += " "; i++; } i--; continue; }
    if (c === "/" && n === "*") { const e = s.indexOf("*/", i + 2); const end = e < 0 ? s.length : e + 2;
      for (; i < end; i++) out += s[i] === "\n" ? "\n" : " "; i--; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    out += c;
  }
  return out;
}
let hits = 0;
for (const file of walk(process.argv[2] || "src")) {
  const raw = fs.readFileSync(file, "utf8"), s = stripComments(raw);
  const re = /\buse(?:Layout)?Effect\s*\(/g; let m;
  while ((m = re.exec(s))) {
    const open = m.index + m[0].length - 1, close = findClose(s, open);
    if (close < 0) continue;
    const inner = s.slice(open + 1, close), args = topLevelArgs(inner);
    const line = s.slice(0, m.index).split("\n").length;
    const setters = [...new Set((args[0] || "").match(/\bset[A-Z]\w*(?=\s*\()/g) || [])];
    if (args.length >= 2 && setters.length) {
      const self = setters.filter((st) => {
        const v = st[3].toLowerCase() + st.slice(4);
        return new RegExp("\\b" + v + "\\b").test(args[1]);
      });
      if (self.length) { hits++; console.log(`SELF-DEPENDENT      ${file}:${line}  deps=${args[1].trim().slice(0,60)}  sets: ${self.join(", ")}`); }
    }
    if (args.length === 1 && setters.length) { hits++; console.log(`NO DEPS + setState  ${file}:${line}  -> ${setters.join(", ")}`); }
    else if (args.length >= 2 && setters.length && /^\s*\[[^\]]*(\{|\[|=>|\bnew\b)/.test(args[1]))
      { hits++; console.log(`UNSTABLE DEPS       ${file}:${line}  deps=${args[1].trim().slice(0,60)}  -> ${setters.join(", ")}`); }
  }
}
console.log(hits ? `\n${hits} suspect effect(s) found.` : "\nNo suspects found.");