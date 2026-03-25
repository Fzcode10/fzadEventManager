import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

// Added 'event' and 'onBack' as props from the parent
function GenerateQR({ event, onBack }) {
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const ticketRef = useRef();

  // Auto-generate QR when the component mounts using the passed event prop
  useEffect(() => {
    if (event) {
      handleGenerateTicket();
    }
  }, [event]);

  const handleGenerateTicket = async () => {
    setError("");
    try {
      const token = localStorage.getItem("user");
      if (!token) return;

      const cleanToken = token.replace(/"/g, "");
      const eventId = event.id;

      const res = await fetch("/api/visitor/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Added content-type
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to fetch ticket");
        return;
      }

      const blob = await res.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      setQr(base64);
    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        (setError(null), onBack());
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const takeScreenshot = async () => {
    if (!ticketRef.current) return;
    setIsCapturing(true);

    try {
      await new Promise((r) => setTimeout(r, 100));
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // 20 is extremely high and might crash mobile browsers, 3-5 is usually plenty for QR
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Ticket-${event?.title || "Event"}.png`;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      alert("Could not save pass. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    // Updated style: Now works as a fixed overlay (Modal style)
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", position: "relative" }}>
        {error && (
          <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Elegant Icon Container */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  Unable to complete request
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  We’re having trouble processing this right now. Please try
                  again or reach out to our{" "}
                  <span className="font-medium text-slate-700 underline decoration-slate-300 cursor-pointer hover:text-blue-600">
                    support team
                  </span>{" "}
                  for help.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-8 w-full">
                <button
                  onClick={onBack}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-[0.98] shadow-sm"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!qr && !error && (
          <div style={{ color: "white", fontWeight: "bold" }}>
            Generating your digital pass...
          </div>
        )}

        {/* THE TICKET */}
        {qr && (
          <>
            <div
              ref={ticketRef}
              style={{
                width: "320px",
                backgroundColor: "#ffffff",
                overflow: "hidden",
                borderRadius: "0px", // Matches modern style
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#4f46e5",
                  padding: "20px",
                  color: "white",
                }}
              >
                <h3
                  style={{ margin: 0, letterSpacing: "2px", fontSize: "14px" }}
                >
                  OFFICIAL ENTRY PASS
                </h3>
              </div>

              <div style={{ padding: "30px" }}>
                <h2
                  style={{
                    margin: "0 0 5px 0",
                    color: "#1f2937",
                    fontSize: "20px",
                  }}
                >
                  {event.fullName || "Attendee"}
                </h2>
                <p
                  style={{
                    color: "#6366f1",
                    fontWeight: "bold",
                    margin: "0 0 20px 0",
                    fontSize: "14px",
                  }}
                >
                  {event.title}
                </p>

                <div
                  style={{
                    padding: "15px",
                    border: "2px dashed #e5e7eb",
                    borderRadius: "20px",
                    display: "inline-block",
                  }}
                >
                  <img
                    src={qr}
                    alt="QR Code"
                    style={{
                      width: "180px",
                      height: "180px",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "15px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  borderTop: "1px solid #f1f5f9",
                  fontWeight: "600",
                }}
              >
                VALID FOR ONE-TIME ENTRANCE ONLY
              </div>
            </div>

            {/* Buttons Below Ticket */}
            <div
              style={{
                marginTop: "25px",
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={onBack}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Close
              </button>
              <button
                onClick={takeScreenshot}
                disabled={isCapturing}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#0891b2",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 10px 15px -3px rgba(8, 145, 178, 0.3)",
                }}
              >
                {isCapturing ? "Processing..." : "Save to Gallery"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GenerateQR;
