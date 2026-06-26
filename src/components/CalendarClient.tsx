"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ReleaseCard from "@/components/ReleaseCard";
import DetailModal from "@/components/DetailModal";
import type { ReleaseItem } from "@/lib/anilist";

type Category = "game" | "anime" | "manga" | "tv" | "movie";
type SortKey = "date" | "name" | "score";

const TABS: { key: Category; label: string; icon: string; catClass: string }[] = [
  { key: "game", label: "Games", icon: "🎮", catClass: "category-game" },
  { key: "movie", label: "Filme", icon: "🎬", catClass: "category-movie" },
  { key: "tv", label: "Serien", icon: "📺", catClass: "category-tv" },
  { key: "anime", label: "Anime", icon: "🌸", catClass: "category-anime" },
  { key: "manga", label: "Manga", icon: "📚", catClass: "category-manga" },
];

const REGIONS = [
  { code: "DE", label: "🇩🇪" },
  { code: "US", label: "🇺🇸" },
  { code: "JP", label: "🇯🇵" },
  { code: "GB", label: "🇬🇧" },
  { code: "FR", label: "🇫🇷" },
  { code: "KR", label: "🇰🇷" },
];

const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

// Get first day of current month as YYYY-MM-DD
function getCurrentMonthStart(): { year: string; month: string } {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, "0"),
  };
}

function navigateMonth(y: string, m: string, dir: -1 | 1): { year: string; month: string } {
  let month = parseInt(m) + dir;
  let year = parseInt(y);
  if (month < 1) { month = 12; year--; }
  if (month > 12) { month = 1; year++; }
  return { year: String(year), month: String(month).padStart(2, "0") };
}

function getMonthKey(dateStr: string): string {
  const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : "2026";
  const m = MONTHS_DE.findIndex((mo) => dateStr.includes(mo));
  if (m >= 0) return `${year}-${String(m + 1).padStart(2, "0")}`;
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`;
  return `${year}-99`;
}

export default function CalendarClient() {
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("game");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("DE");
  const [{ year, month }, setYearMonth] = useState(getCurrentMonthStart);
  const [selectedItem, setSelectedItem] = useState<ReleaseItem | null>(null);

  const isSearching = search.trim().length > 0;

  const fetchData = useCallback(async (
    cat: Category, reg: string, q: string, y: string, m: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ category: cat, region: reg, year: y, month: m });
      if (q.trim()) {
        params.set("q", q.trim());
        const ym = q.match(/\b(19|20)\d{2}\b/);
        if (ym) params.set("year", ym[0]);
      }
      const res = await fetch("/api/releases?" + params.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Fehler beim Laden");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(category, region, search, year, month), 300);
    return () => clearTimeout(timer);
  }, [category, region, search, year, month, fetchData]);

  const filtered = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === "date") return getMonthKey(a.date).localeCompare(getMonthKey(b.date));
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return (b.score || 0) - (a.score || 0);
    });
  }, [items, sortBy]);

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
  const showRegion = category === "movie" || category === "tv";
  const monthLabel = `${MONTHS_DE[parseInt(month) - 1]} ${year}`;
  const prev = navigateMonth(year, month, -1);
  const next = navigateMonth(year, month, 1);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Title + Month Navigator */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-purple-400">Release</span> Kalender
            </h1>
            {!isSearching && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setYearMonth(prev)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  ◀
                </button>
                <span className="text-sm font-medium text-zinc-300 min-w-[120px] text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={() => setYearMonth(next)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  ▶
                </button>
              </div>
            )}
            <span className="text-xs text-zinc-600">{filtered.length} Einträge</span>
          </div>

          {/* Tabs */}
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

          {/* Search, Sort, Region */}
          <div className="flex gap-2 mt-1 flex-wrap">
            <input
              type="text"
              placeholder='Suchen... (z.B. "Matrix 1999")'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[160px] bg-zinc-900 border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-zinc-900 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-zinc-300"
            >
              <option value="date">Datum</option>
              <option value="name">Name</option>
              <option value="score">Bewertung</option>
            </select>
            {showRegion && (
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-zinc-900 border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-zinc-300"
              >
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-zinc-500">Lade {monthLabel}...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl mb-4">⚠️</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-sm">
              {isSearching ? "Keine Ergebnisse" : `Keine Releases im ${monthLabel}`}
            </p>
            {isSearching && (
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-purple-400 hover:text-purple-300">
                Suche zurücksetzen
              </button>
            )}
          </div>
        )}

        {!loading && !error && grouped.map(([monthKey, monthItems]) => {
          const [y, m] = monthKey.split("-");
          const monthName = MONTHS_DE[parseInt(m) - 1] || monthKey;
          const displayYear = (y !== "9999" && y !== year) ? y : "";

          return (
            <section key={monthKey} className="mb-8 animate-fade-in">
              <h2 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
                <span className={tabStyle.replace("category-", "text-")}>{monthName}</span>
                {displayYear && <span className="text-xs text-zinc-600 font-normal">{displayYear}</span>}
                <span className="text-xs text-zinc-700 ml-1">({monthItems.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {monthItems.map((item) => (<ReleaseCard key={item.id} item={item} onClick={setSelectedItem} />))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-zinc-700">
        <p>Daten von <a href="https://rawg.io" className="hover:text-zinc-500 underline">RAWG</a>, <a href="https://anilist.co" className="hover:text-zinc-500 underline">AniList</a>, <a href="https://themoviedb.org" className="hover:text-zinc-500 underline">TMDB</a>, <a href="https://videogameschronicle.com" className="hover:text-zinc-500 underline">VGC</a></p>
      </footer>

      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
