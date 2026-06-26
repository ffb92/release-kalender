const ANILIST_URL = "https://graphql.anilist.co";

interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string };
  coverImage: { large: string; medium: string };
  bannerImage: string | null;
  format: string;
  status: string;
  startDate: { year: number | null; month: number | null; day: number | null };
  genres: string[];
  averageScore: number | null;
  siteUrl: string;
  description: string | null;
}

const UPCOMING_ANIME_QUERY = `
query ($page: Int) {
  Page(page: $page, perPage: 50) {
    media(
      type: ANIME,
      status_in: [NOT_YET_RELEASED, RELEASING],
      sort: [POPULARITY_DESC]
    ) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      format
      status
      startDate { year month day }
      genres
      averageScore
      siteUrl
      description(asHtml: false)
    }
  }
}`;

const UPCOMING_MANGA_QUERY = `
query ($page: Int) {
  Page(page: $page, perPage: 50) {
    media(
      type: MANGA,
      status_in: [NOT_YET_RELEASED, RELEASING],
      sort: [POPULARITY_DESC]
    ) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      format
      status
      startDate { year month day }
      genres
      averageScore
      siteUrl
      description(asHtml: false)
    }
  }
}`;

export type ReleaseItem = {
  id: string;
  title: string;
  titleOrig: string;
  image: string;
  banner: string | null;
  date: string;
  genres: string[];
  type: string;
  score: number | null;
  url: string;
  description: string | null;
  category: "anime" | "manga" | "movie" | "tv" | "game";
};

function formatDate(item: AniListMedia): string {
  const d = item.startDate;
  if (d.year && d.month && d.day) {
    return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
  }
  if (d.year && d.month) {
    const months = [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];
    return `${months[d.month - 1]} ${d.year}`;
  }
  if (d.year) return `${d.year}`;
  return "TBA";
}

function mapAnimeToRelease(item: AniListMedia): ReleaseItem {
  return {
    id: `anime-${item.id}`,
    title: item.title.english || item.title.romaji || item.title.native || "Unbekannt",
    titleOrig: item.title.native || item.title.romaji,
    image: item.coverImage.large || item.coverImage.medium,
    banner: item.bannerImage,
    date: formatDate(item),
    genres: item.genres.slice(0, 4),
    type: item.format || "Anime",
    score: item.averageScore,
    url: item.siteUrl,
    description: item.description || null,
    category: "anime",
  };
}

function mapMangaToRelease(item: AniListMedia): ReleaseItem {
  return {
    id: `manga-${item.id}`,
    title: item.title.english || item.title.romaji || item.title.native || "Unbekannt",
    titleOrig: item.title.native || item.title.romaji,
    image: item.coverImage.large || item.coverImage.medium,
    banner: item.bannerImage,
    date: formatDate(item),
    genres: item.genres.slice(0, 4),
    type: "Manga",
    score: item.averageScore,
    url: item.siteUrl,
    description: item.description || null,
    category: "manga",
  };
}

async function anilistFetch(query: string): Promise<AniListMedia[]> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query, variables: { page: 1 } }),
  });

  if (!res.ok) {
    console.error(`AniList HTTP ${res.status}: ${await res.text().catch(() => "")}`);
    return [];
  }

  const json = await res.json();
  if (json.errors) {
    console.error("AniList GraphQL errors:", JSON.stringify(json.errors));
    return [];
  }

  return json?.data?.Page?.media || [];
}

const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 30) {
    media(type: ANIME, search: $search, sort: [POPULARITY_DESC]) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      format
      status
      startDate { year month day }
      genres
      averageScore
      siteUrl
      description(asHtml: false)
    }
  }
}`;

const SEARCH_MANGA_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 30) {
    media(type: MANGA, search: $search, sort: [POPULARITY_DESC]) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      format
      status
      startDate { year month day }
      genres
      averageScore
      siteUrl
      description(asHtml: false)
    }
  }
}`;

async function anilistSearch(query: string, type: "ANIME" | "MANGA"): Promise<ReleaseItem[]> {
  const gql = type === "ANIME" ? SEARCH_ANIME_QUERY : SEARCH_MANGA_QUERY;
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query: gql, variables: { search: query } }),
  });

  if (!res.ok) return [];
  const json = await res.json();
  if (json.errors) return [];
  const media: AniListMedia[] = json?.data?.Page?.media || [];
  return media.map(type === "ANIME" ? mapAnimeToRelease : mapMangaToRelease);
}

export async function searchAnime(query: string): Promise<ReleaseItem[]> {
  return anilistSearch(query, "ANIME");
}

export async function searchManga(query: string): Promise<ReleaseItem[]> {
  return anilistSearch(query, "MANGA");
}

export async function fetchUpcomingAnime(): Promise<ReleaseItem[]> {
  const media = await anilistFetch(UPCOMING_ANIME_QUERY);
  return media.map(mapAnimeToRelease);
}

export async function fetchUpcomingManga(): Promise<ReleaseItem[]> {
  const media = await anilistFetch(UPCOMING_MANGA_QUERY);
  return media.map(mapMangaToRelease);
}
