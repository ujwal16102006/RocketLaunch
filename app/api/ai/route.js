import { NextResponse } from "next/server";
import { generateMissionIntelligence } from "@/services/deepseekApi.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode = "brief", mission, comparisonMission, userQuery, concept } = body;

    const result = await generateMissionIntelligence({
      mode,
      mission,
      comparisonMission,
      userQuery,
      concept,
    });

    if (result.setupRequired) {
      return NextResponse.json(
        {
          success: false,
          setupRequired: true,
          message: result.message,
          error: result.error,
          content: result.content,
        },
        { status: 200 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "DeepSeek processing encountered an error.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      model: result.model,
    });
  } catch (err) {
    console.error("[API ERROR: /api/ai]", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process AI mission intelligence request.",
      },
      { status: 500 }
    );
  }
}
