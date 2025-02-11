import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Portfolio from "./components/Portfolio/Portfolio";
import ExpenseTracker from "./expense-tracker/ExpenseTracker";
import { Dashboard } from "./components/Dashboard/Dashboard";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// index.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Portfolio /> },
      { path: "/expense-tracker/*", element: <ExpenseTracker /> },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
