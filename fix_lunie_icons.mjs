import { readFile, writeFile } from "node:fs/promises";
const p = "E:/Downloads/lunie/src/components/Profile.tsx";
const raw = await readFile(p, "utf8");
const crlf = raw.includes("\r\n");
let t = raw.replace(/\r\n/g, "\n");
let n = 0;
for (const icon of ["CrownSimple", "PersonSimple", "Palette"]) {
  const from = `<${icon} size={22} className="text-shadow"`;
  const to = `<${icon} size={22} className="text-fg-subtle"`;
  if (t.includes(from)) { t = t.replace(from, to); n++; }
}
await writeFile(p, crlf ? t.replace(/\n/g, "\r\n") : t, "utf8");
console.log(`  lunie: ${n}/3 icons fixed`);
const check = await readFile(p, "utf8");
console.log(`  remaining text-shadow in Profile: ${(check.match(/text-shadow/g) ?? []).length}`);
