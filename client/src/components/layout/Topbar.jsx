

import { useState, useEffect, useRef } from "react";
import { ChevronDown, UserCircle2 } from "lucide-react";

export default function Topbar({ name }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; 
  };

  return (
    <div className="bg-white shadow px-4 sm:px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
        Welcome,{" "}
        <span
          className=" capitalize bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold 
        drop-shadow-sm"
        >
          {name}
        </span>{" "}
        👋
      </h1>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-1 hover:bg-gray-100 px-3 py-1 rounded transition cursor-pointer"
        >
          <UserCircle2 className="w-6 h-6 text-gray-600" />
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-36 z-20 animate-fadeIn">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
