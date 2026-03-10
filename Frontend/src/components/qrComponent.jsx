import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

function GenerateQR() {
  const [email, setEmail] = useState("");
  const [eventName, setEventName] = useState("");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const ticketRef = useRef();

  const generateQR = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/visitor/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventName }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error);
        return;
      }

      const blob = await res.blob();
      // Convert to Base64 so the "screenshot" can see the image data immediately
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      setName("Student Name");
      setQr(base64);
    } catch (err) {
      setError("Server error");
    }
  };

  // ✅ The Screenshot Function
  const takeScreenshot = async () => {
    if (!ticketRef.current) return;
    setIsCapturing(true);

    try {
      // We give the browser a tiny moment to ensure the ticket is rendered
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 20, // High quality screenshot
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Ticket-${eventName}.png`;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
      alert("Could not take screenshot. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", fontFamily: "sans-serif" }}>
      
      {!qr ? (
        <div style={{ 
          backgroundColor: "#ffffff", 
          padding: "40px", 
          borderRadius: "24px", 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", 
          width: "100%",
          maxWidth: "380px",
          border: "1px solid #ffffff"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ background: "#4f46e5", width: "50px", height: "50px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px auto" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0" }}>Event Portal</h2>
            <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "14px" }}>Get your digital entry pass</p>
          </div>

          <form onSubmit={generateQR}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "5px" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="name@college.edu" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "10px", boxSizing: "border-box", fontSize: "15px" }}
              />
            </div>
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "5px" }}>Event Name</label>
              <input 
                type="text" 
                placeholder="Tech Expo 2026" 
                required 
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "10px", boxSizing: "border-box", fontSize: "15px" }}
              />
            </div>
            <button style={{ width: "100%", padding: "14px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", transition: "0.2s" }}>
              Generate Ticket
            </button>
          </form>
          {error && <div style={{ color: "#ef4444", textAlign: "center", marginTop: "15px", fontSize: "14px" }}>{error}</div>}
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          
          {/* THE TICKET (The part that will be screenshotted) */}
          <div 
            ref={ticketRef} 
            style={{ width: "320px", backgroundColor: "#ffffff", overflow: "hidden", border: "1px solid #ddd", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <div style={{ backgroundColor: "#4f46e5", padding: "20px", color: "white" }}>
              <h3 style={{ margin: 0 }}>OFFICIAL PASS</h3>
            </div>
            <div style={{ padding: "30px" }}>
              <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{name}</h2>
              <p style={{ color: "#666", marginBottom: "20px" }}>{eventName}</p>
              
              <div style={{ padding: "15px", border: "1px dashed #4f46e5", borderRadius: "12px", display: "inline-block" }}>
                <img src={qr} alt="QR" style={{ width: "150px", height: "150px", display: "block" }} />
              </div>
            </div>
            <div style={{ backgroundColor: "#f9f9f9", padding: "10px", fontSize: "12px", color: "#999", borderTop: "1px solid #eee" }}>
              Scan at Entrance
            </div>
          </div>

          {/* Screenshot Button */}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => setQr("")} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}>
              Back
            </button>
            <button 
              onClick={takeScreenshot} 
              disabled={isCapturing}
              style={{ padding: "10px 20px", backgroundColor: "#0891b2", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              {isCapturing ? "Saving... Pass" : "Save Pass"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default GenerateQR;