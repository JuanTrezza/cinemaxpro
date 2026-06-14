import { useState, useEffect } from "react";
import { Bookmark, Star, Heart, Trash2 } from "lucide-react";
import { Movie, Genre, FavoriteMovie } from "./types";
import {
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchPopularMovies,
  fetchUpcomingMovies,
  fetchGenreList,
  getPosterUrl,
} from "./lib/tmdb";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GenrePills from "./components/GenrePills";
import MovieRow from "./components/MovieRow";
import StatsSection from "./components/StatsSection";
import SearchOverlay from "./components/SearchOverlay";
import MovieDetailModal from "./components/MovieDetailModal";

type AppTab = "inicio" | "peliculas" | "generos" | "favoritos";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("inicio");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});

  // Movie rows data
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  // Genre filtering lane state
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  // Favorites collection persisted in localStorage
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(() => {
    try {
      const saved = localStorage.getItem("cinemax_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recent views persisted in localStorage
  const [recents, setRecents] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("cinemax_recent");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom confirm modal state
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState<boolean>(false);

  // UI state overlays
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [appLoading, setAppLoading] = useState<boolean>(true);

  // Initialize and load general movie data
  useEffect(() => {
    async function loadAppData() {
      try {
        setAppLoading(true);
        // Load genres
        const genreList = await fetchGenreList();
        setGenres(genreList);

        // Render key-value map for quick lookup
        const map: Record<number, string> = {};
        genreList.forEach((g) => {
          map[g.id] = g.name;
        });
        setGenresMap(map);

        // Fetch primary lists in parallel
        const [trendData, topData, popData, upData] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopRatedMovies(),
          fetchPopularMovies(),
          fetchUpcomingMovies(),
        ]);

        setTrending(trendData);
        setTopRated(topData);
        setPopular(popData);
        setUpcoming(upData);
      } catch (err) {
        console.error("Critical error loading initial app context:", err);
      } finally {
        setAppLoading(false);
      }
    }

    loadAppData();
  }, []);

  // Synchronize favorites state with localStorage
  useEffect(() => {
    localStorage.setItem("cinemax_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Handle Favorites toggle additions & removals
  const handleToggleFavorite = (movie: Movie) => {
    const isAlreadySaved = favorites.some((f) => f.id === movie.id);

    if (isAlreadySaved) {
      setFavorites((prev) => prev.filter((f) => f.id !== movie.id));
    } else {
      // Structure the new target to ensure we capture raw genres for statistical computing
      const newItem: FavoriteMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        genres: movie.genre_ids,
      };
      setFavorites((prev) => [...prev, newItem]);
    }
  };

  const isFavorite = (id: number): boolean => {
    return favorites.some((f) => f.id === id);
  };

  const handleMovieViewed = (movie: Movie) => {
    setRecents((prev) => {
      const filtered = prev.filter((m) => m.id !== movie.id);
      const updated = [movie, ...filtered].slice(0, 5);
      localStorage.setItem("cinemax_recent", JSON.stringify(updated));
      return updated;
    });
  };

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenreId(genreId);
  };

  const selectedGenreName = selectedGenreId !== null ? genresMap[selectedGenreId] : null;

  const applyGenreFilter = (movies: Movie[]): Movie[] => {
    if (selectedGenreId === null) {
      return movies;
    }
    return movies.filter((movie) => movie.genre_ids.includes(selectedGenreId));
  };

  const filteredRecents = applyGenreFilter(recents);
  const filteredTrending = applyGenreFilter(trending);
  const filteredTopRated = applyGenreFilter(topRated);
  const filteredPopular = applyGenreFilter(popular);
  const filteredUpcoming = applyGenreFilter(upcoming);

  return (
    <div id="app-root-container" className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* 1. Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchClick={() => setIsSearchOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Primary loading indicator screen */}
      {appLoading ? (
        <div id="main-app-loader" className="flex-1 flex flex-col items-center justify-center py-48 gap-4">
          <div className="w-14 h-14 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-display text-2xl tracking-widest text-[#E50914] uppercase animate-pulse select-none">
            CINEMAX PRO
          </p>
          <p className="font-sans text-xs text-neutral-500 tracking-wide uppercase select-none">
            Iniciando proyector de cine...
          </p>
        </div>
      ) : (
        <div id="application-body-container" className="flex flex-col flex-1">
          {/* 2. Hero Spotlights Carousel */}
          <Hero
            movies={trending.slice(0, 5)}
            genresMap={genresMap}
            onMovieClick={(id) => setSelectedMovieId(id)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />

          {/* Squeezed Main Section */}
          <main className="relative z-20 -mt-20 md:-mt-28 space-y-12 md:space-y-16 pb-24">
            
            {/* 3. Category Style Genre Pill Badges */}
            <GenrePills
              genres={genres}
              selectedGenreId={selectedGenreId}
              onGenreSelect={handleGenreSelect}
            />

            {/* Continuar viendo (Recent views) row */}
            {filteredRecents.length > 0 && (
              <div id="continuar-viendo" className="space-y-12 md:space-y-16">
                <MovieRow
                  title={selectedGenreName ? `Películas de ${selectedGenreName}` : "Continuar viendo"}
                  icon="🍿"
                  movies={filteredRecents}
                  onMovieClick={(id) => setSelectedMovieId(id)}
                />
              </div>
            )}

            {/* 4. Categorized Movie lanes */}
            <div id="peliculas" className="space-y-12 md:space-y-16">
              <MovieRow
                title={selectedGenreName ? `Películas de ${selectedGenreName}` : "Tendencia esta semana"}
                icon="🔥"
                movies={filteredTrending}
                onMovieClick={(id) => setSelectedMovieId(id)}
              />
              <MovieRow
                title={selectedGenreName ? `Películas de ${selectedGenreName}` : "Mejor calificadas"}
                icon="⭐"
                movies={filteredTopRated}
                onMovieClick={(id) => setSelectedMovieId(id)}
              />
              <MovieRow
                title={selectedGenreName ? `Películas de ${selectedGenreName}` : "Populares ahora"}
                icon="🎬"
                movies={filteredPopular}
                onMovieClick={(id) => setSelectedMovieId(id)}
              />
              <MovieRow
                title={selectedGenreName ? `Películas de ${selectedGenreName}` : "Próximos estrenos"}
                icon="🆕"
                movies={filteredUpcoming}
                onMovieClick={(id) => setSelectedMovieId(id)}
              />
            </div>

            {/* 5. Mis Favoritos Section */}
            <section id="favoritos" className="px-6 md:px-16 scroll-mt-24 max-w-7xl mx-auto w-full">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Bookmark className="w-6 h-6 text-[#E50914] fill-[#E50914]" />
                  <h2 className="font-display text-2xl md:text-3xl text-white font-extrabold tracking-wide uppercase select-none">
                    Mi <span className="text-[#E50914]">Lista de Favoritos</span>
                  </h2>
                </div>
                {favorites.length > 0 && (
                  <button
                    id="btn-clear-favorites"
                    onClick={() => setIsConfirmClearOpen(true)}
                    className="font-sans text-xs font-bold text-neutral-500 hover:text-[#E50914] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar todos
                  </button>
                )}
              </div>

              {favorites.length === 0 ? (
                <div
                  id="favorites-empty-card"
                  className="bg-[#121212] border border-white/5 rounded-xl p-12 text-center max-w-lg mx-auto flex flex-col items-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-neutral-400 mb-5 animate-bounce">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="font-sans text-lg font-bold text-white mb-2 select-none">
                    Aún no tienes películas favoritas.
                  </h3>
                  <p className="font-sans text-xs text-neutral-400 leading-relaxed max-w-sm select-none">
                    Explora nuestra amplia cartelera de estrenos, tendencias de la semana o busca títulos y pulsa el botón "Mi Lista" para guardarlas en tu butaca virtual personalizada.
                  </p>
                </div>
              ) : (
                <div
                  id="favorites-movies-layout"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                >
                  {favorites.map((fav) => {
                    const posterSrc = getPosterUrl(fav.poster_path);
                    return (
                      <div
                        id={`favorites-item-${fav.id}`}
                        key={fav.id}
                        className="group relative cursor-pointer rounded-lg overflow-hidden border border-white/5 flex flex-col bg-neutral-950 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(229,9,20,0.15)] hover:border-red-500/30"
                      >
                        {/* Film image backdrop */}
                        <div
                          onClick={() => setSelectedMovieId(fav.id)}
                          className="relative aspect-[2/3] overflow-hidden"
                        >
                          <img
                            loading="lazy"
                            src={posterSrc}
                            alt={fav.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                          />
                          {/* Inner soft dark fading */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          
                          {/* Top Quick Delete Trigger Badge */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent modal trigger
                              setFavorites((prev) => prev.filter((item) => item.id !== fav.id));
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/75 hover:bg-[#E50914] text-white flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md shadow-black/80 border border-white/5"
                            title="Eliminar de mi lista"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Quick details indicator bottom */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-1 text-[#ffdb3c]">
                              <Star className="w-3.5 h-3.5 fill-[#ffdb3c] stroke-[#ffdb3c]" />
                              <span className="font-sans text-xs font-bold">{fav.vote_average.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Title segment */}
                        <div
                          onClick={() => setSelectedMovieId(fav.id)}
                          className="p-3 flex-1 flex flex-col justify-center"
                        >
                          <h4 className="font-sans text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-[#E50914] transition-colors">
                            {fav.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 6. Dynamic bento analytics dashboards */}
            <StatsSection favorites={favorites} genres={genres} />

          </main>
        </div>
      )}

      {/* 7. Footer design layout */}
      <footer className="bg-[#050505] border-t border-white/5 py-16 px-6 md:px-16 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Logo element */}
          <div className="text-center md:text-left select-none">
            <span className="font-display text-3xl font-extrabold text-[#E50914] tracking-tighter uppercase block">
              CINEMAX PRO
            </span>
            <p className="font-sans text-xs text-neutral-500 mt-2 font-light">
              © {new Date().getFullYear()} CINEMAX PRO. Reservados todos los derechos.
            </p>
          </div>

          {/* Quick Sitemap anchors */}
          <div className="flex items-center gap-8 flex-wrap justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-sans text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
            >
              Inicio
            </button>
            <a
              href="#peliculas"
              className="font-sans text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Películas
            </a>
            <a
              href="#generos"
              className="font-sans text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Géneros
            </a>
            <a
              href="#favoritos"
              className="font-sans text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Mis Favoritos
            </a>
          </div>

          {/* TMDB branding watermark */}
          <div className="flex items-center gap-3.5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all select-none">
            <span className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
              Powered by
            </span>
            <img
              alt="TMDB Logo"
              className="h-4.5 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFQuwQ9hj0LX6xvmnUv9PK206AET_IE5zAy3J15HYWGNxGDxmgi7W4ZOrtCvpSHvmnFGdWqluJlZKJElLLL6fJJsC4mP1usxwkFWc-eLnqFi8yC_4QKpYWH_vfcXKPA-Cvjmav_kzKbac_6dSSV_5l8Ht-yuw2YVxOPY3n-2Dgk-bww_tiC_IIZRss1GNKj7T--vQhVb44VLIpoT2l0mx3CJY1xGok-TPlblojh3zlMOIUO0gXVZalv2SRoUOoNbIOHRGxtuXKbTU"
            />
          </div>
        </div>
      </footer>

      {/* 8. Full screen Predictive Search Overlay */}
      {isSearchOpen && (
        <SearchOverlay
          onClose={() => setIsSearchOpen(false)}
          onMovieClick={(id) => setSelectedMovieId(id)}
        />
      )}

      {/* 9. Detailed Theatrical Movie Modal */}
      {selectedMovieId !== null && (
        <MovieDetailModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
          onSimilarMovieClick={(id) => setSelectedMovieId(id)} // supports exploratory routing
          onMovieViewed={handleMovieViewed}
        />
      )}

      {/* 10. Confirmation Modal for Clearing Favorites */}
      {isConfirmClearOpen && (
        <div
          id="confirm-clear-modal"
          onClick={() => setIsConfirmClearOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121212] border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 bg-[#E50914]/10 rounded-full flex items-center justify-center mx-auto mb-5 text-[#E50914]">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl tracking-wide text-white uppercase mb-3">
              ¿VACIAR FAVORITOS?
            </h3>
            <p className="font-sans text-sm text-neutral-400 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar todas las películas guardadas en tu lista de favoritos? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button
                id="confirm-clear-cancel"
                onClick={() => setIsConfirmClearOpen(false)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded font-sans text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-clear-action"
                onClick={() => {
                  setFavorites([]);
                  setIsConfirmClearOpen(false);
                }}
                className="flex-1 bg-[#E50914] hover:bg-[#B81D24] text-white py-3 px-4 rounded font-sans text-xs font-bold uppercase transition-transform active:scale-95 cursor-pointer shadow-lg shadow-red-900/30"
              >
                Eliminar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
