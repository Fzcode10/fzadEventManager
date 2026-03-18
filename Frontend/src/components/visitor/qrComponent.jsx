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
      const eventId = event._id || event.id;

      const res = await fetch("/api/visitor/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Added content-type
          Authorization: `Bearer ${cleanToken}`
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
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      zIndex: 50, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Dimmed background
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      
      <div style={{ textAlign: "center", position: "relative" }}>
        
        {/* Error State */}
        {error && (
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "15px", marginBottom: "10px", color: "red" }}>
                {error}
                <button onClick={onBack} style={{ display: "block", margin: "10px auto", cursor: "pointer" }}>Go Back</button>
            </div>
        )}

        {/* Loading State */}
        {!qr && !error && (
          <div style={{ color: "white", fontWeight: "bold" }}>Generating your digital pass...</div>
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
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" 
              }}
            >
              <div style={{ backgroundColor: "#4f46e5", padding: "20px", color: "white" }}>
                <h3 style={{ margin: 0, letterSpacing: "2px", fontSize: "14px" }}>OFFICIAL ENTRY PASS</h3>
              </div>
              
              <div style={{ padding: "30px" }}>
                <h2 style={{ margin: "0 0 5px 0", color: "#1f2937", fontSize: "20px" }}>{event.fullName || "Attendee"}</h2>
                <p style={{ color: "#6366f1", fontWeight: "bold", margin: "0 0 20px 0", fontSize: "14px" }}>{event.title}</p>
                
                <div style={{ padding: "15px", border: "2px dashed #e5e7eb", borderRadius: "20px", display: "inline-block" }}>
                  <img src={qr} alt="QR Code" style={{ width: "180px", height: "180px", display: "block" }} />
                </div>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "15px", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", fontWeight: "600" }}>
                VALID FOR ONE-TIME ENTRANCE ONLY
              </div>
            </div>

            {/* Buttons Below Ticket */}
            <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "center" }}>
              <button 
                onClick={onBack} 
                style={{ padding: "12px 24px", borderRadius: "12px", border: "none", backgroundColor: "white", color: "#374151", cursor: "pointer", fontWeight: "bold" }}
              >
                Close
              </button>
              <button 
                onClick={takeScreenshot} 
                disabled={isCapturing}
                style={{ padding: "12px 24px", backgroundColor: "#0891b2", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(8, 145, 178, 0.3)" }}
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