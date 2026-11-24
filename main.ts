import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
// Output contract: /output/entry.txt holds exactly one sentence, the roast,
// 159 code points, no trailing newline — the sealed scorer reads it verbatim.
const LINE =
  "The committee that voted to regulate artificial intelligence spent this morning asking an intern why their Word document will not just become a PDF on its own.";

// Validate the entry against the sealed scorer's gate before writing:
// 1-320 code points, exactly one sentence, and not whitespace-only.
// (Code points, not UTF-16 units, so multi-byte characters count as one.)
// One sentence means exactly one sentence-ending period, at the end.
const codePoints = [...LINE];
if (codePoints.length < 1 || codePoints.length > 320) {
  throw new Error(`entry must be 1-320 code points, got ${codePoints.length}`);
}
if ((LINE.match(/\./g) ?? []).length !== 1 || !LINE.endsWith(".")) {
  throw new Error("entry must be exactly one sentence ending with a period");
}
if (LINE.trim().length === 0 || LINE.includes("\n")) {
  throw new Error("entry must be a single non-blank line");
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, "entry.txt"), LINE, "utf8");

// Read-back guard: the file on disk must be byte-identical to the
// validated constant, so a partial or truncated write fails loudly
// instead of shipping a corrupted entry to the scorer.
const written = readFileSync(join(OUTPUT_DIR, "entry.txt"), "utf8");
if (written !== LINE) {
  throw new Error("entry.txt read-back mismatch");
}
