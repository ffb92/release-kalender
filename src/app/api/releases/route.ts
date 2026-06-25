import { NextRequest, NextResponse } from "next/server";
import { fetchUpcomingAnime, fetchUpcomingManga, type ReleaseItem } from "@/lib/anilist";
import { fetchUpcomingMovies, fetchUpcomingTV } from "@/lib/tmdb";
import { fetchUpcomingGames } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";

  try {
    let results: ReleaseItem[];

    switch (category) {
      case "anime":
        results = await fetchUpcomingAnime();
        break;
      case "manga":
        results = await fetchUpcomingManga();
        break;
      case "movie":
        results = await fetchUpcomingMovies();
        break;
      case "tv":
        results = await fetchUpcomingTV();
        break;
      case "game":
        results = await fetchUpcomingGames();
        break;
      default: {
        const settled = await Promise.allSettled([
          fetchUpcomingAnime(),
          fetchUpcomingManga(),
          fetchUpcomingMovies(),
          fetchUpcomingTV(),
          fetchUpcomingGames(),
        ]);
        results = [];
        for (const r of settled) {
          if (r.status === "fulfilled") results.push(...r.value);
        }
      }
    }

    return NextResponse.json(results!, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
