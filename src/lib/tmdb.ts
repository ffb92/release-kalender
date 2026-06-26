const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

interface TMDBItem {
  id: number; title?: string; name?: string;
  poster_path: string | null; backdrop_path: string | null;
  release_date?: string; first_air_date?: string;
  genre_ids: number[]; vote_average: number;
  overview: string;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Abenteuer", 16: "Animation", 35: "Komödie",
  80: "Krimi", 99: "Doku", 18: "Drama", 10751: "Familie",
  14: "Fantasy", 36: "Geschichte", 27: "Horror", 10402: "Musik",
  9648: "Mystery", 10749: "Romantik", 878: "Sci-Fi",
  53: "Thriller", 10752: "Krieg", 37: "Western",
};

import type { ReleaseItem } from "./anilist";

function getAuthHeader(): Record<string, string> {
  const token = process.env.TMDB_TOKEN;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function mapToRelease(item: TMDBItem, category: "movie" | "tv"): ReleaseItem {
  const title = item.title || item.name || "Unbekannt";
  const date = item.release_date || item.first_air_date || "";
  const image = item.poster_path ? IMG_BASE + "/w500" + item.poster_path : "";
  const banner = item.backdrop_path ? IMG_BASE + "/w1280" + item.backdrop_path : null;
  const genres = item.genre_ids.slice(0, 4).map((g: number) => GENRE_MAP[g] || "");
  const fmt = date
    ? new Date(date).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })
    : "TBA";

  return {
    id: category + "-" + item.id,
    title,
    titleOrig: title,
    image,
    banner,
    date: fmt,
    genres: genres.filter(Boolean),
    type: category === "movie" ? "Film" : "Serie",
    score: Math.round((item.vote_average || 0) * 10),
    url: category === "movie"
      ? "https://www.themoviedb.org/movie/" + item.id
      : "https://www.themoviedb.org/tv/" + item.id,
    description: item.overview || null,
    category,
  };
}

async function fetchTMDBPages(
  endpoint: string,
  params: Record<string, string>
): Promise<TMDBItem[]> {
  const auth = getAuthHeader();
  if (!auth.Authorization) return [];

  const all: TMDBItem[] = [];
  const base = new URLSearchParams(params);
  let page = 1;
  const maxPages = 30; // 30 pages × 20 = 600 max (TMDB limit)

  while (page <= maxPages) {
    base.set("page", String(page));
    try {
      const res = await fetch(TMDB_BASE + endpoint + "?" + base.toString(), { headers: auth });
      if (!res.ok) break;
      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) break;
      all.push(...results);
      if (page >= (json.total_pages || 1)) break;
      page++;
    } catch { break; }
  }
  return all;
}

// All 2026 releases (past + upcoming)
export async function fetchUpcomingMovies(region = "DE", dateFrom = "2026-01-01", dateTo = "2026-12-31"): Promise<ReleaseItem[]> {
  const items = await fetchTMDBPages("/discover/movie", {
    language: "de-DE",
    region,
    sort_by: "primary_release_date.desc",
    "primary_release_date.gte": dateFrom,
    "primary_release_date.lte": dateTo,
    "vote_count.gte": "5",
  });
  return items.map((m: TMDBItem) => mapToRelease(m, "movie"));
}

export async function fetchUpcomingTV(region = "DE", dateFrom = "2026-01-01", dateTo = "2026-12-31"): Promise<ReleaseItem[]> {
  const items = await fetchTMDBPages("/discover/tv", {
    language: "de-DE",
    sort_by: "first_air_date.desc",
    "first_air_date.gte": dateFrom,
    "first_air_date.lte": dateTo,
    "vote_count.gte": "3",
  });
  return items.map((m: TMDBItem) => mapToRelease(m, "tv"));
}

// Search across all years
export async function searchMovies(query: string, year?: string): Promise<ReleaseItem[]> {
  const params: Record<string, string> = {
    language: "de-DE",
    query,
    sort_by: "popularity.desc",
    include_adult: "false",
  };
  if (year) params["primary_release_year"] = year;

  const items = await fetchTMDBPages("/search/movie", params);
  return items.map((m: TMDBItem) => mapToRelease(m, "movie"));
}

export async function searchTV(query: string, year?: string): Promise<ReleaseItem[]> {
  const params: Record<string, string> = {
    language: "de-DE",
    query,
    sort_by: "popularity.desc",
    include_adult: "false",
  };
  if (year) params["first_air_date_year"] = year;

  const items = await fetchTMDBPages("/search/tv", params);
  return items.map((m: TMDBItem) => mapToRelease(m, "tv"));
}
