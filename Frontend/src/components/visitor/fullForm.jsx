import React, { useState, useEffect } from "react";
import { Signup } from "../../hooks/useSignup";
import { CheckCircle2, User, Lock, ArrowRight, ShieldAlert, Camera, X } from "lucide-react";

const Signupform = ({ email }) => {
  const { signup, error, isLoading } = Signup();

  const [userOtp, setUserOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [signupCompleted, setSignupCompleted] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: email,
    password: "",
    conformPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (localError) setLocalError(null); // Clear error when user types
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setLocalError("Only JPG, JPEG, PNG, and WEBP images are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image must be smaller than 5MB");
      return;
    }

    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    if (localError) setLocalError(null);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleVerifyOtp = async () => {
    if (!userOtp) return;
    setOtpLoading(true);
    try {
      const res = await fetch("/api/visitor/verifyotp", {
        method: "POST",
        body: JSON.stringify({ email, otp: userOtp }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw Error(json.error);

      setIsOtpVerified(true);
      setLocalError(null);
    } catch (error) {
      setLocalError(error.message);
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.conformPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    // Build FormData for multipart upload
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (profilePhoto) {
      data.append("profilePhoto", profilePhoto);
    }

    await signup(data);
    
    // We check if the signup hook updated its internal error state
    if (!error) {
      setSignupCompleted(true);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-white text-sm placeholder:text-slate-600";

  // SUCCESS VIEW
  if (signupCompleted) {
    return (
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 badge-glow-success">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome, {formData.name}!</h2>
        <p className="text-slate-400 mt-2 text-sm">Your account has been created successfully.</p>
        
        <div className="mt-6 p-5 bg-slate-950 border border-slate-900 rounded-2xl text-left">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Details</p>
          <p className="text-sm text-slate-300 mt-2"><strong>Email:</strong> {email}</p>
          <p className="text-sm text-slate-300 mt-1"><strong>Username:</strong> {formData.name}</p>
        </div>

        <button 
          onClick={() => window.location.href = "/login"} // Or your navigation logic
          className="w-full bg-gradient-accent text-white font-bold py-3.5 rounded-xl mt-8 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Email Display */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Verified Email</label>
        <div className={`${inputStyle} bg-slate-900/40 text-slate-500 border-dashed border-slate-800 mt-1.5 cursor-not-allowed select-none`}>
          {email}
        </div>
      </div>

      {/* OTP Section */}
      {!isOtpVerified && (
        <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-2xl animate-in fade-in duration-300">
          <h2 className="text-xl font-bold text-white">Verify Identity</h2>
          <p className="text-sm text-slate-450 mt-1.5 mb-6">Enter the code sent to your inbox.</p>

          <input
            type="text"
            placeholder="6-digit code"
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            className={`${inputStyle} text-center text-xl tracking-widest font-mono`}
          />

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading}
            className="w-full bg-gradient-accent text-white font-bold py-3.5 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {otpLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        </div>
      )}

      {/* Signup Form */}
      {isOtpVerified && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-2xl animate-in fade-in duration-350">
          <h2 className="text-xl font-bold text-white mb-2">Profile Details</h2>

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Photo</label>
            <div className="relative group">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-violet-500/30 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-900">
                  <Camera size={24} className="text-slate-500 mb-1" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-slate-600 font-medium">JPG, PNG or WEBP · Max 5MB</p>
          </div>

          <div className="relative flex items-center">
            <User size={18} className="absolute left-4 text-slate-500" />
            <input
              type="text"
              name="name"
              placeholder="What should we call you?"
              value={formData.name}
              onChange={handleChange}
              required
              className={`${inputStyle} pl-11`}
            />
          </div>

          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`${inputStyle} pl-11`}
            />
          </div>

          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-500" />
            <input
              type="password"
              name="conformPassword"
              placeholder="Confirm Password"
              value={formData.conformPassword}
              onChange={handleChange}
              required
              className={`${inputStyle} pl-11`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-accent text-white font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Syncing with server..." : <>Complete Signup <ArrowRight size={16} /></>}
          </button>
        </form>
      )}

      {/* ERROR & RETRY VIEW */}
      {(localError || error) && (
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-2xl shadow-sm animate-fadeIn badge-glow-danger">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
            <ShieldAlert size={16} /> Signup Failed
          </div>
          <p className="text-xs text-red-300 leading-relaxed mb-3">
            {localError || error}
          </p>
          <button 
            onClick={() => setLocalError(null)} 
            className="text-xs font-bold text-red-400 underline hover:text-red-300"
          >
            Click here to try again
          </button>
        </div>
      )}
    </div>
  );
};

export default Signupform;