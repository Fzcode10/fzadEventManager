import React, { useState } from "react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("user"); // ✅ get token

      if (!token) {
        alert("Please login first");
        return;
      }

      const response = await fetch("/api/host/requestevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 send token
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300">
      {/* Modal Container: Animation added with scale-up effect */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 transform">
        {/* Modern Header with Gradient */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Organize Event</h2>
            <p className="text-blue-100 text-xs mt-1">
              Fill in the details to request approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Area */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200"
        >
          {/* Event Title */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1 group-focus-within:text-blue-600 transition-colors">
              Event Title
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Annual Tech Summit"
              className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organizer */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Organizer
              </label>
              <input
                name="eventOrganizer"
                required
                className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all bg-white cursor-pointer"
                onChange={handleChange}
                value={formData.category}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                name="dateOFEvent"
                type="date"
                required
                className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
            {/* Slots */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Slots
              </label>
              <input
                name="slots"
                type="number"
                placeholder="0 = Unlimited"
                min={30}
                className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              name="location"
              required
              className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              required
              placeholder="Tell us about the event..."
              className="w-full border-gray-200 border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition-all resize-none"
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
