import { mkdir, rm, writeFile } from "fs/promises";
import { resolve } from "path";

async function removePlaywrightReport() {
  const reportPath = resolve(process.cwd(), "playwright-report");
  const tracePath = resolve(reportPath, "trace");
  const logoPath = resolve(tracePath, "playwright-logo.svg");

  const logoSvg = `<?xml version="1.0" encoding="UTF-8"?><svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" rx="32" fill="#1F2937"/><circle cx="80" cy="80" r="58" fill="#22C55E"/><circle cx="66" cy="70" r="18" fill="#F97316"/><circle cx="102" cy="92" r="10" fill="#F1F5F9"/><text x="80" y="125" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="600" fill="#F8FAFC">Playwright</text></svg>`;

  try {
    await rm(reportPath, { recursive: true, force: true });
    await mkdir(tracePath, { recursive: true });
    await writeFile(logoPath, logoSvg, "utf8");
    // eslint-disable-next-line no-console
    console.log(`[clean-playwright-report] Reset playwright-report with logo placeholder`);
  } catch (error) {
    if (error?.code === "ENOENT") {
      await mkdir(tracePath, { recursive: true });
      await writeFile(logoPath, logoSvg, "utf8");
      return;
    }
    // eslint-disable-next-line no-console
    console.error("[clean-playwright-report] Failed to remove report directory", error);
    process.exitCode = 1;
  }
}

removePlaywrightReport();
