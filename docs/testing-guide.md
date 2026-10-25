# RocketLaunch — Testing & Quality Assurance Guide

**Owner:** Anand — Testing & Quality Assurance Engineer  
**Related Components:** `tests/unit-and-integration.test.js`, `package.json`

---

## 1. Overview & Test Philosophy

RocketLaunch employs a zero-dependency, automated Node.js test runner designed for speed, deterministic results, and strict verification of critical aerospace math and API contracts.

### Core Testing Tenets:
1. **Zero Mockery of Core Math:** Timezone arithmetic, T-minus countdown math, and numerical frame sorting are verified with strict mathematical assertions.
2. **Honest Failure States:** We verify that unconfigured API credentials, network failures, or malformed payloads fail gracefully with honest error feedback rather than crashing or showing fake data.
3. **No Flaky Tests:** Tests run synchronously or with controlled async boundaries, executing in under 500 milliseconds.

---

## 2. Running the Test Suite

Execute the entire verification suite via:

```bash
# Via npm script
npm test

# Or directly with Node.js
node tests/unit-and-integration.test.js
```

### Expected Output (All 13 Tests Passing):
```
=== STARTING ROCKETLAUNCH VERIFICATION SUITE ===
✓ PASS: Countdown: Future timestamp calculates positive days, hours, mins, secs
✓ PASS: Countdown: Expired timestamp handles gracefully without negative numbers
✓ PASS: Countdown: Invalid timestamp handled without throwing
✓ PASS: Countdown: Zero padding formats correctly
✓ PASS: NextLaunch: Correctly selects earliest future launch and ignores past & cancelled
✓ PASS: Normalizer: Raw LL2 records properly mapped into normalized flight profile
✓ PASS: Normalizer: Handles null, empty, or missing fields without crashing
✓ PASS: FrameDiscovery: Natural sort orders frame-2 before frame-10
✓ PASS: FrameDiscovery: Discovers sequential frames and produces manifest
✓ PASS: DeepSeek AI: Gracefully reports setupRequired when API key is unconfigured
✓ PASS: RocketImageResolver: De-duplicates identical images across consecutive launches
✓ PASS: RocketImageResolver: Guarantees 100% unique images across a large list
✓ PASS: RocketImageResolver: Resolves single launch fallback photo for modals and dossiers

========================================
TEST RESULTS: 13 passed, 0 failed
========================================
```

---

## 3. Test Suite Structure & Coverage

The test suite in `tests/unit-and-integration.test.js` is partitioned into six functional domains:

### Domain 1: Countdown & Timezone Arithmetic (`utils/dateUtils.js`)
* **Test 1 — Future Timestamp Calculation:**
  Verifies that a future launch date (e.g., T+2 days, 3 hours) produces positive integer values for `days`, `hours`, `minutes`, and `seconds`.
* **Test 2 — Expired Launch Handling:**
  Asserts that past launch dates result in `isPast: true`, clamping `totalSeconds` to `0` and preventing negative countdown timers.
* **Test 3 — Invalid Date Resilience:**
  Ensures that `null`, `undefined`, or malformed date strings return safe zeroed state without throwing runtime exceptions.
* **Test 4 — Zero Padding Formatter:**
  Verifies that numbers `0` through `9` are properly padded to `"00"` through `"09"` for monospace tabular display.

### Domain 2: Next Upcoming Launch Selector (`utils/nextLaunchSelector.js`)
* **Test 5 — Priority & Filter Logic:**
  Given a mock list containing past flights, future flights, and cancelled operations (Hold/Failure), asserts that the selector picks the single earliest future flight with confirmed launch status.

### Domain 3: Launch Data Normalizer (`utils/launchNormalizer.js`)
* **Test 6 — Schema Mapping:**
  Validates that raw Launch Library 2 payloads map correctly to internal properties (`id`, `name`, `net`, `rocket.name`, `agency.name`, `pad.name`, `mission.orbit.abbrev`).
* **Test 7 — Null & Empty Payload Resilience:**
  Confirms that passing an empty object `{}` returns a valid fallback structure without throwing `TypeError: Cannot read properties of undefined`.

### Domain 4: Frame Discovery & Natural Sorting (`utils/frameDiscovery.js`)
* **Test 8 — Natural Numeric Sorting:**
  Ensures natural sorting where `frame-2.png` appears before `frame-10.png` (avoiding lexicographical sorting errors where `frame-10` precedes `frame-2`).
* **Test 9 — Frame Discovery & Manifest Generation:**
  Executes recursive directory scanning to verify the discovery of all 300 sequential frames in the workspace and verifies manifest structure.

### Domain 5: DeepSeek AI Security & Fallback (`services/deepseekApi.js`)
* **Test 10 — Missing Credentials Resilience:**
  Temporarily unsets `DEEPSEEK_API_KEY` and asserts that calls to `generateMissionIntelligence` return `{ success: false, setupRequired: true }` rather than crashing the Node runtime or making unauthenticated external calls.

### Domain 6: Rocket Image De-duplication Engine (`utils/rocketImageResolver.js`)
* **Test 11 — Consecutive Launch De-duplication:**
  Asserts that when multiple launches share the exact same stock vehicle image from LL2, each card is assigned a distinct real photo.
* **Test 12 — Large List 100% Uniqueness:**
  Tests a 25-flight manifest to confirm that `new Set(resolved.map(l => l.distinctImage)).size === 25` (zero duplicate images across cards).
* **Test 13 — Single Launch Fallback Resolution:**
  Verifies that modals and dossiers resolve vehicle-specific fallback photography when primary imagery is missing.

---

## 4. How to Interpret Test Results & Debug Failures

When a test fails, the runner outputs:
```
✗ FAIL: [Domain]: [Description]
  [Detailed Error Message and Stack Trace]
```

### Common Failure Modes & Solutions:
1. **AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:**
   - *Cause:* Timezone drift or modified countdown logic.
   - *Fix:* Ensure UTC parsing in `dateUtils.js` uses `Date.parse(isoString)` without local timezone offsets.
2. **Missing Frame Files:**
   - *Cause:* Animation frame directory moved or deleted.
   - *Fix:* Run `npm run discover-frames` to rescan and regenerate `public/animations/rocket-launch/manifest.json`.
3. **Image Duplicate Assertion Error:**
   - *Cause:* A new vehicle family was added without enough curated fallback photos.
   - *Fix:* Add verified photo URLs to `utils/rocketImageResolver.js`.

---

## 5. Pre-Commit QA Checklist

Before submitting a Pull Request, every engineer must verify:
- [ ] `npm test` passes with `0 failed`.
- [ ] `npm run discover-frames` confirms valid frame count.
- [ ] `npm run build` completes with 0 errors.
- [ ] No local API keys or secrets are present in modified files.
