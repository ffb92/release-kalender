const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

interface TMDBItem {
  id: number; title?: string; name?: string;
  poster_path: string | null; backdrop_path: string | null;
  release_date?: string; first_air_date?: string;
  genre_ids: number[]; vote_average: number;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Abenteuer", 16: "Animation", 35: "Komödie",
  80: "Krimi", 99: "Doku", 18: "Drama", 10751: "Familie",
  14: "Fantasy", 36: "Geschichte", 27: "Horror", 10402: "Musik",
  9648: "Mystery", 10749: "Romantik", 878: "Sci-Fi",
  53: "Thriller", 10752: "Krieg", 37: "Western",
};

import type { ReleaseItem } from "./anilist";

function mapToRelease(item: TMDBItem, category: "movie" | "tv"): ReleaseItem {
  const title = item.title || item.name || "Unbekannt";
  const date = item.release_date || item.first_air_date || "";
  const image = item.poster_path ? IMG_BASE + "/w500" + item.poster_path : "";
  const banner = item.backdrop_path ? IMG_BASE + "/w1280" + item.backdrop_path : null;
  const genres = item.genre_ids.slice(0, 4).map((g: number) => GENRE_MAP[g] || "Unbekannt");
  const fmt = date ? new Date(date).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" }) : "TBA";
  return { id: category + "-" + item.id, title, titleOrig: title, image, banner, date: fmt, genres, type: category === "movie" ? "Film" : "Serie", score: Math.round((item.vote_average || 0) * 10), url: category === "movie" ? "https://www.themoviedb.org/movie/" + item.id : "https://www.themoviedb.org/tv/" + item.id, category };
}

async function fetchTMDBPages(endpoint: string, params: Record<string, string>, maxPages = 5): Promise<TMDBItem[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];
  const all: TMDBItem[] = [];
  const base = new URLSearchParams({ ...params, api_key: key });
  for (let p = 1; p <= maxPages; p++) {
    base.set("page", String(p));
    try {
      const res = await fetch(TMDB_BASE + endpoint + "?" + base.toString());
      if (!res.ok) break;
      const json = await res.json();
      all.push(...(json.results || []));
      if (p >= (json.total_pages || 1)) break;
    } catch { break; }
  }
  return all;
}

export async function fetchUpcomingMovies(): Promise<ReleaseItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const items = await fetchTMDBPages("/discover/movie", { language: "de-DE", region: "DE", sort_by: "popularity.desc", "primary_release_date.gte": today, "vote_count.gte": "10" }, 5);
  return items.map((m: TMDBItem) => mapToRelease(m, "movie"));
}

export async function fetchUpcomingTV(): Promise<ReleaseItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const items = await fetchTMDBPages("/discover/tv", { language: "de-DE", sort_by: "popularity.desc", "first_air_date.gte": today, "vote_count.gte": "5" }, 5);
  return items.map((m: TMDBItem) => mapToRelease(m, "tv"));
}
