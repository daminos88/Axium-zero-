import { runReplayHarnessV3 } from "../core/replay_harness_v3.js";

function printSummary(summary = {}) {
  console.log("=== AXIUM REPLAY V3 SUMMARY ===");
  console.log(`total:            ${summary.total ?? 0}`);
  console.log(`v5_accepts:       ${summary.v5_accepts ?? 0}`);
  console.log(`v6_accepts:       ${summary.v6_accepts ?? 0}`);
  console.log(`changed:          ${summary.changed ?? 0}`);
  console.log(`avg_dominance:    ${Number(summary.avg_dominance ?? 0).toFixed(6)}`);
  console.log(`avg_improvement:  ${Number(summary.avg_improvement ?? 0).toFixed(6)}`);
  console.log("");
}

function printResultRow(row = {}) {
  const id = row.id ?? "unknown";
  const v5 = row?.v5?.decision ?? "NONE";
  const v6 = row?.v6?.decision ?? "NONE";
  const dominance = Number(row.dominance ?? 0).toFixed(6);
  const improvement = Number(row.improvement ?? 0).toFixed(6);

  console.log(`[${id}] v5=${v5} v6=${v6} dominance=${dominance} improvement=${improvement}`);
}

async function main() {
  console.log("AXIUM :: replay_harness_v3_probe");

  const result = await runReplayHarnessV3();
  const rows = Array.isArray(result?.rows) ? result.rows : [];

  for (const row of rows) {
    printResultRow(row);
  }

  printSummary(result?.summary ?? {});
}

main().catch((error) => {
  console.error("replay_harness_v3_probe failed:", error);
  process.exitCode = 1;
});
