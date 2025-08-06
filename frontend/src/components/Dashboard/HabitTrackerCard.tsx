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
    if (newHabit.trim() !== "") {
      setHabits([
        ...habits,
        { id: Date.now(), text: newHabit, completed: false },
      ]);
      setNewHabit("");
    }
  };

  // Function to toggle a habit's completed status
  const handleToggleHabit = (id: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const handleRemoveHabit = (id: number) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  // Compute how many habits are completed vs. total
  const completedCount = habits.filter((habit) => habit.completed).length;

  return (
    <Card className="bg-dark-cardBg text-dark-cardText">
      <CardHeader>
        <CardTitle>Habit Tracker</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          Completed {completedCount}/{habits.length} habits
        </div>

        {/* Input + Button to add a new task */}
        <div className="flex items-center gap-2 mb-4">
          <input
            className="bg-dark-inputBg text-dark-inputText border p-2 flex-1 rounded text-sm"
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
            className="bg-dark-buttonBg text-dark-buttonText flex items-center gap-1 px-3 py-2 text-sm rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          <AnimatePresence>
            {habits.map((habit) => (
              <motion.li
                key={habit.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
                className="flex items-center justify-between p-2 bg-dark-cardBg border rounded"
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleHabit(habit.id)}>
                    {habit.completed ? (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <span className={habit.completed ? "line-through" : ""}>
                    {habit.text}
                  </span>
                </div>
                <button onClick={() => handleRemoveHabit(habit.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  );
}
