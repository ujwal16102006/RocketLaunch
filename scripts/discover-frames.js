import { discoverAndSyncFrames } from "../utils/frameDiscovery.js";

console.log("=== ROCKETLAUNCH AUTOMATIC FRAME DISCOVERY ===");
const result = discoverAndSyncFrames(process.cwd());

if (result.success) {
  console.log(`[DISCOVERY SUCCESS]`);
  console.log(`  Source Directory : ${result.sourceDirectory}`);
  console.log(`  Total Frames     : ${result.count}`);
  console.log(`  First Frame      : ${result.firstFrame}`);
  console.log(`  Last Frame       : ${result.lastFrame}`);
  console.log(`  Manifest Saved   : ${result.manifestPath}`);
  console.log(`  All Candidates   : ${JSON.stringify(result.candidates, null, 2)}`);
} else {
  console.warn(`[DISCOVERY WARNING] ${result.message}`);
}
