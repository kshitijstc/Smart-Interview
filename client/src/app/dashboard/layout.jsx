"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      // console.log(decoded);
      setUser(decoded);
    }
  }, []);

  if (!user) return null; // or loader
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user?.role} />
      <div className="flex flex-col flex-1">
        <Topbar name={user.name} />
        <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
