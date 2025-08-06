import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewCard } from "./OverviewCard";
import { TasksCard } from "./TaskCard";
import { HabitTracker } from "./HabitTrackerCard";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("myTasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <OverviewCard tasks={tasks} />
            </div>
            <div className="w-full md:w-1/2">
              <TasksCard tasks={tasks} setTasks={setTasks} />
            </div>
          </div>
          <div className="w-full mt-4">
            <HabitTracker />
          </div>
        </main>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="fixed bottom-4 right-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
    </div>
  );
}
