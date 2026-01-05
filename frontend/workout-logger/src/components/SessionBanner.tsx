import { Link } from "react-router-dom";
import { relativeTime } from "../lib/units";
import type { SessionRecord, SetRecord } from "../lib/supabase";
import { groupByExercise } from "../lib/stats";

interface SessionBannerProps {
  session: SessionRecord | null;
  sessionSets: SetRecord[];
  onStartSession: () => void;
  loading?: boolean;
}

export function SessionBanner({
  session,
  sessionSets,
  onStartSession,
  loading,
}: SessionBannerProps) {
  if (loading) {
    return (
      <div className="bg-zinc-800/50 rounded-xl p-4 animate-pulse">
        <div className="h-5 w-32 bg-zinc-700 rounded mb-2" />
        <div className="h-4 w-24 bg-zinc-700 rounded" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-zinc-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm">No active session</p>
            <p className="text-zinc-500 text-xs">
              Start one to track your workout
            </p>
          </div>
          <button
            onClick={onStartSession}
            className="px-4 h-10 bg-green-500 text-white font-medium rounded-lg active:bg-green-600 transition-colors"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  const exerciseGroups = groupByExercise(sessionSets);
  const totalSets = sessionSets.length;
  const workingSets = sessionSets.filter((s) => !s.is_warmup);
  const totalVolume = workingSets.reduce(
    (sum, s) => sum + s.weight_lb * s.reps,
    0
  );

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-green-400">
            {session.title || "Active Session"}
          </h3>
          <p className="text-zinc-500 text-xs">
            Started {relativeTime(session.started_at)}
          </p>
        </div>
        <Link
          to="/session"
          className="px-3 h-8 bg-green-500/20 text-green-400 text-sm font-medium rounded-lg flex items-center active:bg-green-500/30 transition-colors"
        >
          View →
        </Link>
      </div>

      {/* Quick stats */}
      {totalSets > 0 && (
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Sets:</span>{" "}
            <span className="text-white font-medium">{totalSets}</span>
          </div>
          <div>
            <span className="text-zinc-500">Exercises:</span>{" "}
            <span className="text-white font-medium">
              {exerciseGroups.size}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Volume:</span>{" "}
            <span className="text-white font-medium">
              {totalVolume.toLocaleString()} lb
            </span>
          </div>
        </div>
      )}

      {/* Exercise summary */}
      {exerciseGroups.size > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {Array.from(exerciseGroups.entries()).map(([key, data]) => (
            <Link
              key={key}
              to={`/session#${key}`}
              className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs whitespace-nowrap shrink-0"
            >
              <span className="text-white font-medium">{data.displayName}</span>
              <span className="text-zinc-500 ml-1">×{data.sets.length}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
