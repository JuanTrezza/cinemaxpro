import { useState, useEffect, useRef } from "react";
import { Play, Plus, Check, Star } from "lucide-react";
import { Movie } from "../types";
import { getBackdropUrl } from "../lib/tmdb";

interface HeroProps {
  movies: Movie[];
  genresMap: Record<number, string>;
  onMovieClick: (id: number) => void;
  onToggleFavorite: (movie: Movie) => void;
  isFavorite: (id: number) => boolean;
}

export default function Hero({
  movies,
  genresMap,
  onMovieClick,
  onToggleFavorite,
  isFavorite,
}: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (movies.length === 0) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
          setFade(true);
        }, 600); // 600ms transition
      }, 8000); // rotate every 8 seconds
    };

    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies]);

  if (movies.length === 0) {
    return (
      <div id="hero-loader" className="w-full h-[80vh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const movieGenres = currentMovie.genre_ids
    .map((id) => genresMap[id])
    .filter(Boolean)
    .slice(0, 3)
    .join(" • ");

  const backdropSrc = getBackdropUrl(currentMovie.backdrop_path);
  const isInList = isFavorite(currentMovie.id);

  return (
    <div
      id="hero-banner"
      className="relative w-full h-[85vh] md:h-[95vh] text-white overflow-hidden bg-black select-none"
    >
      {/* Background Image Container */}
      <div
        id="hero-image-wrapper"
        className={`absolute inset-0 transition-all duration-1000 ease-in-out scale-105 transform ${
          fade ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      >
        <img
          id="hero-backdrop"
          src={backdropSrc}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center pointer-events-none"
          loading="eager"
        />
        {/* Cinema Cinematic Dark Overlay */}
        <div id="hero-dark-shadow-overlay" className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content description container */}
      <div
        id="hero-synopsis-container"
        className={`absolute bottom-0 left-0 w-full z-20 px-6 md:px-16 pb-16 md:pb-24 max-w-4xl transition-all duration-700 transform ${
          fade ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div
            id="hero-rating-badge"
            className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-sm border border-yellow-500/20 text-[#ffdb3c]"
          >
            <Star className="w-3.5 h-3.5 fill-[#ffdb3c] stroke-[#ffdb3c]" />
            <span className="font-sans text-xs font-bold leading-none">
              {currentMovie.vote_average.toFixed(1)}
            </span>
          </div>
          <span id="hero-release-year" className="text-neutral-300 font-sans text-xs font-semibold">
            {new Date(currentMovie.release_date).getFullYear() || "2026"}
          </span>
          <span className="w-1 h-1 bg-neutral-500 rounded-full" />
          <span id="hero-genres" className="text-neutral-300 font-sans text-xs font-semibold whitespace-nowrap">
            {movieGenres}
          </span>
        </div>

        <h1
          id="hero-movie-title"
          className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-white leading-none mb-4"
        >
          {currentMovie.title}
        </h1>

        <p
          id="hero-desc"
          className="font-sans text-sm sm:text-base md:text-lg text-neutral-300 line-clamp-3 mb-8 max-w-2xl leading-relaxed font-light"
        >
          {currentMovie.overview ||
            "El anhelo desesperado de una vida desencadena acontecimientos inesperados. Explora hoy mismo esta impactante producción cinematográfica en alta definición exclusivamente en nuestra plataforma."}
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            id="hero-play-trailer-btn"
            onClick={() => onMovieClick(currentMovie.id)}
            className="bg-[#E50914] text-white px-6 md:px-8 py-3 rounded-sm font-sans text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B81D24] active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-900/30 font-medium"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            Reproducir trailer
          </button>
          <button
            id="hero-toggle-mylist-btn"
            onClick={() => onToggleFavorite(currentMovie)}
            className="border border-white/30 bg-white/5 backdrop-blur-md text-white px-6 md:px-8 py-3 rounded-sm font-sans text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white hover:text-black hover:border-white active:scale-95 transition-all cursor-pointer"
          >
            {isInList ? (
              <>
                <Check className="w-4.5 h-4.5" />
                Mi Lista
              </>
            ) : (
              <>
                <Plus className="w-4.5 h-4.5" />
                Mi Lista
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide Navigation indicators */}
      <div
        id="hero-carousel-pips"
        className="absolute right-6 md:right-16 bottom-16 md:bottom-24 z-20 hidden sm:flex items-center gap-2.5"
      >
        {movies.map((_, idx) => (
          <button
            id={`hero-pip-${idx}`}
            key={idx}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentIndex(idx);
                setFade(true);
              }, 400);
            }}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
              idx === currentIndex ? "bg-[#E50914] w-6" : "bg-neutral-600 hover:bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
