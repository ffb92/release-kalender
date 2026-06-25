"use client";

import { useState, useMemo, useEffect } from "react";
import ReleaseCard from "@/components/ReleaseCard";
import type { ReleaseItem } from "@/lib/anilist";

type Category = "all" | "game" | "anime" | "manga" | "tv" | "movie";
type SortKey = "date" | "name" | "score";

const TABS: { key: Category; label: string; icon: string; catClass: string }[] = [
  { key: "all", label: "Alle", icon: "📅", catClass: "category-game" },
  { key: "game", label: "Games", icon: "🎮", catClass: "category-game" },
  { key: "anime", label: "Anime", icon: "🌸", catClass: "category-anime" },
  { key: "manga", label: "Manga", icon: "📚", catClass: "category-manga" },
  { key: "tv", label: "Serien", icon: "📺", catClass: "category-tv" },
  { key: "movie", label: "Filme", icon: "🎬", catClass: "category-movie" },
];

const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

function getMonthKey(dateStr: string): string {
  const m = MONTHS_DE.findIndex((m) => dateStr.includes(m));
  if (m >= 0) return `2026-${String(m + 1).padStart(2, "0")}`;
  const match = dateStr.match(/(\d{4})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}`;
  return "9999-99";
}

export default function CalendarClient() {
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/releases?category=${category}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load releases:", e);
        setError("Fehler beim Laden der Daten");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.titleOrig.toLowerCase().includes(q) ||
          i.genres.some((g) => g.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "date") return getMonthKey(a.date).localeCompare(getMonthKey(b.date));
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return (b.score || 0) - (a.score || 0);
    });
    return result;
  }, [items, sortBy, search]);

  const grouped = useMemo(() => {
    const groups: Map<string, ReleaseItem[]> = new Map();
    for (const item of filtered) {
      const key = getMonthKey(item.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const tabStyle = TABS.find((t) => t.key === category)?.catClass || "category-game";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-purple-400">Release</span> Kalender
            </h1>
            <span className="text-xs text-zinc-600">{filtered.length} Einträge</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`tab-underline ${tab.catClass} ${category === tab.key ? "active" : ""} flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === tab.key ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex gap-2 mt-1">
            <input type="text" placeholder="Suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-zinc-900 border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="bg-zinc-900 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none">
              <option value="date">Datum</option>
              <option value="name">Name</option>
              <option value="score">Bewertung</option>
            </select>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-zinc-500">Lade Releases...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-5xl mb-4">⚠️</span>
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-xs text-purple-400 hover:text-purple-300">Neu laden</button>
          </div>
        )}
        {!loading && !error && grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-sm">Keine Einträge gefunden</p>
            {search && (<button onClick={() => setSearch("")} className="mt-2 text-xs text-purple-400 hover:text-purple-300">Suche zurücksetzen</button>)}
          </div>
        )}
        {!loading && !error && grouped.map(([monthKey, monthItems]) => {
          const [y, m] = monthKey.split("-");
          const monthName = MONTHS_DE[parseInt(m) - 1] || monthKey;
          const year = y !== "9999" ? y : "";
          return (
            <section key={monthKey} className="mb-8 animate-fade-in">
              <h2 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
                <span className={tabStyle.replace("category-", "text-")}>{monthName}</span>
                <span className="text-xs text-zinc-600 font-normal">{year}</span>
                <span className="text-xs text-zinc-700 ml-1">({monthItems.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {monthItems.map((item) => (<ReleaseCard key={item.id} item={item} />))}
              </div>
            </section>
          );
        })}
      </main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-zinc-700">
        <p>Daten von <a href="https://anilist.co" className="hover:text-zinc-500 underline">AniList</a>, <a href="https://themoviedb.org" className="hover:text-zinc-500 underline">TMDB</a>, <a href="https://videogameschronicle.com" className="hover:text-zinc-500 underline">VGC</a> &amp; <a href="https://gameinformer.com" className="hover:text-zinc-500 underline">GameInformer</a></p>
      </footer>
    </div>
  );
}
