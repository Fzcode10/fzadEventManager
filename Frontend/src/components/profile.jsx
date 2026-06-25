import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Sparkles, Ticket, LogOut, Pencil, KeyRound, Loader2, X, Upload } from "lucide-react";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useLogout();
  const { dispatch } = useContext(AuthContext);

  // Profile Edit States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const openEditModal = () => {
    const displayData = profileData || user;
    setEditName(displayData?.fullName || displayData?.name || "");
    setEditPassword("");
    setEditConfirmPassword("");
    setProfilePhotoFile(null);
    setPhotoPreviewUrl(displayData?.profilePhoto || "");
    setOtpCode("");
    setIsOtpSent(false);
    setEditError("");
    setEditSuccess("");
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEditError("File size exceeds 5MB limit.");
        return;
      }
      setProfilePhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setEditError("");
    setEditSuccess("");

    const token = localStorage.getItem("user");
    if (!token) {
      setEditError("Authentication token not found.");
      setSendingOtp(false);
      return;
    }

    try {
      const cleanToken = token.replace(/"/g, "");
      const res = await fetch("/api/admin/send-update-otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanToken}`
        }
      });

      const json = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setEditSuccess("Verification code sent to your email!");
      } else {
        throw new Error(json.error || "Failed to send verification code.");
      }
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError("");
    setEditSuccess("");

    if (!otpCode) {
      setEditError("Please enter the verification code.");
      setSavingProfile(false);
      return;
    }

    if (editPassword && editPassword !== editConfirmPassword) {
      setEditError("Passwords do not match.");
      setSavingProfile(false);
      return;
    }

    const token = localStorage.getItem("user");
    if (!token) {
      setEditError("Authentication token not found.");
      setSavingProfile(false);
      return;
    }

    try {
      const cleanToken = token.replace(/"/g, "");
      const formData = new FormData();
      formData.append("otp", otpCode);
      if (editName.trim()) {
        formData.append("name", editName.trim());
      }
      if (editPassword.trim()) {
        formData.append("password", editPassword.trim());
      }
      if (profilePhotoFile) {
        formData.append("profilePhoto", profilePhotoFile);
      }

      const res = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cleanToken}`
        },
        body: formData
      });

      const json = await res.json();
      if (res.ok) {
        // Update local profileData state
        const updatedProfile = {
          fullName: json.user.name,
          email: json.user.email,
          role: json.user.role,
          profilePhoto: json.user.profilePhoto
        };
        setProfileData(updatedProfile);

        // Update localStorage
        localStorage.setItem(
          "userDetails",
          JSON.stringify({
            name: json.user.name,
            role: json.user.role,
            profilePhoto: json.user.profilePhoto,
            token: cleanToken
          })
        );

        // Dispatch AuthContext action
        dispatch({
          type: "LOGIN",
          payload: {
            name: json.user.name,
            role: json.user.role,
            profilePhoto: json.user.profilePhoto,
            token: cleanToken
          }
        });

        setEditSuccess("Profile updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1500);
      } else {
        throw new Error(json.error || "Failed to update profile.");
      }
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

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
                    displayData?.profilePhoto ||
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
              <button 
                onClick={openEditModal}
                className="w-full bg-gradient-accent text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden glass-panel">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
              <h3 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
                <Pencil size={18} className="text-violet-400" /> Edit Profile Details
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Error/Success messages */}
              {editError && (
                <div className="p-3.5 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                  {editSuccess}
                </div>
              )}

              {/* Photo Upload with Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <img
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-950 ring-2 ring-violet-500/30"
                    src={photoPreviewUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="Preview"
                  />
                  <label htmlFor="editProfilePhoto" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-all">
                    <Upload size={18} className="text-white animate-pulse" />
                  </label>
                  <input
                    type="file"
                    id="editProfilePhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change Profile Picture</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all text-white text-sm placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="pt-2 border-t border-slate-800/50 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <KeyRound size={12} className="text-violet-400" /> Change Password (Optional)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">New Password</label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all text-white text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all text-white text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Email Verification Section */}
              <div className="pt-4 border-t border-slate-800/50 space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identity Verification</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={!isOtpSent}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all text-white text-sm placeholder:text-slate-600 disabled:opacity-50"
                    placeholder={isOtpSent ? "Enter 6-digit Code" : "Send OTP first"}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5"
                  >
                    {sendingOtp ? <Loader2 size={14} className="animate-spin" /> : null}
                    {isOtpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || !otpCode}
                  className="flex-1 py-3 bg-gradient-accent text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : null}
                  Verify & Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;