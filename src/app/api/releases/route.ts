import { NextRequest, NextResponse } from "next/server";
import { fetchUpcomingAnime, fetchUpcomingManga, searchAnime, searchManga, type ReleaseItem } from "@/lib/anilist";
import { fetchUpcomingMovies, fetchUpcomingTV, searchMovies, searchTV } from "@/lib/tmdb";
import { fetchUpcomingGames, searchGames } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const region = searchParams.get("region") || "DE";
  const q = searchParams.get("q") || "";
  const year = searchParams.get("year") || "";

  try {
    let results: ReleaseItem[];

    if (q) {
      results = [];
      if (category === "all" || category === "movie") results.push(...await searchMovies(q, year || undefined));
      if (category === "all" || category === "tv") results.push(...await searchTV(q, year || undefined));
      if (category === "all" || category === "anime") results.push(...await searchAnime(q));
      if (category === "all" || category === "manga") results.push(...await searchManga(q));
      if (category === "all" || category === "game") results.push(...await searchGames(q));
    } else {
      results = await fetchAll(category, region);
    }

    return NextResponse.json(results, { status: 200, headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed", detail: error?.message || String(error) }, { status: 500 });
  }
}

async function fetchAll(category: string, region: string): Promise<ReleaseItem[]> {
  const fetchers: Promise<ReleaseItem[]>[] = [];
  if (category === "all" || category === "anime") fetchers.push(fetchUpcomingAnime());
  if (category === "all" || category === "manga") fetchers.push(fetchUpcomingManga());
  if (category === "all" || category === "movie") fetchers.push(fetchUpcomingMovies(region));
  if (category === "all" || category === "tv") fetchers.push(fetchUpcomingTV(region));
  if (category === "all" || category === "game") fetchers.push(fetchUpcomingGames());
  const settled = await Promise.allSettled(fetchers);
  const results: ReleaseItem[] = [];
  for (const r of settled) { if (r.status === "fulfilled") results.push(...r.value); }
  return results;
}
