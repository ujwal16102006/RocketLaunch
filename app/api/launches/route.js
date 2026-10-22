import { NextResponse } from "next/server";
import {
  fetchUpcomingLaunches,
  fetchHistoricalLaunches,
  fetchLaunchById,
} from "@/services/launchApi.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "upcoming";
  const id = searchParams.get("id");
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const search = searchParams.get("search") || "";

  try {
    if (id) {
      const data = await fetchLaunchById(id);
      return NextResponse.json(data);
    }

    if (type === "previous" || type === "historical") {
      const data = await fetchHistoricalLaunches({ limit, offset, search });
      return NextResponse.json(data);
    }

    const data = await fetchUpcomingLaunches({ limit, offset, search });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API ERROR: /api/launches]", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to retrieve flight data from Launch Library 2",
        type,
        launches: [],
        total: 0,
        status: 502,
      },
      { status: 502 }
    );
  }
}
