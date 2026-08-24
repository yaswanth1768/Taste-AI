import React from 'react';
import { MovieCard } from './MovieCard';
import { GridSkeleton } from '../common/Skeleton';
import { Film } from 'lucide-react';

export const MovieGrid = ({ movies, loading, emptyMessage = "No movies found matching your query." }) => {
  if (loading) {
    return <GridSkeleton count={12} />;
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center my-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Movies Available</h3>
        <p className="text-sm text-slate-400 max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
