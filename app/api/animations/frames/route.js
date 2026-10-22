import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { discoverAndSyncFrames } from "@/utils/frameDiscovery.js";

export async function GET() {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "public",
      "animations",
      "rocket-launch",
      "manifest.json"
    );

    // If manifest exists, read from it
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.frames && parsed.frames.length > 0) {
          return NextResponse.json({
            available: true,
            count: parsed.totalFrames || parsed.frames.length,
            frames: parsed.frames,
            firstFrame: parsed.firstFrame || parsed.frames[0],
            lastFrame: parsed.lastFrame || parsed.frames[parsed.frames.length - 1],
            sourceDirectory: parsed.sourceDirectory,
            discoveredAt: parsed.discoveredAt,
          });
        }
      } catch {
        // Fall back to live discovery
      }
    }

    // Run dynamic discovery
    const discovery = discoverAndSyncFrames(process.cwd());

    if (discovery.success && discovery.count > 0) {
      return NextResponse.json({
        available: true,
        count: discovery.count,
        frames: discovery.frames,
        firstFrame: discovery.firstFrame,
        lastFrame: discovery.lastFrame,
        sourceDirectory: discovery.sourceDirectory,
      });
    }

    return NextResponse.json({
      available: false,
      count: 0,
      frames: [],
      fallback: true,
      message: "No sequence images discovered. Activating procedural visual fallback.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        available: false,
        count: 0,
        frames: [],
        error: err.message,
      },
      { status: 500 }
    );
  }
}
