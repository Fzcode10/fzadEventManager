import React, { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";

const OrganizeEventModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: "",
    eventOrganizer: "",
    description: "",
    dateOFEvent: "",
    location: "",
    category: "Other",
    slots: 0,
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    "Workshop",
    "Seminar",
    "Coding Contest",
    "Webinar",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 10); // add 10 days
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("user"); 
      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch("/api/host/requestevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("🎉 Event request submitted successfully!");
        onRefresh(); // refresh list
        onClose(); // close modal
      } else {
        alert("❌ Failed: " + (data.message || "Something went wrong"));
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Failed to submit request: Server Error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* Glassmorphism Backdrop: blur + dark tint */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      {/* Modal Container: Animation added with scale-up effect */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 transform relative">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
        
        {/* Modern Header with Gradient */}
        <div className="bg-slate-900/50 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1 mb-1.5">
              <Sparkles size={10} /> Request Event
            </span>
            <h2 className="text-2xl font-black text-white leading-tight">Organize Event</h2>
            <p className="text-slate-400 text-xs mt-1">
              Fill in the details to request host approval.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 p-2.5 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Area */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950/20 text-slate-100"
        >
          {/* Event Title */}
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Event Title
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Annual Tech Summit"
              className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-600 text-sm"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organizer */}
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Organizer
              </label>
              <input
                name="eventOrganizer"
                required
                placeholder="Name or Organization"
                className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-600 text-sm"
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Category
              </label>
              <select
                name="category"
                className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all bg-slate-950 cursor-pointer text-sm"
                onChange={handleChange}
                value={formData.category}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Date
              </label>
              <input
                name="dateOFEvent"
                type="date"
                required
                min={getMinDate()}
                className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all text-sm text-slate-200"
                onChange={handleChange}
              />
            </div>
            {/* Slots */}
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Slots
              </label>
              <input
                name="slots"
                type="number"
                placeholder="Min 30"
                min={30}
                className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-600 text-sm"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Location
            </label>
            <input
              name="location"
              required
              placeholder="e.g. Auditorium A, Campus"
              className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-600 text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              required
              placeholder="Tell us about the event..."
              className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none placeholder:text-slate-600 text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-400 font-bold hover:text-white hover:bg-slate-800/40 rounded-xl transition-all text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizeEventModal;
