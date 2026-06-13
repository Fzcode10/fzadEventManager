import React, { useState, useContext, useEffect } from "react";
import {
  Users,
  Settings,
  BarChart3,
  Calendar,
  ShieldAlert,
  UserPlus,
  Activity,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  MapPin,
  TrendingUp,
  X,
  Lock,
  Mail,
  User,
  Clock,
  Plus
} from "lucide-react";
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
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
      });
      alert("🎉 Staff added successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
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

  // Modern styled stats cards in dark theme
  const stats = [
    {
      label: "Active Visitors",
      value: "12",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: <Activity size={18} />,
    },
    {
      label: "Pending Invites",
      value: "05",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      icon: <UserPlus size={18} />,
    },
    {
      label: "Security Alerts",
      value: "02",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      icon: <ShieldAlert size={18} />,
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
      return "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 badge-glow-success";
    }

    if (status === "pending") {
      return "bg-amber-950/40 border border-amber-900/30 text-amber-400";
    }

    if (status === "rejected") {
      return "bg-red-950/40 border border-red-900/30 text-red-400";
    }

    return "bg-slate-900 border border-slate-800 text-slate-400";
  };

  const renderEventsTab = () => (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="text-violet-400" size={20} /> Visitor Events
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Filter by category and track current or incoming visitor event schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 cursor-pointer transition-all"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-slate-900 text-slate-200">
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setLiveOnly((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
              liveOnly
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-250"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${liveOnly ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
            {liveOnly ? "Live: Active" : "Live Events Off"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 rounded-xl bg-violet-950/20 border border-violet-900/30 text-violet-400 px-4 py-3 text-xs font-bold uppercase tracking-wider animate-pulse">
          Refreshing events schedule...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 px-4 py-3 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/40 text-slate-400 uppercase font-black tracking-wider">
            <tr className="border-b border-slate-800/80">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Host</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-350 font-medium">
            {!loading && events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-bold">
                  No events schedule found matching the active filters.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr className="hover:bg-slate-900/20 transition-colors" key={event._id}>
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                    {event.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">{event.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(event.dateOFEvent).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">{event.eventOrganizer}</td>
                  <td className="px-6 py-4 font-bold text-cyan-400 whitespace-nowrap">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusClasses(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      className="bg-slate-900 border border-slate-800 hover:border-violet-500 hover:text-white text-slate-300 text-xs px-4 py-1.5 rounded-lg transition-all font-bold"
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
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="text-violet-400" size={20} /> System Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust security parameters, check-in requirements, and entry pass rules.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl">
          <h3 className="font-extrabold text-white mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" /> Registration Settings
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Enable or disable required face photo capture verification or non-disclosure agreement (NDA) signing workflow on visitor check-in.
          </p>
          <button className="bg-gradient-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-violet-500/25 transition-all">
            Configure Workflow
          </button>
        </div>
        
        <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl">
          <h3 className="font-extrabold text-white mb-2 flex items-center gap-2">
            <Clock size={16} className="text-violet-400" /> Pass Expiry Policy
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Set global automated checkout thresholds and ticket expiration timers for student and visitor credentials.
          </p>
          <button className="border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
            Update Expiry Policy
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="text-cyan-400" size={20} /> Insights & Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time charts illustrating entry pass frequency and registration curves.
        </p>
      </div>

      <div className="h-72 bg-slate-950/40 border border-slate-850/80 rounded-2xl flex flex-col items-center justify-center border-dashed p-6 text-center">
        <TrendingUp className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-slate-400 font-bold text-sm">Visual Charting Engine</p>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          Analytics dashboard visualizations and live entry statistics will compile here automatically.
        </p>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="text-violet-400" size={20} /> Staff & Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system access for admins, event hosts, and campus security staff.
          </p>
        </div>
        <button
          className="bg-gradient-accent text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:shadow-violet-500/25 transition-all"
          onClick={() => setAddStaff(true)}
        >
          <Plus size={14} /> Add Staff
        </button>
      </div>
      
      <div className="p-8 text-center border border-slate-800 rounded-2xl bg-slate-950/20">
        <Users className="w-12 h-12 text-slate-650 mx-auto mb-3" />
        <p className="text-slate-400 font-bold text-sm">Role Matrix Active</p>
        <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
          Hover over dynamic card slots to configure dashboard view authorizations for Host, Security, and Admin staff.
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: "events", label: "Events", icon: <Calendar size={18} /> },
    { id: "system", label: "System", icon: <Settings size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden text-slate-100 flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Glowing mesh background */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (hidden on mobile) */}
      <nav className="hidden md:flex w-64 flex-col p-6 m-4 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl shrink-0 h-[calc(100vh-2rem)] sticky top-4">
        {/* Brand */}
        <div className="mb-10 text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          FzAdEvents
        </div>
        
        {/* Tabs */}
        <div className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-accent text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-850/50 hover:text-white"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-violet-400"}>
                {tab.icon}
              </span>
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* User Info / Profile Link in Sidebar footer */}
        <div className="border-t border-slate-800 pt-4 mt-auto">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logged in as</p>
          <p className="text-xs font-bold text-slate-400 truncate">{user?.email || "admin@fzadevents.com"}</p>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Tab Bar (hidden on desktop) */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-850 px-4 py-2.5 backdrop-blur-md justify-around items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
              activeTab === tab.id ? "text-violet-400" : "text-slate-400"
            }`}
          >
            {tab.icon}
            <span className="text-[9px] font-bold tracking-wider uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 py-6 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-md relative">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
          <div>
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1.5 mb-3">
              <Sparkles size={10} /> Admin Panel
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight uppercase">
              {activeTab} Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-violet-400 font-bold">{user?.name || "Super Admin"}</span>
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 px-4 py-3 rounded-2xl border border-slate-850 flex items-center gap-3 flex-1 lg:flex-initial"
              >
                <div className={`${s.color} p-2 rounded-xl border`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                    {s.label}
                  </p>
                  <p className="text-lg font-black text-white leading-none mt-1">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* Tab Content Box */}
        <section className="glass-panel border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl min-h-[450px]">
          {activeTab === "events" && renderEventsTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "users" && renderUsersTab()}
        </section>
      </main>

      {/* Details Modal */}
      {eventDetialsPopup && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto relative text-slate-100">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1 mb-1">
                  <Sparkles size={10} /> Specifications
                </span>
                <h3 className="text-xl font-black text-white leading-tight">Event Details</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEventDetials}
                className="bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/30 border border-slate-850 p-5 rounded-2xl">
                {[
                  { label: "Title", value: selectedEvent.title },
                  { label: "Category", value: selectedEvent.category },
                  { label: "Location", value: selectedEvent.location },
                  { label: "Organizer", value: selectedEvent.eventOrganizer },
                  { label: "Host Email", value: selectedEvent.hostEmail || "Not available" },
                  { label: "Slots Available", value: selectedEvent.remaningSlots },
                  { label: "Event ID", value: selectedEvent.eventId },
                  { label: "Current Status", value: selectedEvent.status, highlight: true },
                  { label: "Update Requested", value: selectedEvent.updateStatus ? "Yes" : "No" },
                  { 
                    label: "Event Date", 
                    value: new Date(selectedEvent.dateOFEvent).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }) 
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      {item.label}
                    </span>
                    <span className={`text-xs font-bold ${item.highlight ? "text-violet-400 uppercase" : "text-slate-200"} truncate`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">Description</p>
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl text-xs md:text-sm text-slate-450 leading-relaxed min-h-[80px]">
                  {selectedEvent.description || "No description provided."}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5 space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Request Host Update
                </label>
                <textarea
                  rows={3}
                  value={updateInstruction}
                  onChange={(e) => setUpdateInstruction(e.target.value)}
                  placeholder="Specify feedback for host (e.g. adjust limits, schedule, or venue change)..."
                  className="w-full bg-slate-950/40 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-650 text-sm text-white resize-none"
                />
              </div>

              {actionError && (
                <div className="rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 p-4 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {actionError}
                </div>
              )}

              {actionMessage && (
                <div className="rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 p-4 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0" />
                  {actionMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("approve")}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("reject")}
                  className="bg-red-500 hover:bg-red-650 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleEventAction("request-update")}
                  className="bg-gradient-accent text-white hover:shadow-violet-500/20 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {actionLoading ? "Processing..." : "Send Update To Host"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCloseEventDetials}
                  className="border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {addStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-slate-950/80 backdrop-blur-md">
          {/* Modal Container */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 text-slate-100">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h3 className="text-xl font-black text-white leading-tight">
                  Add New Staff
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Assign administrative credentials to team members.
                </p>
              </div>
              <button
                onClick={() => setAddStaff(false)}
                className="bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Name Field */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={13} className="text-violet-400" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-650 text-sm text-white"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail size={13} className="text-cyan-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="recipient@fzadevents.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-650 text-sm text-white"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock size={13} className="text-rose-400" /> Temporary Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-650 text-sm text-white"
                />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Assign Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-950/40 border border-slate-800 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all bg-slate-950 text-sm text-white cursor-pointer"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select Role</option>
                  <option value="admin" className="bg-slate-900 text-slate-200">Admin</option>
                  <option value="host" className="bg-slate-900 text-slate-200">Host</option>
                  <option value="visitor" className="bg-slate-900 text-slate-200">Visitor</option>
                  <option value="security" className="bg-slate-900 text-slate-200">Security</option>
                </select>
              </div>

              {/* Error Box */}
              {error && (
                <div className="rounded-xl bg-red-950/30 border border-red-900/30 text-red-400 p-3.5 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setAddStaff(false)}
                  className="px-5 py-2.5 text-slate-400 font-bold hover:text-white hover:bg-slate-800/40 rounded-xl transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                >
                  {loading ? "Creating..." : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashBoard;
