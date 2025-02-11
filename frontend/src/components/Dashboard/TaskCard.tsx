// src/dashboard/TasksCard.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export function TasksCard() {
  // Local state to hold a list of tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("myTasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  // Local state to hold the text of a new task
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
  }, [tasks]);

  // Function to add a new task to the list
  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    const newId = tasks.length ? tasks[tasks.length - 1].id + 1 : 1;
    setTasks([...tasks, { id: newId, text: newTask, completed: false }]);
    setNewTask("");
  };

  // Function to toggle a task's completed status
  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleRemoveTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Compute how many tasks are completed vs. total
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-3 text-sm text-gray-500">
          Completed {completedCount}/{tasks.length} tasks
        </div>

        {/* Input + Button to add a new task */}
        <div className="flex items-center gap-2 mb-4">
          <input
            className="border p-2 flex-1 rounded text-sm"
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            onClick={handleAddTask}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                // Initial & exit states for smooth "mount" and "unmount" animations
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout // Optional: helps with reflow if tasks reorder
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
              >
                <button
                  className="focus:outline-none"
                  onClick={() => handleToggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span
                  className={`text-sm ${
                    task.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {task.text}
                </span>

                <button
                  onClick={() => handleRemoveTask(task.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  );
}
