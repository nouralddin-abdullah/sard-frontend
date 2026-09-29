// Checks that the published legal texts are the owner's texts, unchanged. Each file in src/content/legal/ must be, byte
// for byte, its source file in the sard-app repo (docs/store/, written and reviewed with the owner) up to the heading of
// the questions-for-the-owner section, which is not published. Also checks that the pages (legalDisplayText) leave out
// nothing but the two rules (---) that closed the text off from that section.
//
//   npm run check:legal -- <folder with the source files>      (e.g. ../sard-app/docs/store)
//
// Published from sard-app commit 298ea60 (branch claude/beautiful-goodall-m3r4zp). A new version of a text: copy the
// source file over the published one, delete everything from that heading to the end, and run this check.

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_PAGES, legalDisplayText } from "../src/utils/legal-pages.js";

const PUBLISHED = fileURLToPath(new URL("../src/content/legal/", import.meta.url));
const FILES = LEGAL_PAGES.map((page) => page.file);
const CUT = "## أسئلة للمالك (احذف هذا القسم قبل النشر)";

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error("Usage: npm run check:legal -- <folder with the source files, e.g. ../sard-app/docs/store>");
  process.exit(2);
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lineAt = (bytes, offset) => bytes.subarray(0, offset).toString("utf8").split("\n").length;

let failures = 0;
const fail = (file, message) => {
  failures += 1;
  console.error(`FAIL ${file}: ${message}`);
};

for (const file of FILES) {
  const source = await readFile(join(sourceDir, file));
  const published = await readFile(join(PUBLISHED, file));

  // The heading, at the start of a line, exactly once.
  const heading = Buffer.from(`\n${CUT}`);
  const at = source.indexOf(heading);
  if (at < 0 || source.indexOf(heading, at + 1) >= 0) {
    fail(file, `the source must contain «${CUT}» once, at the start of a line`);
    continue;
  }
  const expected = source.subarray(0, at + 1);

  if (!expected.equals(published)) {
    let i = 0;
    while (i < expected.length && i < published.length && expected[i] === published[i]) i += 1;
    const line = lineAt(published, i);
    const lineOf = (bytes) => bytes.toString("utf8").split("\n")[line - 1] ?? "(end of file)";
    fail(file, `differs from its source at line ${line}\n  source:    ${lineOf(expected)}\n  published: ${lineOf(published)}`);
    continue;
  }

  const text = published.toString("utf8");
  const shown = legalDisplayText(text).trimEnd();
  const dropped = text.slice(shown.length);
  if (!text.startsWith(shown) || !/^[\s-]*$/.test(dropped)) {
    fail(file, "the page leaves out more than the closing rules");
    continue;
  }
  if (!shown.includes("آخر تحديث")) {
    fail(file, "the «آخر تحديث» line is missing");
    continue;
  }

  console.log(
    `OK   ${file}: ${published.length} bytes, sha256 ${sha256(published).slice(0, 16)}…, identical to the source ` +
      `(${source.length} bytes) up to «${CUT}» on its line ${lineAt(source, at + 1)}; ` +
      `the page shows all of it but the closing ${JSON.stringify(dropped)}`,
  );
}

if (failures) {
  console.error(`${failures} of ${FILES.length} legal texts differ from their sources.`);
  process.exit(1);
}
console.log(`All ${FILES.length} legal texts match their sources.`);
