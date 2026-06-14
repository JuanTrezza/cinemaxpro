import { useState, useEffect, useRef } from "react";
import { X, Search, Clapperboard } from "lucide-react";
import { Movie } from "../types";
import { searchMovies, getPosterUrl } from "../lib/tmdb";

interface SearchOverlayProps {
  onClose: () => void;
  onMovieClick: (id: number) => void;
}

export default function SearchOverlay({ onClose, onMovieClick }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced search query
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMovies(query);
        // Only keep movies that contain poster_path or backdrop_path for aesthetic purposes
        const filtered = data.filter((m) => m.poster_path);
        setResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      id="search-overlay"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col p-6 md:p-16 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto w-full">
        {/* Search Input Bar */}
        <div className="flex-1 mr-6 relative">
          <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 text-neutral-400" />
          <input
            id="search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar títulos, actores o directores con Cinemax..."
            className="bg-transparent border-b-2 border-white/10 focus:border-[#E50914] text-2xl sm:text-3xl md:text-4xl font-sans tracking-wide text-white focus:outline-none w-full pl-12 pr-4 py-3 placeholder:opacity-20 transition-all duration-300"
          />
        </div>
        <button
          id="search-close"
          onClick={onClose}
          className="w-12 h-12 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer select-none shrink-0"
          aria-label="Cerrar búsqueda"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Search results catalog */}
      <div className="max-w-7xl mx-auto w-full flex-1">
        {loading && (
          <div className="flex items-center justify-center py-24 flex-col gap-3">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-sans text-xs font-semibold text-neutral-500 uppercase tracking-widest animate-pulse">
              Buscando títulos...
            </p>
          </div>
        )}

        {!loading && query.trim() !== "" && results.length === 0 && (
          <div className="text-center py-32 opacity-40">
            <Clapperboard className="w-16 h-16 mx-auto mb-4 text-[#E50914]" />
            <p className="font-sans text-lg text-white">No se encontraron películas para "{query}"</p>
            <p className="font-sans text-xs text-neutral-400 mt-2">Prueba buscando palabras como "Michael", "Mortal", "Obsesión" u "Hollywood"</p>
          </div>
        )}

        {!loading && query.trim() === "" && (
          <div className="text-center py-32 opacity-30 select-none">
            <Search className="w-16 h-16 mx-auto mb-4 text-[#E50914]" />
            <p className="font-sans text-lg text-white">Escribe el título de tu película favorita</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div
            id="search-results-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {results.map((movie) => {
              const posterSrc = getPosterUrl(movie.poster_path);
              const year = movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : "2026";

              return (
                <div
                  id={`search-result-card-${movie.id}`}
                  key={movie.id}
                  onClick={() => {
                    onMovieClick(movie.id);
                    onClose();
                  }}
                  className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/5 bg-neutral-950 group-hover:border-red-500/50 group-hover:shadow-[0_0_24px_rgba(229,9,20,0.3)]">
                    <img
                      src={posterSrc}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="mt-3 font-sans text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                    {movie.title}
                  </h4>
                  <p className="font-sans text-xs text-neutral-500 mt-0.5">{year}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
