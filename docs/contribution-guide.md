# RocketLaunch — Team Contribution Guide & Git Workflow

This guide establishes the version control, branching, code quality, and Pull Request (PR) standards for the five-person RocketLaunch engineering team.

---

## 1. Branch Strategy

We use a feature-branch workflow anchored on `main`. Direct commits to `main` are restricted.

```
       feat/countdown-tab-sync -----\
                                     \
main ---------------------------------[ PR Merge ]----------------->
                                     /
       feat/mission-filters ---------/
```

### Branch Naming Conventions:
- **UI & Layout:** `feat/ui-<description>` (e.g., `feat/ui-navbar-telemetry-badge`)
- **API Services:** `feat/api-<description>` (e.g., `feat/api-ll2-failover`)
- **Countdown Engine:** `feat/countdown-<description>` (e.g., `feat/countdown-drift-prevention`)
- **Discovery & Cards:** `feat/discovery-<description>` (e.g., `feat/discovery-agency-filters`)
- **Integration & Testing:** `feat/test-<description>` or `docs/<description>`

---

## 2. Development Workflow

### Step 1: Create a Working Branch
```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### Step 2: Install Dependencies & Discover Animation Frames
```bash
npm install
npm run discover-frames
```

### Step 3: Local Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Step 4: Run Automated Verification Tests
Every contributor must verify their changes against the unit and integration suite before pushing:
```bash
npm test
```
All tests must pass (`0 failed`).

### Step 5: Verify Production Build
Ensure that Next.js static page generation and server routes compile cleanly:
```bash
npm run build
```

---

## 3. Pull Request (PR) Quality Checklist

Before requesting review or merging, ensure your PR meets these criteria:

- [ ] **Tests Pass:** `npm test` runs with 0 errors.
- [ ] **Build Succeeds:** `npm run build` completes successfully.
- [ ] **No Hardcoded Keys:** Zero API keys, passwords, or `.env.local` files staged or committed.
- [ ] **Interface Preserved:** No breaking changes to exported functions in `utils/` or `services/` without advance team coordination.
- [ ] **Accessibility:** Interactive elements have accessible names and keyboard focus outlines.
- [ ] **Real Data Only:** No mock records or fabricated flight data introduced.

---

## 4. Resolving Integration Conflicts

If your branch conflicts with changes merged to `main`:
```bash
git checkout feat/your-feature-name
git fetch origin
git rebase origin/main
# Resolve any file conflicts, re-run tests
npm test
git push origin feat/your-feature-name --force-with-lease
```
