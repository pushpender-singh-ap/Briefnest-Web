// Measures the production build with Lighthouse and prints the scores it actually got.
//
//   npm run build && npm run lighthouse            home, features and download; phone and desktop profiles
//   npm run lighthouse -- /privacy                 other paths
//   LH_RUNS=5 npm run lighthouse                   more runs per page (default 3; the median is reported)
//
// Serves out/ on a local port, runs Lighthouse (fetched with npx on first use) in headless Chrome, and saves
// the full HTML and JSON reports in .lighthouse/. Local numbers are a guide: a real host adds compression,
// HTTP/2 and distance.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(site, ".lighthouse");
const port = Number(process.env.LH_PORT ?? 4180);
const paths = process.argv.slice(2).filter((arg) => arg.startsWith("/"));
const targets = paths.length ? paths : ["/", "/features", "/download"];
mkdirSync(out, { recursive: true });

const server = spawn("npx", ["serve", "out", "--config", "../serve.json", "--listen", String(port), "--no-clipboard"], { cwd: site, stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);
await new Promise((ready) => setTimeout(ready, 2500));

// Lighthouse scores move from run to run, so each page is measured several times and the median is reported.
const runs = Number(process.env.LH_RUNS ?? 3);
const median = (values) => [...values].sort((x, y) => x - y)[Math.floor(values.length / 2)];
const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;

const rows = [];
for (const path of targets) {
  for (const profile of ["mobile", "desktop"]) {
    const name = `${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${profile}`;
    const reports = [];
    for (let run = 0; run < runs; run++) {
      const args = [
        "--yes",
        "lighthouse",
        `http://localhost:${port}${path}`,
        "--quiet",
        "--chrome-flags=--headless=new",
        "--output=json",
        "--output=html",
        `--output-path=${join(out, name)}`,
        ...(profile === "desktop" ? ["--preset=desktop"] : []),
      ];
      const result = spawnSync("npx", args, { cwd: site, encoding: "utf8" });
      if (result.status !== 0) {
        console.error(result.stderr.split("\n").slice(-6).join("\n"));
        process.exitCode = 1;
        continue;
      }
      reports.push(JSON.parse(readFileSync(join(out, `${name}.report.json`), "utf8")));
    }
    if (!reports.length) continue;
    const score = (id) => median(reports.map((report) => Math.round(report.categories[id].score * 100)));
    const metric = (id) => median(reports.map((report) => report.audits[id].numericValue));
    rows.push({
      page: path,
      profile,
      performance: score("performance"),
      accessibility: score("accessibility"),
      "best practices": score("best-practices"),
      seo: score("seo"),
      LCP: seconds(metric("largest-contentful-paint")),
      CLS: metric("cumulative-layout-shift").toFixed(3),
      TBT: `${Math.round(metric("total-blocking-time"))} ms`,
    });
  }
}
stop();
console.log(`Median of ${runs} run${runs === 1 ? "" : "s"} per page and profile:`);
console.table(rows);
console.log(`Full reports: ${out}`);
