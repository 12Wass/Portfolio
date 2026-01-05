import { useState } from "react";
import { Link } from "react-router-dom";
import type { SetRecord } from "../lib/supabase";
import { lbToKg, relativeTime, formatTimestamp } from "../lib/units";
import { calculateVolume } from "../lib/stats";
import { Modal } from "./Modal";

interface ExerciseGroupProps {
  exerciseKey: string;
  displayName: string;
  sets: SetRecord[];
  onDeleteSet?: (setId: string) => void;
  onToggleWarmup?: (setId: string, isWarmup: boolean) => void;
  readOnly?: boolean;
}

export function ExerciseGroup({
  exerciseKey,
  displayName,
  sets,
  onDeleteSet,
  onToggleWarmup,
  readOnly = false,
}: ExerciseGroupProps) {
  const [selectedSet, setSelectedSet] = useState<SetRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const workingSets = sets.filter((s) => !s.is_warmup);
  const volume = calculateVolume(sets);
  const bestSet = workingSets.reduce((best, set) => {
    const weight = set.weight_lb;
    if (!best || weight > best.weight_lb) return set;
    return best;
  }, null as SetRecord | null);

  const handleSetClick = (set: SetRecord) => {
    if (readOnly) return;
    setSelectedSet(set);
  };

  const handleDelete = () => {
    if (selectedSet && onDeleteSet) {
      onDeleteSet(selectedSet.id);
      setSelectedSet(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleWarmup = () => {
    if (selectedSet && onToggleWarmup) {
      onToggleWarmup(selectedSet.id, !selectedSet.is_warmup);
      setSelectedSet(null);
    }
  };

  return (
    <div id={exerciseKey} className="bg-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-750 border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{displayName}</h3>
          {!readOnly && (
            <Link
              to={`/?exercise=${encodeURIComponent(displayName)}`}
              className="text-xs text-green-400 font-medium"
            >
              + Add Set
            </Link>
          )}
        </div>
        <div className="flex gap-4 text-xs text-zinc-500 mt-1">
          <span>{sets.length} sets</span>
          <span>{volume.toLocaleString()} lb volume</span>
          {bestSet && <span>Top: {bestSet.weight_lb} lb</span>}
        </div>
      </div>

      {/* Sets list */}
      <div className="divide-y divide-zinc-700/50">
        {sets.map((set) => (
          <div
            key={set.id}
            onClick={() => handleSetClick(set)}
            className={`px-4 py-3 flex items-center justify-between ${
              !readOnly ? "cursor-pointer active:bg-zinc-700/50" : ""
            } ${set.is_warmup ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-16">
                {set.user_name}
              </span>
              <div>
                <span className="text-white font-medium">
                  {set.weight_lb} lb
                </span>
                <span className="text-zinc-400"> × </span>
                <span className="text-white font-medium">{set.reps}</span>
                <span className="text-zinc-500 text-sm ml-2">
                  ({lbToKg(set.weight_lb)} kg)
                </span>
                {set.is_warmup && (
                  <span className="ml-2 text-xs text-amber-500 bg-amber-500/20 px-1.5 py-0.5 rounded">
                    warmup
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-zinc-600">
              {relativeTime(set.created_at)}
            </span>
          </div>
        ))}
      </div>

      {/* Set detail modal */}
      <Modal
        open={selectedSet !== null && !showDeleteConfirm}
        onClose={() => setSelectedSet(null)}
        title="Set Details"
      >
        {selectedSet && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {selectedSet.weight_lb} lb × {selectedSet.reps}
              </div>
              <div className="text-zinc-500 text-sm mt-1">
                {selectedSet.user_name} •{" "}
                {formatTimestamp(selectedSet.created_at)}
              </div>
              {selectedSet.is_warmup && (
                <div className="text-amber-500 text-sm mt-1">Warmup set</div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleToggleWarmup}
                className="w-full h-12 bg-zinc-700 text-white rounded-xl font-medium active:bg-zinc-600 transition-colors"
              >
                {selectedSet.is_warmup
                  ? "Mark as Working Set"
                  : "Mark as Warmup"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full h-12 bg-red-500/20 text-red-400 rounded-xl font-medium active:bg-red-500/30 transition-colors"
              >
                Delete Set
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Set?"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 text-center">
            This will permanently delete this set. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 h-12 bg-zinc-700 text-white rounded-xl font-medium active:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 h-12 bg-red-500 text-white rounded-xl font-medium active:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
