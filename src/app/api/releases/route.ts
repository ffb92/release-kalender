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
  const yearParam = searchParams.get("year") || "";
  const monthParam = searchParams.get("month") || "";

  // Default to current month/year if no search query
  const now = new Date();
  const year = yearParam || String(now.getFullYear());
  const month = monthParam || String(now.getMonth() + 1).padStart(2, "0");

  try {
    let results: ReleaseItem[];

    if (q) {
      // Search mode — full database, all time
      results = [];
      if (category === "all" || category === "movie") results.push(...await searchMovies(q, yearParam || undefined));
      if (category === "all" || category === "tv") results.push(...await searchTV(q, yearParam || undefined));
      if (category === "all" || category === "anime") results.push(...await searchAnime(q));
      if (category === "all" || category === "manga") results.push(...await searchManga(q));
      if (category === "all" || category === "game") results.push(...await searchGames(q));
    } else {
      // Browse mode — filter by month
      results = await fetchByMonth(category, region, year, month);
    }

    return NextResponse.json(results, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

async function fetchByMonth(
  category: string,
  region: string,
  year: string,
  month: string
): Promise<ReleaseItem[]> {
  const startDate = `${year}-${month}-01`;
  // Last day of month
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  const allResults: ReleaseItem[] = [];

  if (category === "all" || category === "anime") {
    const items = await fetchUpcomingAnime();
    allResults.push(...filterByMonth(items, year, month));
  }
  if (category === "all" || category === "manga") {
    const items = await fetchUpcomingManga();
    allResults.push(...filterByMonth(items, year, month));
  }
  if (category === "all" || category === "movie") {
    const items = await fetchUpcomingMovies(region, startDate, endDate);
    allResults.push(...items);
  }
  if (category === "all" || category === "tv") {
    const items = await fetchUpcomingTV(region, startDate, endDate);
    allResults.push(...items);
  }
  if (category === "all" || category === "game") {
    const items = await fetchUpcomingGames(startDate, endDate);
    allResults.push(...items);
  }

  return allResults;
}

function filterByMonth(items: ReleaseItem[], year: string, month: string): ReleaseItem[] {
  return items.filter((item) => {
    const d = item.date;
    // Check ISO format: 2026-07-15
    if (d.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return d.startsWith(`${year}-${month}`);
    }
    // Check German format: "15. Juli 2026" or "Juli 2026"
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    const monthName = months[parseInt(month) - 1];
    return d.includes(monthName) && d.includes(year);
  });
}
