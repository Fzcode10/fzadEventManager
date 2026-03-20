import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ManageEvent = () => {
  const { id } = useParams();

//   console.log(id);

  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("visitors");
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();
  const [visitors, setVisitor] = useState([]);

  // 🔥 Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("user");

      if(!token){
        Navigate('/');
        return
      }

      const res = await fetch(`/api/event/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    //   console.log(res);

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

  
  // 🔹 Dummy Visitors (replace with API later)
  //   const visitors = [
    //     { id: 1, name: "John Doe", status: "pending" },
    //     { id: 2, name: "Alice", status: "approved" },
    //   ];
    
    const fetchVisitors = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem("user");
            
            if(!token){
                Navigate('/');
                return
            }
            
            const res = await fetch(`/api/event/eventvisitor/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const data = await res.json();
            console.log(data);
            
            if (data.success) {
                setVisitor(data.visitors);
                console.log(data.visitors);
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
  // 🔹 Approve Visitor
  const approveVisitor = (id) => {
    console.log("Approve visitor:", id);
    // call backend later
  };

  // 🔹 Reject Visitor
  const rejectVisitor = (id) => {
    console.log("Reject visitor:", id);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!event) return <p className="p-6">Event not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 🔥 Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
        <p className="text-gray-500">{event.location}</p>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(event.dateOFEvent).toLocaleDateString()}
        </p>
      </div>

      {/* 🔥 Tabs */}
      <div className="flex gap-4 mb-6">
        {["visitors", "invitations", "details"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔥 Tab Content */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">

        {/* 👥 Visitors */}
        {activeTab === "visitors" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Visitors</h2>

            {visitors.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center border-b py-3"
              >
                <span>{v.fullName}</span>

                <div className="flex gap-2">
                  {v.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveVisitor(v.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectVisitor(v.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {v.status === "approved" && (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 📩 Invitations */}
        {activeTab === "invitations" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Send Invitation</h2>

            <button
              onClick={() =>
                console.log("Send invite for event:", event.eventId)
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Generate Invite Link
            </button>
          </div>
        )}

        {/* 📊 Details */}
        {activeTab === "details" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>

            <p><strong>Organizer:</strong> {event.eventOrganizer}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Slots:</strong> {event.slots}</p>
            <p><strong>Status:</strong> {event.status}</p>
            <p className="mt-2 text-gray-500">{event.description}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageEvent;