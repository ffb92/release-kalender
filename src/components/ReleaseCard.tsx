"use client";

import type { ReleaseItem } from "@/lib/anilist";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  game: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "🎮" },
  anime: { bg: "bg-rose-500/10", text: "text-rose-400", icon: "🌸" },
  manga: { bg: "bg-orange-500/10", text: "text-orange-400", icon: "📚" },
  tv: { bg: "bg-cyan-500/10", text: "text-cyan-400", icon: "📺" },
  movie: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "🎬" },
};

interface Props {
  item: ReleaseItem;
  onClick: (item: ReleaseItem) => void;
}

export default function ReleaseCard({ item, onClick }: Props) {
  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.game;

  return (
    <button
      onClick={() => onClick(item)}
      className={`card-glow category-${item.category} text-left w-full rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden hover:bg-[var(--card-hover)] transition-all duration-200 group cursor-pointer`}
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] bg-zinc-800 relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
            <span className="text-4xl mb-2">{style.icon}</span>
            <span className="text-xs text-center px-2">{item.title}</span>
          </div>
        )}
        {/* Category Badge */}
        <span className={`absolute top-2 left-2 ${style.bg} ${style.text} text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
          {item.category}
        </span>
        {/* Score Badge */}
        {item.score && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {item.score}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">{item.date}</p>
        {/* Type/Platform tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.genres.slice(0, 3).map((g, i) => (
            <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
              {g}
            </span>
          ))}
          <span className={`text-[10px] ${style.bg} ${style.text} px-1.5 py-0.5 rounded`}>
            {item.type}
          </span>
        </div>
      </div>
    </button>
  );
}
