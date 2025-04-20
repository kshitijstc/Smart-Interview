

import { useState } from "react";
import { FileUser, Home, BarChart, Users, LogOut,ChevronRight,ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ role }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  // const links =
  //   role === "INTERVIEWER"
  //     ? [{ name: "Dashboard", path: "/dashboard/interviewer" }]
  //     : [{ name: "Dashboard", path: "/dashboard/candidate" }];

  return (
    <>
      {/* Mobile Drawer Toggle */}
      <button
        className="md:hidden p-4"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
      <ChevronRight />
      </button>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 
          transition-transform transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:block`}
      >
        <div 
        
          className="p-6 text-xl font-bold  bg-gradient-to-br from-blue-600 to-purple-500 bg-clip-text text-transparent font-bold 
        drop-shadow-sm"
        >
          <Link href="/">
          Smart Interview
          </Link>
        </div>
        {isOpen && (
        <button
          className="md:hidden fixed top-4 left-50 z-50 bg-gray-300  rounded-full shadow p-2 hover:bg-gray-700 transition-colors"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <ChevronLeft />
        </button>
      )}
        <nav className="flex flex-col gap-4 p-4 text-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:text-blue-600"
          >
            <Home size={20} /> Home
          </Link>
          {/* Show these only for INTERVIEWER */}
          {role === "INTERVIEWER" && (
            <>
              <Link
                href="/dashboard/interviewer/evaluate"
                className="flex items-center gap-3 hover:text-blue-600"
              >
                <FileUser size={20} /> Evaluate
              </Link>
              {/* <Link
                href="/dashboard/interviewer/users"
                className="flex items-center gap-3 hover:text-blue-600"
              >
                <Users size={20} /> Users
              </Link> */}
            </>
          )}
          {role === "CANDIDATE" && (
            <>
              <Link
                href="/dashboard/candidate/practice"
                className="flex items-center gap-3 hover:text-blue-600"
              >
                <BarChart size={20} /> Practice
              </Link>
              
            </>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex items-center gap-3 text-red-500 mt-8 hover:text-red-700 cursor-pointer" 
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </div>
    </>
  );
}
