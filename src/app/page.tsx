import { fetchUpcomingAnime, fetchUpcomingManga } from "@/lib/anilist";
import { fetchUpcomingMovies, fetchUpcomingTV } from "@/lib/tmdb";
import { fetchUpcomingGames } from "@/lib/games";
import CalendarClient from "@/components/CalendarClient";
import type { ReleaseItem } from "@/lib/anilist";

export const revalidate = 1800;

export default async function Home() {
  const [anime, manga, movies, tv, games] = await Promise.allSettled([
    fetchUpcomingAnime(),
    fetchUpcomingManga(),
    fetchUpcomingMovies(),
    fetchUpcomingTV(),
    fetchUpcomingGames(),
  ]);

  const allItems: ReleaseItem[] = [];

  const add = (result: PromiseSettledResult<ReleaseItem[]>, source: string) => {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      console.warn(`Failed to fetch ${source}:`, result.reason);
    }
  };

  add(anime, "anime");
  add(manga, "manga");
  add(movies, "movies");
  add(tv, "tv");
  add(games, "games");

  return <CalendarClient items={allItems} />;
}
