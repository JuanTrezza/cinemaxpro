import { useState, useEffect } from "react";
import { X, Play, Plus, Check, Star } from "lucide-react";
import { MovieDetails, Movie, FavoriteMovie } from "../types";
import { fetchMovieDetails, getBackdropUrl, getPosterUrl } from "../lib/tmdb";

interface MovieDetailModalProps {
  movieId: number;
  onClose: () => void;
  onToggleFavorite: (movie: Movie) => void;
  isFavorite: (id: number) => boolean;
  onSimilarMovieClick: (id: number) => void;
  onMovieViewed?: (movie: Movie) => void;
}

export default function MovieDetailModal({
  movieId,
  onClose,
  onToggleFavorite,
  isFavorite,
  onSimilarMovieClick,
  onMovieViewed,
}: MovieDetailModalProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError(null);
      setIsPlayingTrailer(false);
      try {
        const data = await fetchMovieDetails(movieId);
        if (active) {
          setMovie(data);
        }
      } catch (err) {
        if (active) {
          console.error("Error loading movie details:", err);
          setError("Failed to fetch movie details. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [movieId]);

  // Autoplay trailer and trigger view tracking callback when movie loads
  useEffect(() => {
    if (movie) {
      // Find trailer/video
      const trailer =
        movie.videos?.results?.find(
          (v) => v.type === "Trailer" && (v.site === "YouTube" || v.site === "Youtube")
        ) || movie.videos?.results?.find((v) => v.site === "YouTube" || v.site === "Youtube");

      if (trailer) {
        setIsPlayingTrailer(true);
      }

      // Track viewed movie callback
      if (onMovieViewed) {
        const moviePayload: Movie = {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          genre_ids: movie.genres.map((g) => g.id),
          vote_average: movie.vote_average,
        };
        onMovieViewed(moviePayload);
      }
    }
  }, [movie, onMovieViewed]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 p-12 rounded-2xl flex flex-col items-center max-w-sm w-full shadow-2xl">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans text-xs font-bold text-neutral-400 mt-5 uppercase tracking-widest animate-pulse">
            Preparando butaca...
          </p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
          <p className="text-[#E50914] font-display text-xl uppercase mb-3">Error de conexión</p>
          <p className="font-sans text-xs text-neutral-400 mb-6">No pudimos obtener la ficha técnica del servidor de TMDB.</p>
          <button
            onClick={onClose}
            className="bg-[#E50914] text-white py-2.5 px-6 rounded text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer leading-none"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    );
  }

  const director = movie.credits.crew.find((c) => c.job === "Director")?.name || "Desconocido";
  
  // Find official trailers or standard videos in English/Spanish
  const trailerVideo =
    movie.videos?.results?.find(
      (v) => v.type === "Trailer" && (v.site === "YouTube" || v.site === "Youtube")
    ) || movie.videos?.results?.find((v) => v.site === "YouTube" || v.site === "Youtube");

  const movieGenres = movie.genres.map((g) => g.name).join(", ");
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "2026";
  const isInList = isFavorite(movie.id);

  const backdropSrc = getBackdropUrl(movie.backdrop_path);
  const posterSrc = getPosterUrl(movie.poster_path);

  // Parse list item payload
  const moviePayload: Movie = {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    genre_ids: movie.genres.map((g) => g.id),
    vote_average: movie.vote_average,
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()} // stop close on clicking content modal
        className="bg-[#0e0e0e] max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative my-auto"
      >
        {/* Detail Close Trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-[#E50914] hover:border-transparent transition-all cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Spotlight Banner / Video Embed player */}
        <div className="relative w-full aspect-video md:aspect-[21/9] bg-black">
          {!isPlayingTrailer || !trailerVideo ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent z-10" />
              <img
                src={backdropSrc}
                alt={movie.title}
                className="w-full h-full object-cover pointer-events-none"
              />
              {trailerVideo && (
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-red-900/30 cursor-pointer z-20 group"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5 group-hover:scale-105" />
                </button>
              )}
            </>
          ) : (
            <iframe
              title={`${movie.title} Trailer`}
              src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
              className="w-full h-full border-0 absolute inset-0 z-20"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Detailed Information & Grid content view */}
        <div className="p-6 md:p-10 -mt-16 sm:-mt-24 md:-mt-28 relative z-20">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster Art Card (Hidden on very small mobile) */}
            <div className="w-40 md:w-44 shrink-0 hidden sm:block relative group">
              <div className="aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                <img
                  src={posterSrc}
                  alt={movie.title}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>

            {/* Metas and synopses */}
            <div className="flex-1 mt-10 md:mt-16">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-none uppercase">
                  {movie.title}
                </h2>
                <span className="bg-[#E50914] px-2 py-0.5 rounded-sm text-white font-sans text-[10px] font-bold uppercase tracking-widest whitespace-nowrap leading-none align-middle">
                  HD Premium
                </span>
              </div>

              {/* Movie Metadatas line */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold font-sans text-neutral-400 mb-6">
                <div className="flex items-center gap-1 text-[#ffdb3c]">
                  <Star className="w-3.5 h-3.5 fill-[#ffdb3c] stroke-[#ffdb3c]" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                <span>{year}</span>
                <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                <span>{movie.runtime} minutos</span>
                <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                <span className="text-neutral-300">{movieGenres}</span>
              </div>

              <p className="font-sans text-sm md:text-base text-neutral-300 mb-8 leading-relaxed font-light">
                {movie.overview || "Ficha técnica exclusiva de Cinemax Pro. Explora los detalles interactivos, reparto, trailer oficial y títulos relacionados de este increíble misterio cinematográfico."}
              </p>

              {/* Cast & Director grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 border-y border-white/5 py-6">
                <div>
                  <h4 className="font-sans text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2.5">
                    Director cinematográfico
                  </h4>
                  <p className="font-sans text-sm font-semibold text-white">{director}</p>
                </div>

                <div>
                  <h4 className="font-sans text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2.5">
                    Elenco principal
                  </h4>
                  {movie.credits.cast.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {movie.credits.cast.slice(0, 5).map((actor) => {
                        const actorImg = actor.profile_path
                          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

                        return (
                          <div
                            key={actor.id}
                            className="w-8 h-8 rounded-full border border-white/10 overflow-hidden relative group/actor cursor-pointer shrink-0"
                            title={`${actor.name} como ${actor.character}`}
                          >
                            <img
                              src={actorImg}
                              alt={actor.name}
                              className="w-full h-full object-cover grayscale group-hover/actor:grayscale-0 transition-all pointer-events-none"
                            />
                            {/* Actor microtooltip panel */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/actor:opacity-100 flex items-center justify-center text-[7px] text-white font-bold leading-none select-none text-center p-0.5">
                              {actor.name.split(" ")[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-sans text-xs text-neutral-400">Reparto no especificado</p>
                  )}
                </div>
              </div>

              {/* Actions panels */}
              <div className="flex flex-wrap gap-4">
                {trailerVideo && !isPlayingTrailer && (
                  <button
                    onClick={() => setIsPlayingTrailer(true)}
                    className="bg-[#E50914] hover:bg-[#B81D24] text-white py-3 px-8 rounded-sm font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-950/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Reproducir trailer
                  </button>
                )}
                <button
                  onClick={() => onToggleFavorite(moviePayload)}
                  className="bg-white/5 border border-white/15 text-white py-3 px-8 rounded-sm font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white hover:text-black hover:border-white transition-all active:scale-95 cursor-pointer"
                >
                  {isInList ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Mi Lista
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Similar movies recommendations */}
          {movie.similar?.results?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/5 select-none">
              <h4 className="font-display text-xl sm:text-2xl text-white tracking-wide uppercase mb-6 font-semibold">
                Películas <span className="text-[#E50914]">Similares recomendadas</span>
              </h4>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                {movie.similar.results.slice(0, 8).map((sm) => {
                  const smImg = getPosterUrl(sm.poster_path);
                  return (
                    <div
                      id={`similar-movie-card-${sm.id}`}
                      key={sm.id}
                      onClick={() => onSimilarMovieClick(sm.id)}
                      className="min-w-[110px] sm:min-w-[130px] aspect-[2/3] rounded-md overflow-hidden border border-white/5 bg-neutral-900 cursor-pointer hover:border-[#E50914]/50 hover:shadow-lg hover:shadow-red-950/10 transition-all transform hover:-translate-y-1 shrink-0 group"
                    >
                      <img
                        loading="lazy"
                        src={smImg}
                        alt={sm.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
