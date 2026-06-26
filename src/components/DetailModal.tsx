"use client";

import type { ReleaseItem } from "@/lib/anilist";
import { useEffect, useCallback } from "react";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string; border: string }> = {
  game: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "🎮", border: "border-purple-500/30" },
  anime: { bg: "bg-rose-500/10", text: "text-rose-400", icon: "🌸", border: "border-rose-500/30" },
  manga: { bg: "bg-orange-500/10", text: "text-orange-400", icon: "📚", border: "border-orange-500/30" },
  tv: { bg: "bg-cyan-500/10", text: "text-cyan-400", icon: "📺", border: "border-cyan-500/30" },
  movie: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "🎬", border: "border-yellow-500/30" },
};

interface Props {
  item: ReleaseItem | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: Props) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!item) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [item, handleEsc]);

  if (!item) return null;

  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.game;
  const hasDescription = item.description && item.description.length > 10;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--card)] border ${style.border} shadow-2xl animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-zinc-400 hover:text-white hover:bg-black/70 transition-colors"
          aria-label="Schließen"
        >
          ✕
        </button>

        {/* Banner */}
        {item.banner && (
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              src={item.banner}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className={`p-5 sm:p-6 ${item.banner ? "-mt-12 relative z-10" : ""}`}>
          {/* Header */}
          <div className="flex gap-4 mb-4">
            {/* Poster */}
            <div className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden bg-zinc-800 border border-[var(--border)]">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {style.icon}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`${style.bg} ${style.text} text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                  {style.icon} {item.category}
                </span>
                {item.score && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded">
                    {item.score}%
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {item.title}
              </h2>
              {item.titleOrig !== item.title && (
                <p className="text-sm text-zinc-500 mt-0.5">{item.titleOrig}</p>
              )}
              <p className="text-sm text-zinc-400 mt-2">{item.date}</p>
              <p className={`text-xs ${style.text} mt-1`}>{item.type}</p>
            </div>
          </div>

          {/* Genres */}
          {item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.genres.map((g, i) => (
                <span key={i} className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {hasDescription && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Beschreibung</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {item.description!.length > 500
                  ? item.description!.slice(0, 500) + "…"
                  : item.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-lg ${style.bg} ${style.text} border ${style.border} hover:bg-opacity-20 transition-all`}
            >
              Auf {item.category === "anime" || item.category === "manga" ? "AniList" : item.category === "game" ? "RAWG" : "TMDB"} ansehen ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
