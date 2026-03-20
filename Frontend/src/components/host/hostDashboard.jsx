import React, { useState, useEffect } from "react";
import OrganizeEventModal from "./OrganizeEventModal";
import { useNavigate } from "react-router-dom";

const HostDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user");

      if (!token) {
        Navigate("/");
        return;
      }

      const response = await fetch("/api/host/upcomingevents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-12 pb-10 px-4 md:px-8 w-full">
      <div className="max-w-6xl mx-auto">
        {/* --- Header Section --- */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Event Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Monitor your visit requests and approved schedules.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Organize New Event
          </button>
        </header>

        {/* --- Main Content Area --- */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-500 font-medium">
                Loading your events...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
              <p className="text-slate-400 text-lg font-medium">
                No events scheduled yet.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-bold mt-2 hover:underline"
              >
                Create your first event now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col group relative"
                >
                  {/* Top Header: Category & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-blue-600 tracking-[0.15em] uppercase px-2 py-0.5 bg-blue-50 rounded-md w-fit">
                        {event.category || "General"}
                      </span>
                      <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                        {event.title}
                      </h2>
                    </div>

                    {/* Status Badge - Refined UI */}
                    <div className="shrink-0">
                      {event.status === "approved" && (
                        <button
                          onClick={() =>
                            Navigate(`/host/manage/${event.eventId}`)
                          }
                          className="flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm hover:bg-indigo-700 transition"
                        >
                          ⚙ Manage Event
                        </button>
                      )}

                      {event.status === "pending" && (
                        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-100/50 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          PENDING
                        </span>
                      )}

                      {event.status === "rejected" && (
                        <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-100/50 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          REJECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description - Shorter font size */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-6 italic opacity-80">
                    {event.description}
                  </p>

                  {/* Metadata Grid - Reduced font sizes and optimized spacing */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-4 pt-4 border-t border-slate-50">
                    {/* Location */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 bg-blue-50/50 rounded-lg text-blue-500 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-1">
                          Location
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-30">
                          {event.location || "TBD"}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 bg-purple-50/50 rounded-lg text-purple-500 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-1">
                          Date
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          {new Date(event.dateOFEvent).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Slots */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 bg-orange-50/50 rounded-lg text-orange-500 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-1">
                          Total Sloat
                        </span>
                        <span className="text-[11px] font-bold text-slate-600">
                          {event.slots === 0 ? "Open" : `${event.slots} Slots`}
                        </span>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 bg-rose-50/50 rounded-lg text-rose-500 shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase text-slate-400 font-extrabold tracking-wider leading-none mb-1">
                          Host
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-25">
                          {event.eventOrganizer}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <OrganizeEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEvents}
      />
    </div>
  );
};

export default HostDashboard;
