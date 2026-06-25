import type { ReleaseItem } from "./anilist";

interface RawGame {
  title: string;
  date: string;
  platforms: string[];
}

const GAMES_DATA: RawGame[] = [
  { title: "eFootball Kick Off!", date: "2026-06-03", platforms: ["Switch 2"] },
  { title: "Final Fantasy VII Rebirth", date: "2026-06-03", platforms: ["Xbox Series X/S", "Switch 2"] },
  { title: "The 7th Guest Remake", date: "2026-06-04", platforms: ["PC", "PS5", "Switch", "Switch 2", "Xbox"] },
  { title: "House Flipper Remastered Collection", date: "2026-06-04", platforms: ["PC", "PS5", "Xbox"] },
  { title: "River City Saga: Journey to the West", date: "2026-06-04", platforms: ["PC", "PS5", "Switch"] },
  { title: "Gothic 1 Remake", date: "2026-06-05", platforms: ["PS5", "Xbox Series X/S", "PC"] },
  { title: "Solarpunk", date: "2026-06-08", platforms: ["PS5", "Xbox", "Switch 2", "PC"] },
  { title: "NBA The Run", date: "2026-06-09", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Xenoblade Chronicles Definitive Edition", date: "2026-06-09", platforms: ["Switch 2"] },
  { title: "33 Immortals", date: "2026-06-10", platforms: ["Xbox", "PC"] },
  { title: "Beastro", date: "2026-06-11", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Frog Sqwad", date: "2026-06-11", platforms: ["Xbox", "PC"] },
  { title: "Denshattack!", date: "2026-06-17", platforms: ["PC", "PS5", "Xbox", "Switch 2"] },
  { title: "Observer: System Redux", date: "2026-06-18", platforms: ["Switch 2"] },
  { title: "R-Type Tactics I–II Cosmos", date: "2026-06-18", platforms: ["Xbox", "PS5", "PS4", "Switch", "Switch 2", "PC"] },
  { title: "Soccer Kid Collection", date: "2026-06-18", platforms: ["Xbox", "PS5", "PS4", "Switch", "PC"] },
  { title: "Devil May Cry 5: Devil Hunter Edition", date: "2026-06-23", platforms: ["Switch 2"] },
  { title: "Destroy All Humans! (2020)", date: "2026-06-23", platforms: ["Switch 2"] },
  { title: "Wanderstop", date: "2026-06-23", platforms: ["Switch", "Switch 2"] },
  { title: "Deltarune: Chapter 5", date: "2026-06-24", platforms: ["PS5", "Switch 2", "PS4", "Switch", "PC"] },
  { title: "Dead or Alive 6 Last Round", date: "2026-06-25", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Citizen Sleeper 2: Starward Vector", date: "2026-06-25", platforms: ["Switch 2"] },
  { title: "Star Fox", date: "2026-06-25", platforms: ["Switch 2"] },
  { title: "High on Life 2", date: "2026-07-01", platforms: ["Switch 2"] },
  { title: "Avatar Legends: The Fighting Game", date: "2026-07-02", platforms: ["Xbox", "PS5", "Switch", "Switch 2", "PC"] },
  { title: "Rhythm Heaven Groove", date: "2026-07-02", platforms: ["Switch 2"] },
  { title: "Doom: The Dark Ages – Revelations", date: "2026-07-07", platforms: ["PC", "Xbox", "PS5"] },
  { title: "ESO – Thieves Guild", date: "2026-07-08", platforms: ["PC", "Xbox", "PS5"] },
  { title: "Assassin's Creed Black Flag Resynced", date: "2026-07-09", platforms: ["PC", "PS5", "Xbox"] },
  { title: "EA Sports College Football 27", date: "2026-07-09", platforms: ["PC", "PS5", "Xbox"] },
  { title: "Granblue Fantasy: Relink – Endless Ragnarok", date: "2026-07-09", platforms: ["PS5", "PS4", "Switch 2", "PC"] },
  { title: "Digimon Story Time Stranger", date: "2026-07-10", platforms: ["Switch", "Switch 2"] },
  { title: "Palworld 1.0", date: "2026-07-10", platforms: ["PC", "Xbox", "PS5"] },
  { title: "Ascend to Zero", date: "2026-07-13", platforms: ["Xbox", "PC"] },
  { title: "D-Topia", date: "2026-07-14", platforms: ["PC", "PS5", "Switch", "Switch 2", "Xbox"] },
  { title: "Culdcept Begins", date: "2026-07-16", platforms: ["Switch 2", "PC"] },
  { title: "Moss: The Forgotten Relic", date: "2026-07-16", platforms: ["PS5", "Xbox", "Switch", "Switch 2", "PC"] },
  { title: "Warhammer 40,000: Speed Freaks", date: "2026-07-16", platforms: ["Xbox", "PS5"] },
  { title: "Dialoop", date: "2026-07-17", platforms: ["Switch 2"] },
  { title: "Disgaea Mayhem", date: "2026-07-23", platforms: ["PC", "PS5", "Switch", "Switch 2"] },
  { title: "Final Fantasy X/X-2 HD Remaster", date: "2026-07-23", platforms: ["Switch 2"] },
  { title: "Splatoon Raiders", date: "2026-07-23", platforms: ["Switch 2"] },
  { title: "Halo: Campaign Evolved", date: "2026-07-28", platforms: ["Xbox", "PS5", "PC"] },
  { title: "Wuthering Waves", date: "2026-07", platforms: ["Xbox"] },
  { title: "Xenoblade Chronicles 2 – Switch 2 Edition", date: "2026-07-30", platforms: ["Switch 2"] },
  { title: "Beast of Reincarnation", date: "2026-08-04", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Big Walk", date: "2026-08-04", platforms: ["PC", "PS5", "Switch 2"] },
  { title: "Lies of P", date: "2026-08-06", platforms: ["Switch 2"] },
  { title: "Marvel Tokon: Fighting Souls", date: "2026-08-06", platforms: ["PS5", "PC"] },
  { title: "Wild Blue Skies", date: "2026-08-13", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Grave Seasons", date: "2026-08-14", platforms: ["PC", "Xbox", "PS5", "Switch"] },
  { title: "Mafia: The Old Country – Man of Honor", date: "2026-08-14", platforms: ["PC", "Xbox", "PS5"] },
  { title: "The Sinking City 2", date: "2026-08-18", platforms: ["PC", "PS5", "Xbox"] },
  { title: "Metal Gear Solid: Master Collection Vol. 2", date: "2026-08-27", platforms: ["PS5", "Switch", "Switch 2", "Xbox", "PC"] },
  { title: "Resonance: A Plague Tale Legacy", date: "2026-08-27", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Star Wars Zero Company", date: "2026-08-27", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Captain Tsubasa II: World Fighters", date: "2026-08-28", platforms: ["PS5", "Switch", "Xbox", "PC"] },
  { title: "Elden Ring: Tarnished Edition", date: "2026-08-28", platforms: ["Switch 2"] },
  { title: "Orbitals", date: "2026-09-03", platforms: ["Switch 2"] },
  { title: "The Blood of the Dawnwalker", date: "2026-09-03", platforms: ["PC", "PS5", "Xbox"] },
  { title: "Wo Long: Fallen Dynasty", date: "2026-09-03", platforms: ["Switch 2"] },
  { title: "Halloween: The Game", date: "2026-09-08", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Destroy All Humans 2: Reprobed", date: "2026-09-15", platforms: ["Switch 2"] },
  { title: "Marvel's Wolverine", date: "2026-09-15", platforms: ["PS5"] },
  { title: "Runescape: Dragonwilds", date: "2026-09-15", platforms: ["PS5", "Xbox", "Switch 2"] },
  { title: "Fire Emblem: Fortune's Weave", date: "2026-09-17", platforms: ["Switch 2"] },
  { title: "Lego Batman: Legacy of the Dark Knight", date: "2026-09-18", platforms: ["Switch 2"] },
  { title: "Dune: Awakening", date: "2026-09-22", platforms: ["PS5", "Xbox"] },
  { title: "Control Resonant", date: "2026-09-24", platforms: ["PC", "PS5", "Xbox"] },
  { title: "Dragon Quest XI S: Definitive Edition", date: "2026-09-24", platforms: ["Switch 2"] },
  { title: "Hell is Us", date: "2026-09-24", platforms: ["Switch 2"] },
  { title: "Hotwheels Infinite Rush", date: "2026-09-24", platforms: ["PS5", "Xbox", "Switch 2", "PC"] },
  { title: "Silent Hill Townfall", date: "2026-09-24", platforms: ["PS5", "PC"] },
  { title: "Onimusha: Way of the Sword", date: "2026-09-25", platforms: ["PS5", "Xbox", "PC", "Switch 2"] },
  { title: "Ace Combat 8: Wings of Theve", date: "2026-09-28", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Minecraft Dungeons 2", date: "2026-09-29", platforms: ["PC", "PS5", "Xbox", "Switch 2"] },
  { title: "Crimson Moon", date: "2026-09", platforms: ["PC", "PS5", "Xbox"] },
  { title: "Dynasty Warriors 3 Remastered", date: "2026-10-01", platforms: ["PS5", "Xbox", "Switch 2", "PC"] },
  { title: "Rayman Legends Retold", date: "2026-10-01", platforms: ["PS5", "Xbox", "PC", "Switch 2"] },
  { title: "Disney Epic Mickey: Rebrushed", date: "2026-10-06", platforms: ["Switch 2"] },
  { title: "Gears of War: E-Day", date: "2026-10-06", platforms: ["Xbox", "PC"] },
  { title: "Star Wars: Galactic Racer", date: "2026-10-06", platforms: ["PC", "Xbox", "PS5"] },
  { title: "Hellraiser: Revival", date: "2026-10-08", platforms: ["PC", "Xbox", "PS5"] },
  { title: "Kingdom Hearts Collection", date: "2026-10-08", platforms: ["PS5", "Xbox", "PC", "Switch 2"] },
  { title: "Dragon's Dogma 2: Dark Arisen", date: "2026-10-09", platforms: ["PC", "PS5", "Xbox", "Switch 2"] },
  { title: "SpongeBob: Titans of the Tide", date: "2026-10-13", platforms: ["Switch"] },
  { title: "Valor Mortis", date: "2026-10-13", platforms: ["Xbox", "PS5", "PC"] },
  { title: "Castlevania: Belmont's Curse", date: "2026-10-15", platforms: ["PS5", "Xbox", "PC"] },
  { title: "Ratatan", date: "2026-10-15", platforms: ["PS5", "PS4", "Xbox", "Switch 2"] },
  { title: "Toy Story 3 Complete Edition", date: "2026-10-15", platforms: ["Switch", "Switch 2", "Xbox", "PS4", "PS5", "PC"] },
  { title: "Tales of Eternia Remastered", date: "2026-10-16", platforms: ["PS5", "PS4", "Xbox", "PC", "Switch", "Switch 2"] },
  { title: "Final Fantasy Resonance", date: "2026-10-22", platforms: ["PC", "PS5", "Xbox", "Switch", "Switch 2"] },
  { title: "Nintendo Switch Sports Resort", date: "2026-10-22", platforms: ["Switch 2"] },
  { title: "One Piece: Grand Gourmet", date: "2026-10-23", platforms: ["PC", "Switch", "Switch 2"] },
  { title: "Hello Kitty Party Land", date: "2026-10-29", platforms: ["Switch", "Switch 2"] },
  { title: "Phantom Blade 0", date: "2026-10-29", platforms: ["PS5", "PC"] },
  { title: "Metaphor: Refantazio", date: "2026-11-12", platforms: ["Switch 2"] },
  { title: "Grand Theft Auto 6", date: "2026-11-19", platforms: ["PS5", "Xbox"] },
  { title: "Dragon Quest Monsters: The Withered World", date: "2026-12-03", platforms: ["PC", "PS5", "Xbox", "Switch", "Switch 2"] },
  { title: "Xenoblade Chronicles 3 – Switch 2 Edition", date: "2026-12-03", platforms: ["Switch 2"] },
];

function formatGameDate(iso: string): string {
  if (!iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  const month = months[parseInt(m) - 1];
  if (d) return `${parseInt(d)}. ${month} ${y}`;
  return `${month} ${y}`;
}

function mapGameToRelease(g: RawGame, idx: number): ReleaseItem {
  return {
    id: `game-${idx}`,
    title: g.title,
    titleOrig: g.title,
    image: "",
    banner: null,
    date: formatGameDate(g.date),
    genres: g.platforms,
    type: "Game",
    score: null,
    url: `https://www.google.com/search?q=${encodeURIComponent(g.title + " game release")}`,
    category: "game",
  };
}

export async function fetchUpcomingGames(): Promise<ReleaseItem[]> {
  return GAMES_DATA.map(mapGameToRelease);
}
