import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface OverviewCardProps {
  tasks: Task[];
}

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

export function OverviewCard({ tasks }: OverviewCardProps) {
  const completedCount = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const incompleteCount = totalTasks - completedCount;

  const data = [
    { name: "Completed", value: completedCount },
    { name: "Incomplete", value: incompleteCount },
  ];

  return (
    <Card className="bg-dark-cardBg text-dark-cardText">
      <CardHeader>
        <CardTitle>Daily Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1">
            <p className="text-2xl font-bold">
              {completedCount} tasks completed
            </p>
            <p className="text-sm text-gray-500 mt-1">Keep up the good work!</p>
          </div>
          <div className="w-full md:w-64 h-64 md:h-64 p-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <Legend
                payload={data.map((entry, index) => ({
                  value: entry.name,
                  type: "square",
                  color: COLORS[index % COLORS.length],
                }))}
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
