import React, { useState, useEffect } from "react";

const RegistrationForm = ({ event, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    department: "",
    year: "",
    // Take data from the event prop passed by VisitorHome
    eventName: event?.title || "",
    eventId: event?._id || "", 
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync event details if the event changes
  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        eventName: event.title,
        eventId: event._id
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
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:bg-gray-50 text-sm";

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="p-10 text-center animate-fadeIn">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Success!</h2>
        <p className="text-gray-600 mb-6">You are all set for {event?.title}.</p>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="bg-white p-6 md:p-8 w-full max-w-xl mx-auto rounded-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Event Registration</h2>
        <p className="text-indigo-600 font-medium text-sm">Registering for: {event?.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
            <input type="email" name="email" placeholder="john@example.com" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
            <input type="number" name="phone" placeholder="9876543210" className={inputStyle} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Year</label>
            <select name="year" className={inputStyle} onChange={handleChange} required disabled={loading}>
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">College Name</label>
          <input type="text" name="collegeName" className={inputStyle} onChange={handleChange} required disabled={loading} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                <input type="text" name="department" className={inputStyle} onChange={handleChange} disabled={loading} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Profile Photo</label>
                <input type="file" accept="image/*" onChange={handlePhoto} required disabled={loading} className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center ${
            loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
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