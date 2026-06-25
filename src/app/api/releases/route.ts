import { NextRequest, NextResponse } from "next/server";
import { fetchUpcomingAnime, fetchUpcomingManga, type ReleaseItem } from "@/lib/anilist";
import { fetchUpcomingMovies, fetchUpcomingTV, searchMovies, searchTV } from "@/lib/tmdb";
import { fetchUpcomingGames } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const region = searchParams.get("region") || "DE";
  const q = searchParams.get("q") || "";
  const year = searchParams.get("year") || "";

  try {
    let results: ReleaseItem[];

    if (q && (category === "movie" || category === "tv" || category === "all")) {
      const cat = category === "all" ? "both" : category;
      results = [];
      if (cat === "movie" || cat === "both") results.push(...await searchMovies(q, year || undefined));
      if (cat === "tv" || cat === "both") results.push(...await searchTV(q, year || undefined));
    } else if (q) {
      const all = await fetchAll(category, region);
      const lower = q.toLowerCase();
      results = all.filter((i: ReleaseItem) => i.title.toLowerCase().includes(lower) || i.titleOrig.toLowerCase().includes(lower));
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
