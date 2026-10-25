import assert from "assert";
import { calculateCountdown, padZero } from "../utils/dateUtils.js";
import { selectNextUpcomingLaunch } from "../utils/nextLaunchSelector.js";
import { normalizeLaunch, normalizeLaunchList } from "../utils/launchNormalizer.js";
import { naturalSort, discoverAndSyncFrames } from "../utils/frameDiscovery.js";
import { generateMissionIntelligence } from "../services/deepseekApi.js";
import { resolveUniqueLaunchImages, getSingleLaunchImage } from "../utils/rocketImageResolver.js";

console.log("=== STARTING ROCKETLAUNCH VERIFICATION SUITE ===");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

// 1. Countdown Tests
test("Countdown: Future timestamp calculates positive days, hours, mins, secs", () => {
  const now = 1700000000000;
  const future = new Date(now + 2 * 86400 * 1000 + 4 * 3600 * 1000 + 12 * 60 * 1000 + 30 * 1000).toISOString();
  const res = calculateCountdown(future, now);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isPast, false);
  assert.strictEqual(res.days, 2);
  assert.strictEqual(res.hours, 4);
  assert.strictEqual(res.minutes, 12);
  assert.strictEqual(res.seconds, 30);
});

test("Countdown: Expired timestamp handles gracefully without negative numbers", () => {
  const past = new Date(Date.now() - 50000).toISOString();
  const res = calculateCountdown(past, Date.now());
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isPast, true);
  assert.strictEqual(res.days, 0);
  assert.strictEqual(res.hours, 0);
  assert.strictEqual(res.minutes, 0);
  assert.strictEqual(res.seconds, 0);
  assert.ok(res.statusMessage.includes("reached"));
});

test("Countdown: Invalid timestamp handled without throwing", () => {
  const res = calculateCountdown("not-a-valid-date");
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.days, 0);
});

test("Countdown: Zero padding formats correctly", () => {
  assert.strictEqual(padZero(7), "07");
  assert.strictEqual(padZero(15), "15");
  assert.strictEqual(padZero(0), "00");
  assert.strictEqual(padZero(-5), "00");
});

// 2. NextLaunch Selection Tests
test("NextLaunch: Correctly selects earliest future launch and ignores past & cancelled", () => {
  const now = Date.now();
  const mockLaunches = [
    {
      id: "past-1",
      name: "Past Launch",
      net: new Date(now - 100000).toISOString(),
      status: { name: "Success" },
    },
    {
      id: "future-cancelled",
      name: "Cancelled Future Launch",
      net: new Date(now + 20000).toISOString(),
      status: { name: "Launch Failure" },
    },
    {
      id: "future-earliest",
      name: "Earliest Active Future Launch",
      net: new Date(now + 3600000).toISOString(),
      status: { name: "Go for Launch" },
    },
    {
      id: "future-later",
      name: "Later Future Launch",
      net: new Date(now + 7200000).toISOString(),
      status: { name: "Go for Launch" },
    },
  ];

  const selected = selectNextUpcomingLaunch(mockLaunches, now);
  assert.ok(selected !== null);
  assert.strictEqual(selected.id, "future-earliest");
});

// 3. Normalizer Tests
test("Normalizer: Raw LL2 records properly mapped into normalized flight profile", () => {
  const raw = {
    id: "test-uuid-1",
    name: "Falcon 9 | Starlink Group 12-1",
    net: "2026-11-01T12:00:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go" },
    launch_service_provider: { name: "SpaceX", country_code: "USA" },
    rocket: { configuration: { name: "Falcon 9 Block 5", family: "Falcon" } },
    pad: { name: "SLC-40", location_name: "Cape Canaveral SFS, FL, USA" },
    mission: { name: "Starlink Group 12-1", orbit: { name: "Low Earth Orbit", abbrev: "LEO" } },
  };

  const norm = normalizeLaunch(raw);
  assert.strictEqual(norm.id, "test-uuid-1");
  assert.strictEqual(norm.rocket.name, "Falcon 9 Block 5");
  assert.strictEqual(norm.agency.name, "SpaceX");
  assert.strictEqual(norm.pad.name, "SLC-40");
  assert.strictEqual(norm.mission.orbit.abbrev, "LEO");
});

test("Normalizer: Handles null, empty, or missing fields without crashing", () => {
  const empty = normalizeLaunch({});
  assert.ok(empty !== null);
  assert.ok(empty.id);
  assert.strictEqual(empty.net, null);
  assert.strictEqual(empty.agency.name, "Commercial Aerospace Operator");
});

// 4. Frame Discovery & Natural Sort Tests
test("FrameDiscovery: Natural sort orders frame-2 before frame-10", () => {
  const filenames = ["frame-10.png", "frame-1.png", "frame-2.png", "frame-20.png"];
  const sorted = filenames.sort(naturalSort);
  assert.deepStrictEqual(sorted, ["frame-1.png", "frame-2.png", "frame-10.png", "frame-20.png"]);
});

test("FrameDiscovery: Discovers sequential frames and produces manifest", () => {
  const res = discoverAndSyncFrames(process.cwd());
  assert.strictEqual(res.success, true);
  assert.ok(res.count >= 300, `Expected at least 300 frames, got ${res.count}`);
  assert.ok(res.firstFrame.includes("ezgif-frame-001.png"));
  assert.ok(res.lastFrame.includes("ezgif-frame-300.png"));
});

// 5. DeepSeek AI Security Tests
await asyncTest("DeepSeek AI: Gracefully reports setupRequired when API key is unconfigured", async () => {
  delete process.env.DEEPSEEK_API_KEY;
  const res = await generateMissionIntelligence({
    mode: "brief",
    mission: { name: "Test Flight" },
  });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.setupRequired, true);
  assert.ok(res.error.includes("DEEPSEEK_API_KEY"));
});

// 6. Rocket Image Resolver & De-duplication Tests
test("RocketImageResolver: De-duplicates identical images across consecutive launches", () => {
  const sharedImage = "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_shared.jpg";
  const duplicateMissions = [
    { id: "f9-1", name: "Starlink 1", rocket: { name: "Falcon 9" }, image: sharedImage },
    { id: "f9-2", name: "Starlink 2", rocket: { name: "Falcon 9" }, image: sharedImage },
    { id: "f9-3", name: "Starlink 3", rocket: { name: "Falcon 9" }, image: sharedImage },
  ];

  const resolved = resolveUniqueLaunchImages(duplicateMissions);
  assert.strictEqual(resolved.length, 3);
  assert.strictEqual(resolved[0].distinctImage, sharedImage);
  assert.notStrictEqual(resolved[1].distinctImage, sharedImage);
  assert.notStrictEqual(resolved[2].distinctImage, sharedImage);
  assert.notStrictEqual(resolved[1].distinctImage, resolved[2].distinctImage);

  const uniqueSet = new Set(resolved.map((l) => l.distinctImage));
  assert.strictEqual(uniqueSet.size, 3, "All 3 cards must have strictly distinct images");
});

test("RocketImageResolver: Guarantees 100% unique images across a large list", () => {
  const mockLaunches = Array.from({ length: 25 }, (_, i) => ({
    id: `launch-${i + 1}`,
    name: `Mission ${i + 1}`,
    rocket: { name: i % 2 === 0 ? "Falcon 9" : "Electron" },
    image: i % 2 === 0 ? "https://example.com/same-falcon.jpg" : "https://example.com/same-electron.jpg",
  }));

  const resolved = resolveUniqueLaunchImages(mockLaunches);
  const images = resolved.map((l) => l.distinctImage);
  const uniqueImages = new Set(images);
  assert.strictEqual(uniqueImages.size, 25, "Expected all 25 launch cards to have 100% unique images");
});

test("RocketImageResolver: Resolves single launch fallback photo for modals and dossiers", () => {
  const single = getSingleLaunchImage({
    id: "isro-test",
    name: "Gaganyaan-1",
    rocket: { name: "LVM-3" },
    agency: { name: "ISRO" },
  });
  assert.ok(single);
  assert.ok(typeof single === "string");
  assert.ok(single.startsWith("http"));
});

console.log("\n========================================");
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log("========================================");

if (failed > 0) {
  process.exit(1);
}
