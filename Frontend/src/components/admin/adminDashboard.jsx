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
  Plus,
  FileText,
  Search,
  Trash2,
  Edit3,
  Filter
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
  const [actionLoading, setActionLoading] = useState("");
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

  // Logs state
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("all");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Visitors state
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorPaymentFilter, setVisitorPaymentFilter] = useState("all");
  const [allVisitors, setAllVisitors] = useState([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userType, setUserType] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editRoleModal, setEditRoleModal] = useState(false);

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
      fetchAllUsers();
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

  // Dynamic stats generator based on active tab
  const getOverviewStats = () => {
    switch (activeTab) {
      case "events":
        return [
          {
            label: "Total Events",
            value: String(events.length).padStart(2, "0"),
            color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            icon: <Calendar size={18} />,
          },
          {
            label: "Approved Events",
            value: String(events.filter(e => e.status === "approved").length).padStart(2, "0"),
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <ShieldCheck size={18} />,
          },
          {
            label: "Pending Review",
            value: String(events.filter(e => e.status === "pending").length).padStart(2, "0"),
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            icon: <Clock size={18} />,
          },
        ];
      case "checklogs":
        return [
          {
            label: "Total Scan Logs",
            value: String(logs.length).padStart(2, "0"),
            color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            icon: <Clock size={18} />,
          },
          {
            label: "Checked In Today",
            value: String(logs.filter(l => l.status === "IN").length).padStart(2, "0"),
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <Activity size={18} />,
          },
          {
            label: "Checked Out Today",
            value: String(logs.filter(l => l.status === "OUT").length).padStart(2, "0"),
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            icon: <ShieldCheck size={18} />,
          },
        ];
      case "visitors":
        return [
          {
            label: "Pre-Registrations",
            value: String(allVisitors.length).padStart(2, "0"),
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            icon: <UserPlus size={18} />,
          },
          {
            label: "Approved Passes",
            value: String(allVisitors.filter(v => v.paymentStatus === "success" || v.paymentStatus === "free").length).padStart(2, "0"),
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <ShieldCheck size={18} />,
          },
          {
            label: "Pending Passes",
            value: String(allVisitors.filter(v => v.paymentStatus === "pending").length).padStart(2, "0"),
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            icon: <Clock size={18} />,
          },
        ];
      case "users":
        return [
          {
            label: "Total Users",
            value: String(allUsers.length).padStart(2, "0"),
            color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            icon: <Users size={18} />,
          },
          {
            label: "Administrators",
            value: String(allUsers.filter(u => u.role?.toLowerCase() === "admin").length).padStart(2, "0"),
            color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            icon: <ShieldAlert size={18} />,
          },
          {
            label: "Staff & Security",
            value: String(allUsers.filter(u => ["host", "security"].includes(u.role?.toLowerCase())).length).padStart(2, "0"),
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            icon: <UserPlus size={18} />,
          },
        ];
      case "system":
        return [
          {
            label: "Security Level (Incomplted)",
            value: "High",
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <ShieldCheck size={18} />,
          },
          {
            label: "Active Policies (Incompleted)",
            value: "02",
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            icon: <Settings size={18} />,
          },
          {
            label: "Auto Checkout (Incomplted)",
            value: "22:00",
            color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            icon: <Clock size={18} />,
          },
        ];
      case "analytics":
        return [
          {
            label: "Check-in Conversion",
            value: allVisitors.length ? `${Math.round((logs.filter(l => l.status === "IN").length / allVisitors.length) * 100)}%` : "0%",
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            icon: <TrendingUp size={18} />,
          },
          {
            label: "Active Visitors",
            value: String(logs.filter(l => l.status === "IN").length).padStart(2, "0"),
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            icon: <Activity size={18} />,
          },
          {
            label: "Total Events",
            value: String(events.length).padStart(2, "0"),
            color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            icon: <Calendar size={18} />,
          },
        ];
      default:
        return [];
    }
  };

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

  const fetchCheckLogs = async () => {
    try {
      setLogsLoading(true);
      const token = localStorage.getItem("user");
      if (!token) return;
      
      const cleanToken = token.startsWith("{")
        ? JSON.parse(token).token
        : token.replace(/"/g, "");

      const params = new URLSearchParams({
        status: logStatus,
        search: logSearch,
      });

      const res = await fetch(`/api/admin/checklogs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAllVisitors = async () => {
    try {
      setVisitorsLoading(true);
      const token = localStorage.getItem("user");
      if (!token) return;

      const cleanToken = token.startsWith("{")
        ? JSON.parse(token).token
        : token.replace(/"/g, "");

      const params = new URLSearchParams({
        paymentStatus: visitorPaymentFilter,
        search: visitorSearch,
      });

      const res = await fetch(`/api/admin/visitors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${cleanToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAllVisitors(data.visitors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVisitorsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setUserLoading(true);

      const token = localStorage.getItem("user");
      if (!token) return;

      const cleanToken = token.startsWith("{")
        ? JSON.parse(token).token
        : token.replace(/"/g, "");

      const url = userType
        ? `/api/admin/users?type=${encodeURIComponent(userType)}`
        : `/api/admin/users`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAllUsers(data.data || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setUserLoading(true);
      const token = localStorage.getItem("user");
      if (!token) return;

      const cleanToken = token.startsWith("{")
        ? JSON.parse(token).token
        : token.replace(/"/g, "");

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 User role updated successfully!");
        setEditRoleModal(false);
        setSelectedUserForEdit(null);
        await fetchAllUsers();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ An error occurred while updating the user role.");
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setUserLoading(true);
      const token = localStorage.getItem("user");
      if (!token) return;

      const cleanToken = token.startsWith("{")
        ? JSON.parse(token).token
        : token.replace(/"/g, "");

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert("🗑️ User deleted successfully!");
        await fetchAllUsers();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ An error occurred while deleting the user.");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchAllUsers();
    }
  }, [activeTab, userType]);

  const exportToCSV = (data, filename, headers) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    
    data.forEach(row => {
      const rowData = headers.map(header => {
        const val = row[header] !== undefined ? String(row[header]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (activeTab === "checklogs") {
      fetchCheckLogs();
    }
  }, [activeTab, logStatus, logSearch]);

  useEffect(() => {
    if (activeTab === "visitors") {
      fetchAllVisitors();
    }
  }, [activeTab, visitorPaymentFilter, visitorSearch]);

  // Prime statistics counts on initial dashboard load
  useEffect(() => {
    fetchCheckLogs();
    fetchAllVisitors();
    fetchAllUsers();
  }, []);

  const handleOpenEventDetials = (event) => {
    setSelectedEvent(event);
    setEventDetialsPopup(true);
    setActionError("");
    setActionMessage("");
    setUpdateInstruction("");
    setTimeout(() => {
      document.getElementById("admin-event-details-section")?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
      setActionLoading(actionType);
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
      setActionLoading("");
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

      {selectedEvent && (
        <div id="admin-event-details-section" className="w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative text-slate-100 mt-8 scroll-mt-6 animate-fadeIn">
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

            {selectedEvent.lastUpdatedByHost && (
              <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                  <AlertCircle size={12} /> Host Update Notification
                </p>
                <p className="text-xs text-amber-300">
                  The host has updated this event's plan. Please review the updated specifications.
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2 border-t border-amber-900/20 text-[11px] text-amber-400 font-bold">
                <p>New Detials</p>
                  <span className="flex items-center gap-1">
                    <strong>Date:</strong> {new Date(selectedEvent.dateOFEvent).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <strong>Location:</strong> {selectedEvent.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <strong>Slots:</strong> {selectedEvent.remaningSlots}
                  </span>
                </div>
              </div>
            )}

            {/* Update Request History */}
            {selectedEvent.updateHistory && selectedEvent.updateHistory.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileText size={12} className="text-violet-400" /> Update Request History
                </p>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {[...selectedEvent.updateHistory].reverse().map((entry, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl flex items-start gap-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-violet-500 shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-200 leading-relaxed">{entry.instruction}</p>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-bold">
                          {new Date(entry.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                          at {new Date(entry.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          <span className="text-slate-600 ml-2">• Sent by {entry.sentBy}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                disabled={!!actionLoading}
                onClick={() => handleEventAction("approve")}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                {actionLoading === "approve" ? "Approving..." : "Approve"}
              </button>

              <button
                type="button"
                disabled={!!actionLoading}
                onClick={() => handleEventAction("reject")}
                className="bg-red-500 hover:bg-red-650 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                {actionLoading === "reject" ? "Rejecting..." : "Reject"}
              </button>

              <button
                type="button"
                disabled={!!actionLoading}
                onClick={() => handleEventAction("request-update")}
                className="bg-gradient-accent text-white hover:shadow-violet-500/20 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                {actionLoading === "request-update" ? "Sending..." : "Send Update To Host"}
              </button>

              <button
                type="button"
                disabled={!!actionLoading}
                onClick={handleCloseEventDetials}
                className="border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
         <p>(Overview are according to All Visitors Tab)</p></h2>
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

  const renderUsersTab = () => {
    const filteredUsers = allUsers.filter((u) => {
      const search = userSearch.trim().toLowerCase();
      if (!search) return true;
      return (
        u.name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        (u.userId && u.userId.toLowerCase().includes(search))
      );
    });

    const getRoleBadgeClasses = (role = "") => {
      const r = role.toLowerCase();
      if (r === "admin") {
        return "bg-rose-950/40 border border-rose-900/30 text-rose-400 badge-glow-danger";
      }
      if (r === "host") {
        return "bg-violet-950/40 border border-violet-900/30 text-violet-400";
      }
      if (r === "security") {
        return "bg-blue-950/40 border border-blue-900/30 text-blue-400";
      }
      if (r === "visitor") {
        return "bg-amber-950/40 border border-amber-900/30 text-amber-400";
      }
      return "bg-slate-900 border border-slate-800 text-slate-400";
    };

    return (
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Users className="text-violet-400" size={20} /> User & Role Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure system roles, manage permissions, and add new administrative or security staff members.
            </p>
          </div>

          <button
            className="bg-gradient-accent text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:shadow-violet-500/25 transition-all self-start sm:self-auto"
            onClick={() => setAddStaff(true)}
          >
            <Plus size={14} /> Add Staff
          </button>
        </div>

        {/* Filter & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/20 p-4 border border-slate-800/80 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, email, ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-650 transition-all"
              />
            </div>

            {/* User Type Select */}
            <div className="relative w-full sm:w-48">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-violet-500 cursor-pointer transition-all"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins</option>
                <option value="host">Hosts</option>
                <option value="security">Security</option>
                <option value="visitor">Visitors</option>
                <option value="other">Staff Members Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={fetchAllUsers}
              className="border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Refresh
            </button>

            <button
              onClick={() =>
                exportToCSV(
                  filteredUsers,
                  "system_users_export.csv",
                  ["userId", "name", "email", "role", "createdBy", "createdAt"]
                )
              }
              className="bg-gradient-accent text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:shadow-violet-500/25"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Users Table / Grid */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/40 text-slate-400 uppercase font-black tracking-wider">
              <tr className="border-b border-slate-800/80">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Registered On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-350 font-medium">
              {userLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold animate-pulse">
                    Loading system users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">
                    No users found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr className="hover:bg-slate-900/20 transition-colors" key={u._id}>
                    {/* User Profile Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {u.profilePhoto ? (
                          <img
                            src={u.profilePhoto}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-slate-700 flex items-center justify-center text-[10px] font-black text-violet-300">
                            {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs">{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                      {u.userId || "—"}
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getRoleBadgeClasses(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-450">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Role Button */}
                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setEditRoleModal(true);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-400 p-2 rounded-lg border border-slate-850 transition-all"
                          title="Change Role"
                        >
                          <Edit3 size={12} />
                        </button>

                        {/* Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-rose-950/20 hover:bg-rose-950/60 hover:text-rose-300 text-rose-450 p-2 rounded-lg border border-rose-900/30 transition-all"
                          title="Remove User"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCheckLogsTab = () => (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="text-violet-400" size={20} /> Visitor Entry/Exit Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time logs of security scans at front desk check-in / check-out.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search visitor, event..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-600 w-48 transition-all"
          />

          <select
            value={logStatus}
            onChange={(e) => setLogStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 cursor-pointer transition-all"
          >
            <option value="all">All Logs</option>
            <option value="IN">Checked In</option>
            <option value="OUT">Checked Out</option>
          </select>

          <button
            onClick={() => exportToCSV(
              logs, 
              "check_logs_export.csv", 
              ["registrationId", "eventName", "visitorName", "visitorEmail", "phone", "collegeName", "status", "checkIntime", "checkOutTime"]
            )}
            className="bg-gradient-accent text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:shadow-violet-500/25"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/40 text-slate-400 uppercase font-black tracking-wider">
            <tr className="border-b border-slate-800/80">
              <th className="px-6 py-4">Reg ID</th>
              <th className="px-6 py-4">Visitor</th>
              <th className="px-6 py-4">Email / Phone</th>
              <th className="px-6 py-4">Event Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4">Check-Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-350 font-medium">
            {logsLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-bold animate-pulse">
                  Loading scan logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-bold">
                  No scan logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr className="hover:bg-slate-900/20 transition-colors" key={log._id}>
                  <td className="px-6 py-4 font-bold text-violet-400 whitespace-nowrap">{log.registrationId}</td>
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                    <div>{log.visitorName}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{log.collegeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    <div>{log.visitorEmail}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{log.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-450">{log.eventName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      log.status === "IN" 
                        ? "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400" 
                        : "bg-blue-950/40 border border-blue-900/30 text-blue-400"
                    }`}>
                      {log.status === "IN" ? "Checked In" : "Checked Out"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {new Date(log.checkIntime).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {log.checkOutTime 
                      ? new Date(log.checkOutTime).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) 
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAllVisitorsTab = () => (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="text-cyan-400" size={20} /> Pre-Registered Visitors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse all visitor pre-registrations and pass status across events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={visitorSearch}
            onChange={(e) => setVisitorSearch(e.target.value)}
            placeholder="Search name, email, event..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-650 w-48 transition-all"
          />

          <select
            value={visitorPaymentFilter}
            onChange={(e) => setVisitorPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 cursor-pointer transition-all"
          >
            <option value="all">All Passes</option>
            <option value="success">Approved</option>
            <option value="free">Invited</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => exportToCSV(
              allVisitors, 
              "visitors_export.csv", 
              ["registrationId", "fullName", "email", "phone", "collegeName", "department", "year", "eventName", "paymentStatus"]
            )}
            className="bg-gradient-accent text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:shadow-violet-500/25"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/40 text-slate-400 uppercase font-black tracking-wider">
            <tr className="border-b border-slate-800/80">
              <th className="px-6 py-4">Reg ID</th>
              <th className="px-6 py-4">Visitor Details</th>
              <th className="px-6 py-4">Institution / Dept</th>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Pass Status</th>
              <th className="px-6 py-4">Registered On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-350 font-medium">
            {visitorsLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold animate-pulse">
                  Loading registered visitors...
                </td>
              </tr>
            ) : allVisitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                  No visitors found.
                </td>
              </tr>
            ) : (
              allVisitors.map((v) => (
                <tr className="hover:bg-slate-900/20 transition-colors" key={v._id}>
                  <td className="px-6 py-4 font-bold text-violet-400 whitespace-nowrap">{v.registrationId}</td>
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                    <div>{v.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{v.email} • {v.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div>{v.collegeName}</div>
                    <div className="text-[10px] text-cyan-400 uppercase font-bold mt-0.5">{v.department} • {v.year} Year</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200 whitespace-nowrap">{v.eventName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      v.paymentStatus === "success" || v.paymentStatus === "free"
                        ? "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400"
                        : v.paymentStatus === "pending"
                        ? "bg-amber-950/40 border border-amber-900/30 text-amber-400"
                        : "bg-red-950/40 border border-red-900/30 text-red-400"
                    }`}>
                      {v.paymentStatus === "success" ? "Approved" : v.paymentStatus === "free" ? "Invited" : v.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    {new Date(v.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: "events", label: "Events", icon: <Calendar size={18} /> },
    { id: "checklogs", label: "Check Logs", icon: <Clock size={18} /> },
    { id: "visitors", label: "All Visitors", icon: <Users size={18} /> },
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
              {activeTab === "checklogs" ? "Check Logs" : activeTab === "visitors" ? "Visitors" : activeTab} Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-violet-400 font-bold">{user?.name || "Super Admin"}</span>
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {getOverviewStats().map((s, idx) => (
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
          {activeTab === "checklogs" && renderCheckLogsTab()}
          {activeTab === "visitors" && renderAllVisitorsTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "users" && renderUsersTab()}
        </section>
      </main>



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

      {/* Edit Role Modal */}
      {editRoleModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 text-slate-100">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h3 className="text-xl font-black text-white leading-tight">
                  Update System Role
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Modify system access for <strong>{selectedUserForEdit.name}</strong>.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditRoleModal(false);
                  setSelectedUserForEdit(null);
                }}
                className="bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Select New Role
                </label>
                <select
                  value={selectedUserForEdit.role}
                  onChange={(e) => setSelectedUserForEdit({ ...selectedUserForEdit, role: e.target.value })}
                  className="w-full bg-slate-950/40 border border-slate-850 p-3 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all bg-slate-950 text-sm text-white cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="host">Host</option>
                  <option value="visitor">Visitor</option>
                  <option value="security">Security</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setEditRoleModal(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-5 py-2.5 text-slate-400 font-bold hover:text-white hover:bg-slate-800/40 rounded-xl transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleUpdateUserRole(selectedUserForEdit._id, selectedUserForEdit.role)}
                  disabled={userLoading}
                  className="bg-gradient-accent text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                >
                  {userLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashBoard;
