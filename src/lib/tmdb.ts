import { Movie, Genre, MovieDetails } from "../types";

const API_KEY = "be8dacce48f16a0a2fea70f2dd32a650";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPosterUrl = (path: string | null): string => {
  if (!path) return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=500";
  return `https://image.tmdb.org/t/p/w500${path}`;
};

export const getBackdropUrl = (path: string | null): string => {
  if (!path) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200";
  return `https://image.tmdb.org/t/p/original${path}`;
};

export async function fetchFromTMDB<T>(endpoint: string, params: string = ""): Promise<T> {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=es-AR${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>("/trending/movie/week");
  return data.results || [];
}

export async function fetchTopRatedMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>("/movie/top_rated");
  return data.results || [];
}

export async function fetchPopularMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>("/movie/popular");
  return data.results || [];
}

export async function fetchUpcomingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>("/movie/upcoming");
  return data.results || [];
}

export async function fetchGenreList(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres || [];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query || query.trim() === "") return [];
  const data = await fetchFromTMDB<{ results: Movie[] }>("/search/movie", `&query=${encodeURIComponent(query)}`);
  return data.results || [];
}

export async function fetchMovieDetails(id: number): Promise<MovieDetails> {
  const data = await fetchFromTMDB<MovieDetails>(`/movie/${id}`, "&append_to_response=credits,videos,similar");
  return data;
}

export async function fetchMoviesByGenre(genreId: number): Promise<Movie[]> {
  const data = await fetchFromTMDB<{ results: Movie[] }>("/discover/movie", `&with_genres=${genreId}`);
  return data.results || [];
}
