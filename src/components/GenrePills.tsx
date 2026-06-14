import { Genre } from "../types";

interface GenrePillsProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onGenreSelect: (genreId: number | null) => void;
}

export default function GenrePills({
  genres,
  selectedGenreId,
  onGenreSelect,
}: GenrePillsProps) {
  // Let's filter or slice to keep the UI clean with the primary standard genres
  const displayGenres = genres.filter((g) =>
    ["Acción", "Aventura", "Animación", "Comedia", "Crimen", "Documental", "Drama", "Familia", "Fantasía", "Historia", "Terror", "Misterio", "Ciencia ficción", "Suspense"].includes(g.name)
  );

  // If TMDB returns different translated words, let's fall back to showing the first 12 genres
  const listToRender = displayGenres.length > 0 ? displayGenres : genres.slice(0, 14);

  const selectedGenreName =
    selectedGenreId !== null
      ? genres.find((genre) => genre.id === selectedGenreId)?.name
      : null;

  return (
    <div id="generos" className="px-6 md:px-16 py-6 select-none scroll-mt-24">
      <div id="genre-pills" className="flex gap-3 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          id="genre-pill-all"
          onClick={() => onGenreSelect(null)}
          className={`px-5 py-2 rounded-full border text-xs md:text-sm font-semibold whitespace-nowrap tracking-wide transition-all cursor-pointer ${
            selectedGenreId === null
              ? "bg-[#E50914] text-white border-transparent shadow-lg shadow-red-900/25"
              : "border-white/10 text-neutral-400 hover:text-white hover:border-white/30"
          }`}
        >
          Explorar todos
        </button>

        {listToRender.map((genre) => {
          const isSelected = selectedGenreId === genre.id;
          return (
            <button
              id={`genre-pill-${genre.id}`}
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              className={`px-5 py-2 rounded-full border text-xs md:text-sm font-semibold whitespace-nowrap tracking-wide transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#E50914] text-white border-transparent shadow-lg shadow-red-900/25"
                  : "border-white/10 text-neutral-400 hover:text-white hover:border-white/30"
              }`}
            >
              {genre.name}
            </button>
          );
        })}

        {selectedGenreId !== null && (
          <button
            id="genre-pill-clear"
            onClick={() => onGenreSelect(null)}
            className="px-5 py-2 rounded-full border border-[#E50914]/80 text-[#E50914] hover:text-white hover:bg-[#E50914] text-xs md:text-sm font-semibold whitespace-nowrap tracking-wide transition-all cursor-pointer"
            title={selectedGenreName ? `Limpiar filtro de ${selectedGenreName}` : "Limpiar filtro"}
          >
            ✕ Limpiar filtro
          </button>
        )}
      </div>
    </div>
  );
}
