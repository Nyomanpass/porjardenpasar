import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavbarDashboard from "../components/NavbarDashboard";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
        <div className="min-h-screen md:flex">
      <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        <NavbarDashboard
          toggleSidebar={() => setIsOpen(!isOpen)}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isCollapsed={isCollapsed}
        />

       <main
  className="
    pt-24 md:pt-28
    p-4 md:p-6
    overflow-visible relative
  "
>
  <div
    className="
      max-w-7xl mx-auto w-full
      md:max-w-none md:mx-0
    "
  >
    <div
      className="
        bg-white shadow-lg border border-gray-100 rounded-xl p-4
        md:bg-transparent md:shadow-none md:border-0 md:rounded-none md:p-0
      "
    >
      <Outlet />
    </div>
  </div>
</main>

      </div>
    </div>
  );
}