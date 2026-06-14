import { Bookmark, Star, Clapperboard } from "lucide-react";
import { FavoriteMovie, Genre } from "../types";

interface StatsSectionProps {
  favorites: FavoriteMovie[];
  genres: Genre[];
}

export default function StatsSection({ favorites, genres }: StatsSectionProps) {
  // 1. Calculate Average Rating
  const averageRating =
    favorites.length > 0
      ? favorites.reduce((acc, curr) => acc + curr.vote_average, 0) / favorites.length
      : 0;

  // 2. Compute Favorite Genre dynamically
  const getFavoriteGenreName = (): string => {
    if (favorites.length === 0) return "-";

    // Count occurrence of genre IDs among favorites. We fall back to standard genre mapping.
    const counts: Record<number, number> = {};
    favorites.forEach((movie) => {
      // If movie has genre_ids, count them
      if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach((gId) => {
          counts[gId] = (counts[gId] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(counts);
    if (entries.length === 0) return "-";

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1]);
    const topGenreId = parseInt(entries[0][0], 10);
    const matchedGenre = genres.find((g) => g.id === topGenreId);

    return matchedGenre ? matchedGenre.name : "Varios";
  };

  const favoriteGenre = getFavoriteGenreName();

  const stats = [
    {
      id: "stat-favs",
      title: "Favoritos",
      value: favorites.length.toString(),
      icon: <Bookmark className="w-6 h-6 text-[#E50914]" />,
      detail: favorites.length === 1 ? "Película guardada" : "Películas guardadas",
    },
    {
      id: "stat-avg",
      title: "Promedio Visto",
      value: averageRating > 0 ? averageRating.toFixed(1) : "0.0",
      icon: <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />,
      detail: "Calificación TMDB de tu lista",
    },
    {
      id: "stat-genre",
      title: "Género Preferido",
      value: favoriteGenre,
      icon: <Clapperboard className="w-6 h-6 text-cyan-400" />,
      detail: favorites.length > 0 ? "Basado en tu lista personalizada" : "Agrega películas para analizar",
    },
  ];

  return (
    <section id="stats" className="px-6 md:px-16 py-12 select-none max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            id={`stat-card-${stat.id}`}
            key={stat.id}
            className="bg-[#161616] p-6 rounded-xl border border-white/5 flex items-center gap-5 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-black/50 hover:bg-[#1C1C1C]"
          >
            <div className="p-3 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="font-sans text-xs text-neutral-400 font-bold uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="font-display text-4xl font-extrabold text-white mt-1 leading-none">
                {stat.value}
              </p>
              <p className="font-sans text-xs text-neutral-500 mt-1.5 leading-tight">
                {stat.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
