import type { ReleaseItem } from "./anilist";

interface RawGame { title: string; date: string; platforms: string[]; }

const GAMES_DATA: RawGame[] = [
  { title: "eFootball Kick Off!", date: "2026-06-03", platforms: ["Switch 2"] },
  { title: "Final Fantasy VII Rebirth", date: "2026-06-03", platforms: ["Xbox","Switch 2"] },
  { title: "The 7th Guest Remake", date: "2026-06-04", platforms: ["PC","PS5","Switch","Switch 2","Xbox"] },
  { title: "Gothic 1 Remake", date: "2026-06-05", platforms: ["PS5","Xbox","PC"] },
  { title: "Solarpunk", date: "2026-06-08", platforms: ["PS5","Xbox","Switch 2","PC"] },
  { title: "Xenoblade Chronicles Definitive Edition", date: "2026-06-09", platforms: ["Switch 2"] },
  { title: "33 Immortals", date: "2026-06-10", platforms: ["Xbox","PC"] },
  { title: "Denshattack!", date: "2026-06-17", platforms: ["PC","PS5","Xbox","Switch 2"] },
  { title: "R-Type Tactics I-II Cosmos", date: "2026-06-18", platforms: ["Xbox","PS5","PS4","Switch","Switch 2","PC"] },
  { title: "Devil May Cry 5: Devil Hunter Edition", date: "2026-06-23", platforms: ["Switch 2"] },
  { title: "Destroy All Humans!", date: "2026-06-23", platforms: ["Switch 2"] },
  { title: "Deltarune: Chapter 5", date: "2026-06-24", platforms: ["PS5","Switch 2","PS4","Switch","PC"] },
  { title: "Dead or Alive 6 Last Round", date: "2026-06-25", platforms: ["PS5","Xbox","PC"] },
  { title: "Star Fox", date: "2026-06-25", platforms: ["Switch 2"] },
  { title: "High on Life 2", date: "2026-07-01", platforms: ["Switch 2"] },
  { title: "Avatar Legends", date: "2026-07-02", platforms: ["Xbox","PS5","Switch","Switch 2","PC"] },
  { title: "Rhythm Heaven Groove", date: "2026-07-02", platforms: ["Switch 2"] },
  { title: "Doom: The Dark Ages - Revelations", date: "2026-07-07", platforms: ["PC","Xbox","PS5"] },
  { title: "Assassin's Creed Black Flag Resynced", date: "2026-07-09", platforms: ["PC","PS5","Xbox"] },
  { title: "Palworld 1.0", date: "2026-07-10", platforms: ["PC","Xbox","PS5"] },
  { title: "Halo: Campaign Evolved", date: "2026-07-28", platforms: ["Xbox","PS5","PC"] },
  { title: "Elden Ring: Tarnished Edition", date: "2026-08-28", platforms: ["Switch 2"] },
  { title: "The Blood of the Dawnwalker", date: "2026-09-03", platforms: ["PC","PS5","Xbox"] },
  { title: "Marvel's Wolverine", date: "2026-09-15", platforms: ["PS5"] },
  { title: "Dune: Awakening", date: "2026-09-22", platforms: ["PS5","Xbox"] },
  { title: "Metal Gear Solid: Master Collection Vol.2", date: "2026-08-27", platforms: ["PS5","Switch","Switch 2","Xbox","PC"] },
  { title: "Gears of War: E-Day", date: "2026-10-06", platforms: ["Xbox","PC"] },
  { title: "Kingdom Hearts Collection", date: "2026-10-08", platforms: ["PS5","Xbox","PC","Switch 2"] },
  { title: "Castlevania: Belmont's Curse", date: "2026-10-15", platforms: ["PS5","Xbox","PC"] },
  { title: "Grand Theft Auto 6", date: "2026-11-19", platforms: ["PS5","Xbox"] },
  { title: "Resonance: A Plague Tale Legacy", date: "2026-08-27", platforms: ["PS5","Xbox","PC"] },
  { title: "Star Wars Zero Company", date: "2026-08-27", platforms: ["PS5","Xbox","PC"] },
  { title: "Silent Hill Townfall", date: "2026-09-24", platforms: ["PS5","PC"] },
  { title: "Onimusha: Way of the Sword", date: "2026-09-25", platforms: ["PS5","Xbox","PC","Switch 2"] },
  { title: "Mafia: The Old Country", date: "2026-08-14", platforms: ["PC","Xbox","PS5"] },
  { title: "Grave Seasons", date: "2026-08-14", platforms: ["PC","Xbox","PS5","Switch"] },
  { title: "The Sinking City 2", date: "2026-08-18", platforms: ["PC","PS5","Xbox"] },
  { title: "Phantom Blade 0", date: "2026-10-29", platforms: ["PS5","PC"] },
  { title: "Metaphor: Refantazio", date: "2026-11-12", platforms: ["Switch 2"] },
  { title: "Xenoblade Chronicles 3", date: "2026-12-03", platforms: ["Switch 2"] },
];

function formatGameDate(iso: string): string {
  if (!iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  const months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  if (d) return `${parseInt(d)}. ${months[parseInt(m)-1]} ${y}`;
  return `${months[parseInt(m)-1]} ${y}`;
}

function mapGameToRelease(g: RawGame, idx: number): ReleaseItem {
  return { id: `game-${idx}`, title: g.title, titleOrig: g.title, image: "", banner: null, date: formatGameDate(g.date), genres: g.platforms, type: "Game", score: null, url: `https://www.google.com/search?q=${encodeURIComponent(g.title+" game")}`, category: "game" };
}

const RAWG_BASE = "https://api.rawg.io/api";

interface RAWGResult {
  id: number; name: string; released: string | null;
  background_image: string | null;
  platforms: { platform: { id: number; name: string } }[] | null;
  metacritic: number | null;
}

async function rawgFetch(endpoint: string): Promise<RAWGResult[]> {
  const key = process.env.RAWG_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`${RAWG_BASE}${endpoint}${endpoint.includes("?")?"&":"?"}key=${key}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.results || [];
  } catch { return []; }
}

function rawgToRelease(r: RAWGResult): ReleaseItem {
  return {
    id: `rawg-${r.id}`, title: r.name, titleOrig: r.name,
    image: r.background_image || "", banner: null,
    date: r.released ? new Date(r.released).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" }) : "TBA",
    genres: (r.platforms || []).slice(0, 4).map((p: any) => p.platform?.name || "").filter(Boolean),
    type: "Game", score: r.metacritic || null,
    url: `https://rawg.io/games/${r.id}`, category: "game",
  };
}

export async function fetchUpcomingGames(): Promise<ReleaseItem[]> {
  const today = new Date().toISOString().split("T")[0];
  const nextYear = `${new Date().getFullYear() + 1}-12-31`;
  const rawg = await rawgFetch(`/games?dates=${today},${nextYear}&ordering=released&page_size=40`);
  if (rawg.length > 0) return rawg.map(rawgToRelease);
  return GAMES_DATA.map(mapGameToRelease);
}

export async function searchGames(query: string): Promise<ReleaseItem[]> {
  const rawg = await rawgFetch(`/games?search=${encodeURIComponent(query)}&page_size=30`);
  if (rawg.length > 0) return rawg.map(rawgToRelease);
  const lower = query.toLowerCase();
  return GAMES_DATA.filter((g) => g.title.toLowerCase().includes(lower)).map(mapGameToRelease);
}
