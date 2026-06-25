const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY=proces..._KEY || "";
const IMG_BASE = "https://image.tmdb.org/t/p";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  original_language: string;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Abenteuer", 16: "Animation", 35: "Komödie",
  80: "Krimi", 99: "Doku", 18: "Drama", 10751: "Familie",
  14: "Fantasy", 36: "Geschichte", 27: "Horror", 10402: "Musik",
  9648: "Mystery", 10749: "Romantik", 878: "Sci-Fi", 10770: "TV-Film",
  53: "Thriller", 10752: "Krieg", 37: "Western",
};

import type { ReleaseItem } from "./anilist";

function mapToRelease(item: TMDBItem, category: "movie" | "tv"): ReleaseItem {
  const title = item.title || item.name || "Unbekannt";
  const date = item.release_date || item.first_air_date || "";
  const image = item.poster_path ? `${IMG_BASE}/w500${item.poster_path}` : "";
  const banner = item.backdrop_path ? `${IMG_BASE}/w1280${item.backdrop_path}` : null;
  const genres = item.genre_ids.slice(0, 4).map((g) => GENRE_MAP[g] || "Unbekannt");
  const formattedDate = date
    ? new Date(date).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })
    : "TBA";

  return {
    id: `${category}-${item.id}`,
    title,
    titleOrig: title,
    image,
    banner,
    date: formattedDate,
    genres,
    type: category === "movie" ? "Film" : "Serie",
    score: Math.round((item.vote_average || 0) * 10),
    url: category === "movie"
      ? `https://www.themoviedb.org/movie/${item.id}`
      : `https://www.themoviedb.org/tv/${item.id}`,
    category,
  };
}

export async function fetchUpcomingMovies(): Promise<ReleaseItem[]> {
  if (!API_KEY) { console.warn("TMDB_API_KEY not set"); return []; }
  const today = new Date().toISOString().split("T")[0];
  const sixMonths = new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0];
  const res = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&language=de-DE&region=DE` +
    `&sort_by=popularity.desc&with_release_type=2|3` +
    `&primary_release_date.gte=${today}&primary_release_date.lte=${sixMonths}&page=1`,
    { next: { revalidate: 3600 } } as RequestInit & { next?: { revalidate: number } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json.results || []).map((m: TMDBItem) => mapToRelease(m, "movie"));
}

export async function fetchUpcomingTV(): Promise<ReleaseItem[]> {
  if (!API_KEY) { console.warn("TMDB_API_KEY not set"); return []; }
  const today = new Date().toISOString().split("T")[0];
  const sixMonths = new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0];
  const res = await fetch(
    `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&language=de-DE` +
    `&sort_by=popularity.desc` +
    `&first_air_date.gte=${today}&first_air_date.lte=${sixMonths}&page=1`,
    { next: { revalidate: 3600 } } as RequestInit & { next?: { revalidate: number } }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json.results || []).map((m: TMDBItem) => mapToRelease(m, "tv"));
}
