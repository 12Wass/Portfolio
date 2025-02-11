import React from "react";
import { Home, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-6">My Dashboard</h2>

      <nav className="flex flex-col gap-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
        >
          <Home className="w-4 h-4" />
          <span>Overview</span>
        </Link>

        <Link
          to="/expense-tracker"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
        >
          <User className="w-4 h-4" />
          <span>Expenses</span>
        </Link>

        <Link
          to="/dashboard/settings"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
