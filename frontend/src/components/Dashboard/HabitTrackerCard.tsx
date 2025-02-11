// src/dashboard/HabitsTrackerCard.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Habit {
  id: number;
  text: string;
  completed: boolean;
}

export function HabitTracker() {
  // Local state to hold a list of Habits
  const [habits, setHabits] = useState<Habit[]>(() => {
    const storedHabits = localStorage.getItem("myHabits");
    return storedHabits ? JSON.parse(storedHabits) : [];
  });

  // Local state to hold the text of a new habit
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    localStorage.setItem("myHabits", JSON.stringify(habits));
  }, [habits]);

  // Function to add a new habit to the list
  const handleAddHabit = () => {
    if (newHabit.trim() === "") return;
    const newId = habits.length ? habits[habits.length - 1].id + 1 : 1;
    setHabits([...habits, { id: newId, text: newHabit, completed: false }]);
    setNewHabit("");
  };

  // Function to toggle a habit's completed status
  const handleToggleHabit = (id: number) => {
    setHabits(
      habits.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleRemoveHabit = (id: number) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  // Compute how many habits are completed vs. total
  const completedCount = habits.filter((habit) => habit.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-3 text-sm text-gray-500">
          Completed {completedCount}/{habits.length} Habit
        </div>

        {/* Input + Button to add a new task */}
        <div className="flex items-center gap-2 mb-4">
          <input
            className="border p-2 flex-1 rounded text-sm"
            type="text"
            placeholder="Add a new habit..."
            value={newHabit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddHabit();
            }}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <button
            onClick={handleAddHabit}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center gap-2">
              <button
                className="focus:outline-none"
                onClick={() => handleToggleHabit(habit.id)}
              >
                {habit.completed ? (
                  <CheckSquare className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <span
                className={`text-sm ${
                  habit.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {habit.text}
              </span>

              <button
                onClick={() => handleRemoveHabit(habit.id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
