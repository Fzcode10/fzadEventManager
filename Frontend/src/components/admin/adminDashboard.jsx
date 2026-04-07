import React, { useState, useContext, useEffect } from "react";
import {
  Users,
  Settings,
  BarChart3,
  Calendar,
  ShieldAlert,
  UserPlus,
  Activity,
} from "lucide-react"; // Using lucide-react for icons
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const AdminDashBoard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const [eventDetialsPopup, setEventDetialsPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [updateInstruction, setUpdateInstruction] = useState("");
  const [addStaff, setAddStaff] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // 1. Get Token (Ensure you are getting the token string, not the user object)
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login");
        return;
      }

      // If you stored the whole object, parse it; if just the token string, use as is.
      const token = userData.startsWith("{")
        ? JSON.parse(userData).token
        : userData;

      // 2. Fetch Request
      const res = await fetch(`/api/admin/addnewstaff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // 3. Correct way to parse response body
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add staff");
      }

      // 4. Success State
      setError(null);
      setAddStaff(false);
      // Optional: Refresh your staff list here or show a toast notification
    } catch (error) {
      setError(error.message);
    } finally {
      // This ensures loading is stopped regardless of success or failure
      setLoading(false);
    }
  };

  const categories = [
    "all",
    "Workshop",
    "Seminar",
    "Coding Contest",
    "Webinar",
    "Other",
    "pending",
  ];

  const formatDateForApi = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Mock Data for UI demonstration
  const stats = [
    {
      label: "Active Visitors",
      value: "12",
      color: "text-green-600",
      icon: <Activity size={20} />,
    },
    {
      label: "Pending Invites",
      value: "05",
      color: "text-blue-600",
      icon: <UserPlus size={20} />,
    },
    {
      label: "Security Alerts",
      value: "02",
      color: "text-red-600",
      icon: <ShieldAlert size={20} />,
    },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("user");
      if (!token) {
        navigate("/login");
        return;
      }

      const cleanToken = token.replace(/"/g, "");
      const params = new URLSearchParams({
        category: selectedCategory,
        live: String(liveOnly),
      });

      if (liveOnly) {
        params.set("date", formatDateForApi());
      }

      const res = await fetch(`/api/admin/allevents?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      setEvents(data.events);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, liveOnly]);

  const handleOpenEventDetials = (event) => {
    setSelectedEvent(event);
    setEventDetialsPopup(true);
    setActionError("");
    setActionMessage("");
    setUpdateInstruction("");
  };

  const handleCloseEventDetials = () => {
    setEventDetialsPopup(false);
    setSelectedEvent(null);
    setActionError("");
    setActionMessage("");
    setUpdateInstruction("");
  };

  const handleEventAction = async (actionType) => {
    if (!selectedEvent?._id) {
      setActionError("No event selected");
      return;
    }

    if (actionType === "request-update" && !updateInstruction.trim()) {
      setActionError("Please add update instruction for host");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setActionMessage("");

      const token = localStorage.getItem("user");
      if (!token) {
        navigate("/login");
        return;
      }

      const cleanToken = token.replace(/"/g, "");

      let endpoint = "";
      let payload = {};

      if (actionType === "approve") {
        endpoint = `/api/admin/events/${selectedEvent._id}/status`;
        payload = { status: "approved" };
      } else if (actionType === "reject") {
        endpoint = `/api/admin/events/${selectedEvent._id}/status`;
        payload = { status: "rejected" };
      } else {
        endpoint = `/api/admin/events/${selectedEvent._id}/request-update`;
        payload = { instruction: updateInstruction.trim() };
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update event");
      }

      if (data.event) {
        setSelectedEvent((prev) => ({ ...prev, ...data.event }));
      }

      setActionMessage(data.message || "Action completed successfully");

      if (actionType === "request-update") {
        setUpdateInstruction("");
      }

      await fetchEvents();
    } catch (actionError) {
      setActionError(actionError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    if (status === "approved") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "pending") {
      return "bg-amber-100 text-amber-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const renderEventsTab = () => (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Visitor Events</h2>
          <p className="text-sm text-gray-500">
            Filter by category and see only today&apos;s live events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setLiveOnly((prev) => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              liveOnly
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {liveOnly ? "Live: ON" : "Live: OFF"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 rounded-lg bg-blue-50 text-blue-700 px-4 py-2 text-sm font-medium">
          Loading events...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Host</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {!loading && events.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No events found for selected filters.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr className="border-b hover:bg-gray-50" key={event._id}>
                  <td className="p-4 font-medium text-gray-800">
                    {event.title}
                  </td>
                  <td className="p-4">{event.category}</td>
                  <td className="p-4">
                    {new Date(event.dateOFEvent).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">{event.eventOrganizer}</td>
                  <td className="p-4 text-blue-700 font-medium">
                    {event.location}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs px-3 py-1.5 rounded-lg"
                      onClick={() => handleOpenEventDetials(event)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">System Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Registration Settings</h3>
          <p className="text-sm text-gray-500 mb-4">
            Enable/Disable photo capture or NDA signing.
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
            Configure Form
          </button>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Pass Expiry Policy</h3>
          <p className="text-sm text-gray-500 mb-4">
            Set global checkout times for visitors.
          </p>
          <button className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded text-sm">
            Update Policy
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Insights & Analytics</h2>
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500 italic">
          Chart.js / Recharts visualization would go here
        </p>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Staff & Roles</h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => setAddStaff(true)}
        >
          <UserPlus size={18} /> Add Staff
        </button>
      </div>
      <p className="text-gray-600">
        Manage Mentor, Admin, and Security roles here.
      </p>
    </div>
  );

  const tabs = [
    { id: "events", label: "Events", icon: <Calendar size={18} /> },
    { id: "system", label: "System", icon: <Settings size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto flex justify-between  bg-gray-50 ">
      {/* Sidebar */}
      <nav className="w-64 flex flex-col p-4 m-2 rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-xl transition-all">
        {/* Logo Section */}
        <div className="mb-8 p-2 text-2xl font-black tracking-tighter text-indigo-600 drop-shadow-sm">
          FzAdEvents
        </div>

        {/* Tabs Section */}
        <div className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]"
                  : "text-slate-600 hover:bg-white/50 hover:text-indigo-600 hover:shadow-sm"
              }`}
            >
              <span
                className={
                  activeTab === tab.id ? "text-white" : "text-indigo-500"
                }
              >
                {tab.icon}
              </span>
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              {activeTab} Overview
            </h1>
            <p className="text-gray-500 text-sm">
              Welcome back, {user?.name || "Super Admin"}
            </p>
          </div>

          <div className="flex gap-4">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-3"
              >
                <div className={`${s.color} bg-opacity-10 p-2 rounded`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    {s.label}
                  </p>
                  <p className="text-lg font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Tab Content Area */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-125">
          {activeTab === "events" && renderEventsTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "users" && renderUsersTab()}
        </section>
      </main>

      {eventDetialsPopup && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
              <button
                type="button"
                onClick={handleCloseEventDetials}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Title</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.category}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedEvent.dateOFEvent).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Organizer</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.eventOrganizer}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Host Email</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.hostEmail || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining Slots</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.remaningSlots}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Event ID</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.eventId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {selectedEvent.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Update Requested</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.updateStatus ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Description</p>
                <p className="mt-1 text-gray-700 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="border-t pt-5 space-y-3">
                <p className="font-semibold text-gray-800">
                  Request Host Update
                </p>
                <textarea
                  rows={4}
                  value={updateInstruction}
                  onChange={(e) => setUpdateInstruction(e.target.value)}
                  placeholder="Write instruction for host (e.g., change event date/time, update agenda, or modify plan)."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {actionError && (
                <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm font-medium">
                  {actionError}
                </div>
              )}

              {actionMessage && (
                <div className="rounded-lg bg-green-50 text-green-700 px-4 py-2 text-sm font-medium">
                  {actionMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("approve")}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("reject")}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("request-update")}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {actionLoading ? "Processing..." : "Send Update To Host"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCloseEventDetials}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          {/* Animated Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

          {/* Modal Container */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Staff
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new account for your team member or host.
                </p>
              </div>
              <button
                onClick={() => setAddStaff(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* role selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Assign Role
                  </label>
                  <div className="relative">
                    <select
                      type="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="host">Host</option>
                      <option value="visitor">Visitor</option>
                      <option value="security">Security</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setAddStaff(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
                >
                  Create Staff Member
                </button>

                {error && (
                  <div className="rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashBoard;
