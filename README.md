# Release Kalender

Dein persönlicher Release-Kalender für Games, Anime, Manga, Serien und Filme. Alle kommenden Releases auf einen Blick.

## Features

- 🎮 **Games** — Release-Daten von VGC & GameInformer
- 🌸 **Anime** — Live-Daten via AniList GraphQL API
- 📚 **Manga** — Live-Daten via AniList GraphQL API
- 📺 **Serien** — TMDB API (API-Key benötigt)
- 🎬 **Filme** — TMDB API (API-Key benötigt)

## Setup

```bash
npm install
npm run dev
```

### TMDB API Key (optional)

Für Filme & Serien brauchst du einen kostenlosen API-Key von [themoviedb.org](https://www.themoviedb.org/settings/api).

`.env.local`:
```
TMDB_API_KEY=dein_key_hier
```

## Quellen

- [AniList](https://anilist.co) — Anime & Manga
- [TMDB](https://themoviedb.org) — Filme & Serien
- [VGC](https://videogameschronicle.com) — Games
- [GameInformer](https://gameinformer.com) — Games

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
