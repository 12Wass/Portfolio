// src/dashboard/DashboardHeader.tsx
import { Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="bg-dark-cardBg text-dark-cardText p-4 border-b shadow-sm flex items-center justify-between">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-4">
        {/* Notification Icon (example) */}
        <button className="relative">
          <Bell className="w-5 h-5" />
          {/* Example of a "notification dot" */}
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        {/* Placeholder for a user avatar or name */}
        <div className="flex items-center gap-2">
          <img
            src="https://via.placeholder.com/32"
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
}
