import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  FileText, 
  Check, 
  X, 
  Sparkles, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Clock 
} from "lucide-react";

const ManageEvent = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("visitors");
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const [visitors, setVisitor] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [sendEmailLoader, setEmailSendingLoader] = useState(false);

  // Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");
      if (!token) {
        Navigate("/");
        return;
      }

      const res = await fetch(`/api/event/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setEvent(data.event);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (eventName, email) => {
    try {
      setError("");
      setSuccess("");
      setEmailSendingLoader(true);

      if (!email) {
        setError("Please enter an email");
        setEmailSendingLoader(false);
        return;
      }

      const token = localStorage.getItem("user");
      const res = await fetch(`/api/host/sendinvite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          eventName: eventName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Invitation sent successfully!");
        setEmail("");
      } else {
        setError(data.message || "Failed to send email");
      }
      setEmailSendingLoader(false);
    } catch (error) {
      setError(error.message);
      setEmailSendingLoader(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");
      if (!token) {
        Navigate("/");
        return;
      }

      const res = await fetch(`/api/event/eventvisitor/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setVisitor(data.visitors);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchVisitors();
  }, [id]);

  const approval = async (registrationId, paymentStatus) => {
    try {
      const token = localStorage.getItem("user");
      const res = await fetch(`/api/host/approval/${registrationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: paymentStatus }),
      });

      if (res.ok) {
        setVisitor((prev) =>
          prev.map((v) =>
            v.registrationId === registrationId ? { ...v, paymentStatus } : v,
          ),
        );
      }
    } catch (error) {
      setError(error.message || "Unable to update approval status!");
    }
  };

  useEffect(() => {
    if (sendEmailLoader) {
      const timer = setTimeout(() => {
        setEmailSendingLoader(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [sendEmailLoader]);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Event Not Found</h2>
          <button 
            onClick={() => Navigate("/host/dashboard")}
            className="mt-4 px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-100">
      {/* Glowing mesh background */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back navigation */}
        <button
          onClick={() => Navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider mb-6 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* --- Header Section --- */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative py-6 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
          
          <div>
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase rounded-full w-fit flex items-center gap-1.5 mb-3">
              <Sparkles size={10} /> Live Manager
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-400" /> {event.location}</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1"><Calendar size={12} className="text-violet-400" /> {new Date(event.dateOFEvent).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status:</span>
            {event.status === "approved" ? (
              <span className="text-xs font-extrabold text-emerald-400 uppercase bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 rounded-lg">Approved</span>
            ) : (
              <span className="text-xs font-extrabold text-amber-400 uppercase bg-amber-950/30 border border-amber-900/30 px-2.5 py-0.5 rounded-lg">{event.status}</span>
            )}
          </div>
        </header>

        {/* --- Tabs --- */}
        <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 inline-flex gap-1 mb-8">
          {[
            { id: "visitors", label: "Visitors", icon: Users },
            { id: "invitations", label: "Send Invitation", icon: Mail },
            { id: "details", label: "Event Details", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "bg-gradient-accent text-white shadow-md shadow-violet-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- Tab Content Box --- */}
        <div className="glass-panel border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl relative">
          {/* Visitors View */}
          {activeTab === "visitors" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="text-cyan-400" size={20} /> Registered Visitors
                </h2>
                <span className="text-xs font-bold bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
                  Total Registrations: {visitors.length}
                </span>
              </div>

              {visitors.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No visitors registered for this event yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/20 scrollbar-thin scrollbar-thumb-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-900/40 text-slate-400 uppercase font-black tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Institution</th>
                        <th className="px-6 py-4">Dept.</th>
                        <th className="px-6 py-4">Year</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                      {visitors.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4 text-white font-bold whitespace-nowrap">{v.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400">{v.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{v.phone}</td>
                          <td className="px-6 py-4 max-w-xs truncate">{v.collegeName}</td>
                          <td className="px-6 py-4 whitespace-nowrap uppercase text-cyan-400 text-[10px] font-black">{v.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{v.year} Year</td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex justify-center gap-2">
                              {v.paymentStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => approval(v.registrationId, "success")}
                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white px-3 py-1.5 text-xs font-bold transition-all"
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button
                                    onClick={() => approval(v.registrationId, "rejected")}
                                    className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 text-xs font-bold transition-all"
                                  >
                                    <X size={12} /> Reject
                                  </button>
                                </>
                              )}

                              {(v.paymentStatus === "free" || v.paymentStatus === "success") && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                                  <ShieldCheck size={10} /> Approved
                                </span>
                              )}

                              {v.paymentStatus === "rejected" && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase rounded-full bg-red-950/40 border border-red-900/30 text-red-400">
                                  <AlertCircle size={10} /> Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Invitations View */}
          {activeTab === "invitations" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-2">
                <Mail className="text-violet-400" size={20} /> Send Invitation Email
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Directly invite users to attend your event. They will receive registration credentials.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recipient@domain.com"
                    className="w-full bg-slate-950/40 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-650 text-sm text-white"
                  />
                </div>

                <button
                  onClick={() => sendEmail(event.title, email)}
                  disabled={sendEmailLoader}
                  className="bg-gradient-accent text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {sendEmailLoader ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                      Sending Invitation...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>

                {/* Feedback Alerts */}
                {success && (
                  <div className="flex items-center gap-3 bg-emerald-950/40 text-emerald-400 p-4 rounded-xl border border-emerald-900/30 text-xs font-bold mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 bg-red-950/40 text-red-400 p-4 rounded-xl border border-red-900/30 text-xs font-bold mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details View */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-6">
                  <FileText className="text-cyan-400" size={20} /> Specifications
                </h2>

                <div className="space-y-4">
                  {[
                    { label: "Title", value: event.title },
                    { label: "Category", value: event.category || "General" },
                    { label: "Organizer", value: event.eventOrganizer },
                    { label: "Remaining Slots", value: event.remaningSlots === 0 ? "Fully Booked" : `${event.remaningSlots} slots` },
                    { label: "Location", value: event.location },
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between items-center py-3.5 border-b border-slate-800/80">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{spec.label}</span>
                      <span className="text-xs font-bold text-slate-200">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-4">
                  Description
                </h2>
                <div className="bg-slate-950/30 border border-slate-800/60 p-5 rounded-2xl text-xs md:text-sm text-slate-400 leading-relaxed min-h-[150px]">
                  {event.description || "No description provided."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
