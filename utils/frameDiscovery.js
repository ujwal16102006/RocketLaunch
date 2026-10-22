import fs from "fs";
import path from "path";

const SUPPORTED_EXTENSIONS = new Set([".webp", ".png", ".jpg", ".jpeg", ".avif"]);
const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "coverage", "build", "dist"]);

/**
 * Natural numeric comparator for filenames (e.g., 'frame-2.png' before 'frame-10.png')
 */
export function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Recursively scans directory for candidate image sequence folders.
 * @param {string} rootDir - Root directory to scan from
 * @returns {Array<{ dirPath: string, relativePath: string, files: string[], score: number }>}
 */
export function findCandidateSequences(rootDir) {
  const candidates = [];

  function scan(currentDir, depth = 0) {
    if (depth > 6) return;
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    const imageFiles = [];
    const subDirs = [];

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          subDirs.push(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          imageFiles.push(entry.name);
        }
      }
    }

    // Sequence candidate evaluation: at least 5 images with numeric sequence
    if (imageFiles.length >= 5) {
      const sorted = imageFiles.sort(naturalSort);
      // Check if files have numbers in them
      const numericFiles = sorted.filter((f) => /\d+/.test(f));
      const numericRatio = numericFiles.length / sorted.length;

      // Bonus score if folder name or filenames mention rocket/launch/frame/ezgif/anim
      const dirLower = path.basename(currentDir).toLowerCase();
      let score = sorted.length;
      if (/rocket|launch|anim|sequence|frame|split/i.test(dirLower)) score += 200;
      if (numericRatio > 0.8) score += 100;
      if (/public[\\/]animations[\\/]rocket-launch/i.test(currentDir)) score += 50;

      candidates.push({
        dirPath: currentDir,
        relativePath: path.relative(rootDir, currentDir),
        files: sorted,
        count: sorted.length,
        score,
      });
    }

    for (const subDir of subDirs) {
      scan(subDir, depth + 1);
    }
  }

  scan(rootDir);
  // Sort candidates by score descending
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Discovers and organizes frames into public asset directory.
 * Preserves original images and creates an ordered manifest.
 */
export function discoverAndSyncFrames(projectRoot = process.cwd()) {
  const candidates = findCandidateSequences(projectRoot);

  if (candidates.length === 0) {
    return {
      success: false,
      count: 0,
      frames: [],
      message: "No sequential rocket launch image sequences discovered.",
      candidates: [],
    };
  }

  // Pick top scoring candidate
  const chosen = candidates[0];
  const targetPublicDir = path.join(projectRoot, "public", "animations", "rocket-launch");

  // Ensure target directory exists
  if (!fs.existsSync(targetPublicDir)) {
    fs.mkdirSync(targetPublicDir, { recursive: true });
  }

  const isAlreadyInTarget = path.resolve(chosen.dirPath) === path.resolve(targetPublicDir);
  const framePaths = [];

  if (!isAlreadyInTarget) {
    // Copy files safely to public directory without modifying originals
    for (const file of chosen.files) {
      const srcFile = path.join(chosen.dirPath, file);
      const destFile = path.join(targetPublicDir, file);
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
      framePaths.push(`/animations/rocket-launch/${file}`);
    }
  } else {
    for (const file of chosen.files) {
      framePaths.push(`/animations/rocket-launch/${file}`);
    }
  }

  // Create manifest
  const manifest = {
    discoveredAt: new Date().toISOString(),
    sourceDirectory: chosen.relativePath || chosen.dirPath,
    totalFrames: framePaths.length,
    firstFrame: framePaths[0] || null,
    lastFrame: framePaths[framePaths.length - 1] || null,
    frames: framePaths,
    allCandidates: candidates.map((c) => ({
      path: c.relativePath || c.dirPath,
      count: c.count,
      score: c.score,
    })),
  };

  const manifestPath = path.join(targetPublicDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  return {
    success: true,
    sourceDirectory: chosen.relativePath || chosen.dirPath,
    count: framePaths.length,
    frames: framePaths,
    firstFrame: framePaths[0],
    lastFrame: framePaths[framePaths.length - 1],
    manifestPath,
    candidates: manifest.allCandidates,
  };
}
