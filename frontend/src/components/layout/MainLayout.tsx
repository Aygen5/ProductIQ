import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-background min-h-screen">
      <Sidebar />
      <div className="pl-72 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-20 px-xl pb-xl bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
