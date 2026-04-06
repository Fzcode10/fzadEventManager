import React, { useState } from "react";
import {
  Users,
  Settings,
  BarChart3,
  Calendar,
  ShieldAlert,
  LogOut,
  UserPlus,
  Activity,
} from "lucide-react"; // Using lucide-react for icons

const AdminDashBoard = () => {
  const [activeTab, setActiveTab] = useState("events");

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

  const renderEventsTab = () => (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-bold mb-4">Live Visitor Events</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Visitor</th>
              <th className="p-4 font-semibold">Host</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-4">John Doe</td>
              <td className="p-4">Anitgravity Team</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Checked In
                </span>
              </td>
              <td className="p-4 text-blue-600 cursor-pointer">View Pass</td>
            </tr>
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
        <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
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
          VMS ADMIN
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
            <p className="text-gray-500 text-sm">Welcome back, Super Admin</p>
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
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          {activeTab === "events" && renderEventsTab()}
          {activeTab === "system" && renderSystemTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "users" && renderUsersTab()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashBoard;
