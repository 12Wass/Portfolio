import { getFavoriteExercises, toggleFavoriteExercise } from "../lib/storage";

interface ExerciseChipsProps {
  recentExercises: { key: string; name: string }[];
  favoriteExercises: { key: string; name: string }[];
  onSelect: (name: string, key: string) => void;
  loading?: boolean;
}

export function ExerciseChips({
  recentExercises,
  favoriteExercises,
  onSelect,
  loading,
}: ExerciseChipsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-zinc-800 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  // Combine favorites and recents, avoiding duplicates
  const favoriteKeys = new Set(favoriteExercises.map((f) => f.key));
  const filteredRecents = recentExercises.filter(
    (r) => !favoriteKeys.has(r.key)
  );

  const hasFavorites = favoriteExercises.length > 0;
  const hasRecents = filteredRecents.length > 0;

  if (!hasFavorites && !hasRecents) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Favorites */}
      {hasFavorites && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {favoriteExercises.map((exercise) => (
            <ExerciseChip
              key={exercise.key}
              name={exercise.name}
              exerciseKey={exercise.key}
              isFavorite
              onSelect={() => onSelect(exercise.name, exercise.key)}
            />
          ))}
        </div>
      )}

      {/* Recents */}
      {hasRecents && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {filteredRecents.map((exercise) => (
            <ExerciseChip
              key={exercise.key}
              name={exercise.name}
              exerciseKey={exercise.key}
              isFavorite={false}
              onSelect={() => onSelect(exercise.name, exercise.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExerciseChipProps {
  name: string;
  exerciseKey: string;
  isFavorite: boolean;
  onSelect: () => void;
}

function ExerciseChip({
  name,
  exerciseKey,
  isFavorite,
  onSelect,
}: ExerciseChipProps) {
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteExercise(exerciseKey);
    // Force re-render by dispatching custom event
    window.dispatchEvent(new CustomEvent("favorites-changed"));
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        flex items-center gap-1 px-3 h-8 rounded-full text-sm whitespace-nowrap shrink-0 transition-colors
        ${
          isFavorite
            ? "bg-amber-500/20 text-amber-400 active:bg-amber-500/30"
            : "bg-zinc-800 text-zinc-300 active:bg-zinc-700"
        }
      `}
    >
      {isFavorite && <span className="text-xs">⭐</span>}
      <span>{name}</span>
      <button
        onClick={handleToggleFavorite}
        className="ml-1 w-5 h-5 flex items-center justify-center text-xs opacity-50 hover:opacity-100"
      >
        {isFavorite ? "−" : "☆"}
      </button>
    </button>
  );
}

// Hook to get favorite exercises with their display names
export function useFavoriteExercises(
  recentExercises: { key: string; name: string }[]
): { key: string; name: string }[] {
  const favoriteKeys = getFavoriteExercises();

  // Map keys to names using recent exercises or just the key
  return favoriteKeys
    .map((key) => {
      const recent = recentExercises.find((r) => r.key === key);
      return { key, name: recent?.name || key };
    })
    .filter((f) => f.name); // Remove any without names
}
