import { NextResponse } from "next/server";
import {
  generateMissionIntelligence,
  generateGroundedAerospaceAnalysis,
} from "@/services/deepseekApi.js";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { mode = "brief", mission, comparisonMission, userQuery, concept } = body;

  try {
    const result = await generateMissionIntelligence({
      mode,
      mission,
      comparisonMission,
      userQuery,
      concept,
    });

    if (result.content) {
      return NextResponse.json({
        success: true,
        content: result.content,
        model: result.model || "deepseek-grounded-telemetry (offline fallback)",
        isFallback: Boolean(result.isFallback || result.setupRequired),
      });
    }

    if (!result.success) {
      const fallbackContent = generateGroundedAerospaceAnalysis(
        mode,
        mission,
        comparisonMission,
        userQuery,
        concept,
        result.error || "DeepSeek API currently unavailable"
      );
      return NextResponse.json({
        success: true,
        content: fallbackContent,
        model: "deepseek-grounded-telemetry (offline fallback)",
        isFallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      model: result.model,
    });
  } catch (err) {
    console.warn("[API FAILOVER: /api/ai]", err.message);
    const fallbackContent = generateGroundedAerospaceAnalysis(
      mode,
      mission,
      comparisonMission,
      userQuery,
      concept,
      `DeepSeek API notice: ${err.message}`
    );
    return NextResponse.json({
      success: true,
      content: fallbackContent,
      model: "deepseek-grounded-telemetry (offline fallback)",
      isFallback: true,
    });
  }
}
