import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card";

export function OverviewCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">42 tasks completed</p>
        <p className="text-sm text-gray-500 mt-1">Keep up the good work!</p>
      </CardContent>
    </Card>
  );
}
