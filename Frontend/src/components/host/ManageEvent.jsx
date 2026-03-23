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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [sendEmailLoader, setEmailSendingLoader] = useState(false);

  // 🔥 Fetch event details
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

      const res = await fetch(`/api/host/sendinvite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  // 🔹 Dummy Visitors (replace with API later)
  //   const visitors = [
  //     { id: 1, name: "John Doe", status: "pending" },
  //     { id: 2, name: "Alice", status: "approved" },
  //   ];

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

  useEffect(() => {
    if (sendEmailLoader) {
      const timer = setTimeout(() => {
        setEmailSendingLoader(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [sendEmailLoader]);

  if (!event) return <p className="p-6">Event not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg">
            <p className="text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}

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

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      University/College
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Dept.
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Year
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {visitors.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                        {v.fullName}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{v.email}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {v.phone}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {v.collegeName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-600 uppercase">
                        {v.department}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {v.year}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {v.paymentStatus === "pending" && (
                            <>
                              <button
                                onClick={() => approveVisitor(v.id)}
                                className="inline-block rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectVisitor(v.id)}
                                className="inline-block rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {v.paymentStatus === "Free" && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">
                              {/* Success Check Icon */}
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Approved
                            </div>
                          )}

                          {v.status === "approved" && (
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-green-700">
                              <p className="whitespace-nowrap text-xs font-semibold">
                                Approved
                              </p>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📩 Invitations */}
        {activeTab === "invitations" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Send Invitation</h2>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full mb-3"
            />

            <button
              onClick={() => sendEmail(event.title, email)}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              {sendEmailLoader ? "Sending..." : "Send Invitation"}
            </button>

            {/* ✅ Success Message */}
            {success && <p className="text-green-600 mt-3">{success}</p>}

            {/* ❌ Error Message */}
            {error && <p className="text-red-600 mt-3">{error}</p>}
          </div>
        )}
        {/* 📊 Details */}
        {activeTab === "details" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>

            <p className=" text-black-500">
              <strong>Title : </strong>
              {event.title}
            </p>
            <p>
              <strong>Category : </strong> {event.category}
            </p>
            <p>
              <strong>Organizer : </strong> {event.eventOrganizer}
            </p>
            <p>
              <strong>Slots:</strong> {event.slots}
            </p>
            <p>
              <strong>Status:</strong> {event.status}
            </p>
            <p className="mt-2 text-gray-500">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvent;
