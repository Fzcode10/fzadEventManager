import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenerateQR from "./qrComponent";

export default function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      const token = localStorage.getItem("user");
      if (!token) {
        navigate("/");
        return;
      }

      const cleanToken = token.replace(/"/g, "");

      try {
        const response = await fetch("/api/visitor/allregistredevent", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your events...</p>
      </div>
    );
  }

  return (
    /* Added 'pt-24 pb-12' to ensure content isn't hidden behind a fixed navbar 
       and stays clear of the footer. 
    */
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Container to keep content centered and properly sized */}
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Registered Events
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your bookings and download your entry passes.
          </p>
        </header>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-lg">
              No registrations found.
            </p>
            <button 
              onClick={() => navigate('/events')} 
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Browse upcoming events →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={event._id || event.id || index}
                className="group bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 rounded-4xl overflow-hidden flex flex-col"
              >
                <div className="p-6 flex flex-col grow">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title || "Untitled Event"}
                    </h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-600 text-sm">
                      <span className="bg-slate-100 p-2 rounded-lg mr-3">📅</span>
                      <span className="font-medium">{formatDate(event.dateOFEvent)}</span>
                    </div>
                    <div className="flex items-center text-slate-600 text-sm">
                      <span className="bg-slate-100 p-2 rounded-lg mr-3">📍</span>
                      <span className="font-medium truncate">{event.location || "Online"}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        event.paymentStatus !== "Pending"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {event.paymentStatus || "pending"}
                    </span>
                    
                    <button
                      disabled={event.paymentStatus === "Pending"}
                      onClick={() => setSelectedEvent(event)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        event.paymentStatus !== "Pending"
                          ? "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {event.paymentStatus !== "Pending" ? "Get Pass" : "Wait..."}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {selectedEvent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <GenerateQR
            event={selectedEvent}
            onBack={() => setSelectedEvent(null)}
          />
        </div>
      )}
    </div>
  );
}