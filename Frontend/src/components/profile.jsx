import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Sparkles, Ticket, LogOut, Pencil } from "lucide-react";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useLogout();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("user");

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
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  // Role-based accent content
  const renderRoleSpecificContent = () => {
    const role = displayData?.role?.toLowerCase();

    if (role === "visitor") {
      return (
        <div className="mt-6 p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Ticket size={12} /> Registered Events
            </h3>
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Your currently registered upcoming events and tickets.</p>
          <button 
            className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1" 
            onClick={() => navigate('/eventDetials')}
          >
            View My Tickets →
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 sm:px-6 font-sans relative overflow-hidden text-slate-100">
      {/* Glowing mesh background */}
      <div className="absolute top-[5%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md mx-auto relative z-10">
        {/* Profile Card */}
        <div className="glass-panel border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>

          {/* Gradient Banner Header */}
          <div className="h-28 bg-gradient-to-r from-violet-600/30 via-cyan-500/20 to-violet-600/30 relative">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"></div>
            {/* Decorative corner orbs */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-violet-500/10 rounded-full blur-xl"></div>
            <div className="absolute top-6 right-6 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative flex justify-center">
              <div className="relative -mt-16">
                <img
                  className="w-28 h-28 rounded-2xl object-cover bg-slate-950 ring-4 ring-slate-900 ring-offset-2 ring-offset-violet-500/30 shadow-xl"
                  src={
                    displayData?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="User Profile"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-slate-900 rounded-full shadow-lg shadow-emerald-500/50"></div>
              </div>
            </div>

            {/* User Identity */}
            <div className="text-center mt-5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {displayData?.fullName || "Loading..."}
              </h2>
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-black tracking-widest uppercase rounded-full">
                <Shield size={10} /> {displayData?.role}
              </span>
            </div>

            {/* Information Fields */}
            <div className="mt-8 space-y-3">
              {/* Name Field */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                <div className="flex items-center justify-center w-9 h-9 bg-violet-950/50 rounded-xl text-violet-400 shrink-0 border border-violet-900/30">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider leading-none mb-1">Full Name</p>
                  <p className="text-xs font-bold text-slate-200 truncate">{displayData?.fullName}</p>
                </div>
              </div>

              {/* Email Field */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                <div className="flex items-center justify-center w-9 h-9 bg-cyan-950/50 rounded-xl text-cyan-400 shrink-0 border border-cyan-900/30">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider leading-none mb-1">Email Address</p>
                  <p className="text-xs font-bold text-slate-200 truncate">{displayData?.email}</p>
                </div>
              </div>
            </div>

            {/* Role-Specific Content Injection */}
            {renderRoleSpecificContent()}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button className="w-full bg-gradient-accent text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <Pencil size={14} /> Edit Details
              </button>

              <button
                onClick={logout}
                className="w-full bg-slate-950/50 hover:bg-red-950/30 text-red-400 hover:text-red-300 font-bold py-3.5 rounded-xl border border-slate-800 hover:border-red-900/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;