export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: {
    results: VideoResult[];
  };
  similar: {
    results: Movie[];
  };
}

export interface FavoriteMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  genres?: number[];
}
