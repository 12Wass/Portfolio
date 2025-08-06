// src/dashboard/TasksCard.tsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import { CheckSquare, Square, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface TasksCardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TasksCard({ tasks, setTasks }: TasksCardProps) {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

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

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <Card className="bg-dark-cardBg text-dark-cardText">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          Completed {completedCount}/{tasks.length} tasks
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            className="bg-dark-inputBg text-dark-inputText border p-2 flex-1 rounded text-sm"
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
            className="bg-dark-buttonBg text-dark-buttonText flex items-center gap-1 px-3 py-2 text-sm rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <ul className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
                className="flex items-center justify-between p-2 bg-dark-cardBg border rounded"
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleTask(task.id)}>
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <span className={task.completed ? "line-through" : ""}>
                    {task.text}
                  </span>
                </div>
                <button onClick={() => handleRemoveTask(task.id)}>
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
