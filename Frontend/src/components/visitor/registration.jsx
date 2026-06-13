import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Upload, AlertTriangle, ShieldCheck, Clipboard } from "lucide-react";

const RegistrationForm = ({ event, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    department: "",
    year: "",
    eventName: event?.title || "",
    eventId: event?.eventId || "", 
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Sync event details if the event changes
  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        eventName: event.title,
        eventId: event.eventId
      }));
    }
  }, [event]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  const handlePhoto = (e) => {
    setPhoto(e.target.files[0]);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!photo) {
      setError("Please upload a profile photo.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("photo", photo);

    const token = localStorage.getItem("user");

    // 1. If no token, redirect to home/login immediately
    if (!token) {
      navigate("/"); 
      return;
    }

    const cleanToken = token.replace(/"/g, "");

    console.log(data);

    try {
      const response = await fetch("/api/visitor/registration", {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${cleanToken}`
        },
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess(); // Notify parent to show the 10s toast
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all disabled:opacity-50 text-white text-sm placeholder:text-slate-600";

  const labelStyle = 
    "block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 ml-1";

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="p-10 text-center animate-fadeIn bg-slate-900 text-slate-100">
        <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 badge-glow-success">
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Registration Success!</h2>
        <p className="text-slate-400 mb-6 text-sm">You are all set for {event?.title}.</p>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="bg-slate-900 p-6 md:p-8 w-full max-w-xl mx-auto rounded-3xl text-slate-150">
      <div className="mb-6 pb-4 border-b border-slate-800/80">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Clipboard className="text-violet-500" size={24} /> Event Registration
        </h2>
        <p className="text-slate-400 font-semibold text-xs mt-1">
          Registering for: <span className="text-cyan-400">{event?.title}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="john@example.com" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Phone</label>
            <input type="number" name="phone" placeholder="9876543210" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className={labelStyle}>Year</label>
            <select name="year" className={`${inputStyle} cursor-pointer`} onChange={handleChange} required disabled={loading}>
              <option value="" className="bg-slate-900 text-slate-500">Select Year</option>
              <option value="1st Year" className="bg-slate-900 text-white">1st Year</option>
              <option value="2nd Year" className="bg-slate-900 text-white">2nd Year</option>
              <option value="3rd Year" className="bg-slate-900 text-white">3rd Year</option>
              <option value="4th Year" className="bg-slate-900 text-white">4th Year</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelStyle}>College Name</label>
          <input type="text" name="collegeName" placeholder="University Name" className={inputStyle} onChange={handleChange} required disabled={loading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={labelStyle}>Department</label>
                <input type="text" name="department" placeholder="e.g. CSE" className={inputStyle} onChange={handleChange} disabled={loading} />
            </div>
            <div>
                <label className={labelStyle}>Profile Photo</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhoto} 
                    required 
                    disabled={loading} 
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-3.5 file:rounded-xl file:border-0 file:bg-slate-950 file:text-cyan-400 hover:file:bg-slate-800 file:font-bold file:cursor-pointer cursor-pointer border border-slate-850 rounded-xl" 
                  />
                </div>
            </div>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-900/40 p-4 text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-fadeIn badge-glow-danger">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer ${
            loading 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750" 
              : "bg-gradient-accent hover:shadow-violet-500/10 active:scale-[0.98]"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm My Registration"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;