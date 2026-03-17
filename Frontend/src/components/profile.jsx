import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Call hook at the top level
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useLogout();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("user");

      // 1. If no token, redirect to home/login immediately
      if (!token) {
        navigate("/"); 
        return;
      }

      try {
        const cleanToken = token.replace(/"/g, "");
        const response = await fetch(`/api/admin/getprofile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        // 2. If token is invalid/expired, use your logout logic
        if (response.status === 401 || response.status === 403) {
          logout(); 
          navigate("/login");
          return;
        }

        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, logout]); // Add dependencies here

  // ... (Rest of the UI remains the same as previous)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback to basic user info if API fails or is loading
  const displayData = profileData || user;

  return (
    <div className="max-w-md mx-auto my-10 overflow-hidden bg-white/70 backdrop-blur-xl border border-blue-100/50 rounded-3xl shadow-2xl shadow-blue-200/40 font-sans">
      {/* Profile Header */}
      <div className="h-24 bg-linear-to-r from-blue-600 to-indigo-600" />

      <div className="px-8 pb-8">
        {/* Profile Picture */}
        <div className="relative flex justify-center">
          <img
            className="w-28 h-28 -mt-14 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
            src={
              displayData?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="User Profile"
          />
          <div className="absolute bottom-0 right-1/3 transform translate-x-8 bg-emerald-500 border-2 border-white w-5 h-5 rounded-full"></div>
        </div>

        {/* User Details */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-blue-900">
            {displayData?.fullName || "Loading..."}
          </h2>
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mt-1">
            {displayData?.role}
          </p>
        </div>

        {/* Information Grid */}
        <div className="mt-8 space-y-4">
          {/* Name Field */}
          <div className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/30">
            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Name
              </p>
              <p className="text-sm font-medium text-slate-700">
                {displayData?.fullName}
              </p>
            </div>
          </div>

          {/* Email Field */}
          <div className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/30">
            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Email Address
              </p>
              <p className="text-sm font-medium text-slate-700">
                {displayData?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
            Edit Details
          </button>

          <button
            onClick={logout}
            className="w-full bg-transparent hover:bg-red-50 text-red-500 font-bold py-3 rounded-xl border border-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
