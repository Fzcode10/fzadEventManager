import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, X, AlertTriangle } from "lucide-react";

function GenerateQR({ event, onBack }) {
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const ticketRef = useRef();

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
      const eventId = event.eventId;

      const res = await fetch("/api/visitor/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setError(null);
        onBack();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const takeScreenshot = async () => {
    if (!ticketRef.current) return;
    setIsCapturing(true);

    try {
      // html-to-image uses browser-native SVG foreignObject rendering,
      // so it supports all CSS color formats including oklch.
      // Call toPng twice: first call warms the image cache (needed for
      // base64 QR images), second call captures everything correctly.
      const options = {
        pixelRatio: 3,
        backgroundColor: "#0f172a",
        cacheBust: true,
      };

      // Warm-up pass — caches embedded images (QR code)
      await toPng(ticketRef.current, options);
      // Actual capture — all images are now cached and render properly
      const dataUrl = await toPng(ticketRef.current, options);

      const link = document.createElement("a");
      link.href = dataUrl;
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
    <div className="flex flex-col items-center justify-center animate-slideUp w-full max-w-sm">
        {error && (
          <div className="w-full overflow-hidden rounded-2xl border border-red-900/30 bg-slate-900 p-6 shadow-2xl badge-glow-danger">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-500 border border-red-900/50">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Pass Generation Failed
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {error}. Please try again later or contact support.
                </p>
              </div>
              <div className="mt-8 w-full">
                <button
                  onClick={onBack}
                  className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {!qr && !error && (
          <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-3xl border border-slate-800 w-full shadow-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <div className="text-slate-300 font-bold text-sm tracking-widest uppercase">
              Generating Pass...
            </div>
          </div>
        )}

        {qr && (
          <>
            <div
              ref={ticketRef}
              style={{
                width: "320px",
                backgroundColor: "#0f172a",
                overflow: "hidden",
                borderRadius: "24px",
                border: "1px solid #1e293b",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                position: "relative",
              }}
            >
              {/* Top Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  padding: "24px 20px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: 0, letterSpacing: "3px", fontSize: "12px", fontWeight: "900", textTransform: "uppercase" }}>
                  Digital Entry Pass
                </h3>
              </div>

              {/* Content area */}
              <div style={{ padding: "30px", textAlign: "center", position: "relative" }}>
                {/* User Info */}
                <h2 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "22px", fontWeight: "800" }}>
                  {event.fullName || "Attendee"}
                </h2>
                <p style={{ color: "#06b6d4", fontWeight: "700", margin: "0 0 24px 0", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {event.title}
                </p>

                {/* QR Wrapper */}
                <div style={{ 
                    padding: "16px", 
                    backgroundColor: "#1e293b", 
                    borderRadius: "20px", 
                    display: "inline-block",
                    border: "1px solid #334155",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ backgroundColor: "white", padding: "8px", borderRadius: "12px" }}>
                    <img
                        src={qr}
                        alt="QR Code"
                        style={{
                        width: "180px",
                        height: "180px",
                        display: "block",
                        borderRadius: "8px",
                        }}
                    />
                  </div>
                </div>
                
                {/* Event Id */}
                <div style={{ marginTop: "20px", color: "#64748b", fontSize: "11px", fontWeight: "bold", letterSpacing: "2px" }}>
                    ID: {event.eventId?.slice(-8).toUpperCase() || "TICKET"}
                </div>
              </div>

              {/* Bottom text */}
              <div
                style={{
                  backgroundColor: "#1e293b",
                  padding: "16px",
                  fontSize: "10px",
                  color: "#94a3b8",
                  borderTop: "1px dashed #334155",
                  fontWeight: "800",
                  textAlign: "center",
                  letterSpacing: "1.5px"
                }}
              >
                VALID FOR ONE-TIME ENTRY
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 w-full max-w-[320px]">
              <button
                onClick={onBack}
                className="flex-1 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 font-bold hover:bg-slate-800 transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                <X size={16} /> Close
              </button>
              <button
                onClick={takeScreenshot}
                disabled={isCapturing}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-accent text-white font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                {isCapturing ? "Saving..." : <><Download size={16} /> Save Pass</>}
              </button>
            </div>
          </>
        )}
    </div>
  );
}

export default GenerateQR;
