import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { OverviewCard } from "./OverviewCard";
import { TasksCard } from "./TaskCard";
import { HabitTracker } from "./HabitTrackerCard";

export function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="p-4 space-y-4">
          <OverviewCard />
          <div className="flex gap-4">
            <div className="w-1/2">
              <TasksCard />
            </div>
            <div className="w-1/2">
              <HabitTracker />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
