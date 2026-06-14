import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Movie } from "../types";
import { getPosterUrl } from "../lib/tmdb";

interface MovieRowProps {
  title: string;
  icon?: string;
  movies: Movie[];
  onMovieClick: (id: number) => void;
}

export default function MovieRow({ title, icon, movies, onMovieClick }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({
        left: target,
        behavior: "smooth",
      });
    }
  };

  if (movies.length === 0) {
    return (
      <div id={`row-skeleton-${title}`} className="px-6 md:px-16 mb-10">
        <h2 className="font-display text-2xl text-[#E50914] tracking-wider mb-6 uppercase flex items-center gap-2">
          {icon && <span>{icon}</span>} {title}
        </h2>
        <div className="flex gap-5 overflow-x-auto no-scrollbar">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="min-w-[160px] sm:min-w-[190px] md:min-w-[210px] aspect-[2/3] bg-neutral-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id={`row-container-${title}`} className="row-container px-6 md:px-16 relative group select-none">
      <h2 className="font-display text-2xl md:text-3xl text-white tracking-wide mb-5 flex items-center gap-2 font-bold uppercase select-none">
        {icon && <span className="text-[#E50914]">{icon}</span>}
        <span className="text-[#E50914]">{title.split(" ")[0]}</span>{" "}
        <span>{title.split(" ").slice(1).join(" ")}</span>
      </h2>

      <div className="relative">
        {/* Left Drag Indicator / Button controls */}
        {showLeftArrow && (
          <button
            id={`row-scroll-left-${title}`}
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 w-10 md:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer rounded-r-md border-r border-white/5"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:scale-110" />
          </button>
        )}

        <div
          id={`row-list-${title}`}
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1 -mx-1"
        >
          {movies.map((movie) => {
            const year = movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "2026";
            const posterSrc = getPosterUrl(movie.poster_path);

            return (
              <div
                id={`movie-card-${movie.id}`}
                key={movie.id}
                onClick={() => onMovieClick(movie.id)}
                className="min-w-[165px] sm:min-w-[195px] md:min-w-[215px] group/card cursor-pointer transition-all duration-300 transform origin-bottom hover:-translate-y-1.5"
              >
                {/* Poster container with high contrast borders and glow shadows */}
                <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border border-white/5 bg-neutral-950 transition-all duration-300 group-hover/card:border-red-500/50 group-hover/card:shadow-[0_0_24px_rgba(229,9,20,0.35)]">
                  <img
                    alt={movie.title}
                    src={posterSrc}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  
                  {/* Floating Rating overlay bottom */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-sm text-[#ffdb3c] border border-yellow-500/10">
                    <Star className="w-3 h-3 fill-[#ffdb3c] stroke-[#ffdb3c]" />
                    <span className="font-sans text-xs font-bold leading-none">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Sub-card metadata details */}
                <div className="mt-3 px-1">
                  <h3 className="font-sans text-sm font-semibold text-white truncate group-hover/card:text-[#E50914] transition-colors">
                    {movie.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 mt-0.5">
                    {year}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow control */}
        <button
          id={`row-scroll-right-${title}`}
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-10 md:w-12 bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer rounded-l-md border-l border-white/5"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
