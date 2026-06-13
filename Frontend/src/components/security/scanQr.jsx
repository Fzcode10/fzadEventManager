import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import VisitorPass from "./VisitorPass";
import { 
  Camera, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

function QRScanner() {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const printRef = useRef(null);

  const [scanResult, setScanResult] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const DEFAULT_AVATAR =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

  // --- Printing Function ---
  const handlePrint = () => {
    if (scanResult?.action === "OUT") {
      alert("Not need to print pass (Due to checkout)");
      return;
    }

    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=450,height=700");
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Visitor Pass</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }

            @page {
                size: A4 portrait;
                margin: 10mm;
            }

            .no-print {
                display: none;
            }
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f5f5;
        }
    </style>
</head>

<body onload="window.print(); window.close();">

    <div class="flex justify-center items-center min-h-screen p-6">

        <div class="w-[420px] bg-white border-2 border-gray-800 rounded-lg shadow-lg overflow-hidden">

            <!-- Header -->
            <div class="bg-blue-900 text-white text-center py-4">
                <h1 class="text-xl font-bold tracking-wide">
                    HASSANI CORPORATION
                </h1>
                <p class="text-sm opacity-90">
                    Visitor Management System
                </p>
            </div>

            <!-- Pass Title -->
            <div class="text-center py-3 border-b">
                <h2 class="text-lg font-bold text-gray-800">
                    VISITOR PASS
                </h2>
            </div>

            <!-- Dynamic Content -->
            <div class="p-5">
                \${content}
            </div>

            <!-- Footer -->
            <div class="border-t px-5 py-4">
                <div class="flex justify-between text-sm text-gray-700">
                    <div>
                        <p class="font-semibold">Authorized By</p>
                        <div class="mt-8 border-t border-gray-400 w-32"></div>
                    </div>

                    <div class="text-right">
                        <p class="font-semibold">Visitor Signature</p>
                        <div class="mt-8 border-t border-gray-400 w-32 ml-auto"></div>
                    </div>
                </div>
            </div>

            <!-- Bottom Strip -->
            <div class="bg-gray-100 text-center text-xs text-gray-600 py-2">
                Please wear this pass visibly at all times while on premises.
            </div>

        </div>

    </div>

</body>
</html>
`);
    printWindow.document.close();
  };

  // --- Auto-Restart Logic ---
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && error) {
      restartScanner();
    }
    return () => clearTimeout(timer);
  }, [countdown, error]);

  // --- Scanner Setup ---
  useEffect(() => {
    if (!videoRef.current || !isScanning) return;
    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => sendToBackend(result.data),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 2,
      },
    );
    scannerRef.current.start().catch(() => setError("Camera access denied or failed."));
    return () => {
      if (scannerRef.current) scannerRef.current.destroy();
    };
  }, [isScanning]);

  const sendToBackend = async (qrData) => {
    try {
      setError(null);
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (e) {
        throw new Error("Invalid QR Format");
      }

      const token = localStorage.getItem("user");
      const res = await fetch("/api/security/checkin/visitor", {
        method: "POST",
        body: JSON.stringify({ registrationId: parsedData.registrationId }),
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");

      setScanResult({
        name: json.visitor.fullName,
        profilePic: json.visitor.photo || DEFAULT_AVATAR,
        eventName: json.visitor.eventName,
        passType: json.visitor.passType || "Guest",
        organization: json.visitor.collegeName,
        entryTime: new Date().toLocaleTimeString(),
        status: json.action === "OUT" ? "Checked Out" : "Verified In",
        action: json.action,
      });

      setEventDetails({
        venue: json.eventData?.venue || "Main Block",
        currentSession: json.eventData?.currentSession || "Active Event",
        sessionTime: json.eventData?.sessionTime || "10:00 - 12:00",
      });

      setIsScanning(false);
      if (scannerRef.current) scannerRef.current.stop();
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
      setCountdown(10);
    }
  };

  const restartScanner = () => {
    setScanResult(null);
    setError(null);
    setCountdown(0);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-100 relative overflow-hidden">
      {/* Glowing mesh background */}
      <div className="absolute top-[10%] left-[-15%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hidden printer component */}
      <VisitorPass
        ref={printRef}
        visitor={scanResult}
        eventDetails={eventDetails}
      />

      <div
        className={`transition-all duration-500 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative ${
          scanResult ? "w-full max-w-4xl" : "w-full max-w-md"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>

        {/* Header */}
        <div
          className={`p-6 border-b text-center relative transition-colors ${
            error ? "border-red-900/40 bg-red-950/20" : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-ping ${error ? "bg-red-500" : "bg-cyan-400"}`} />
            <span className={`px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full border ${
              error ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}>
              {error ? "System Error" : "Live Terminal"}
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
            {error ? "Scan Alert" : "Gate Entry Scanner"}
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {isScanning ? (
            <div className="relative max-w-sm mx-auto">
              {/* Futuristic HUD frame around scanner */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg"></div>
              
              <div className="relative aspect-square rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-2xl opacity-80"
                />
                {/* Laser Scanning Indicator */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-scan-line"></div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                <Camera size={14} className="text-cyan-500" />
                <span>Align Ticket QR Code</span>
              </div>
            </div>
          ) : error ? (
            /* Error Panel */
            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/5">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Verification Failed</h3>
              <p className="text-red-400 font-bold text-xs mt-2 uppercase tracking-wide bg-red-950/20 border border-red-900/30 px-4 py-2 rounded-xl inline-block">
                {error}
              </p>

              <div className="mt-8 max-w-xs mx-auto">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                  Restarting Terminal In {countdown}s
                </p>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={restartScanner}
                  className="mt-6 bg-slate-950 border border-slate-800 hover:border-red-500 hover:text-white text-slate-400 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Restart Scanner Now
                </button>
              </div>
            </div>
          ) : (
            /* Split View Result */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Left Side: Verification Profile */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-5 pb-5 border-b border-slate-800">
                    <img
                      src={scanResult.profilePic}
                      alt="Visitor"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/50 ring-offset-4 ring-offset-slate-900 shrink-0 bg-slate-950"
                    />
                    <div>
                      <h4 className="text-xl font-black text-white tracking-tight leading-tight uppercase">
                        {scanResult.name}
                      </h4>
                      <div className="mt-2 flex items-center gap-1.5">
                        {scanResult.action === "OUT" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 text-[9px] font-black uppercase rounded-full bg-amber-950/40 border border-amber-900/30 text-amber-400">
                            <Clock size={10} /> Checked Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 text-[9px] font-black uppercase rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 badge-glow-success">
                            <CheckCircle size={10} /> Verified In
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-1">
                        Visitor Event
                      </span>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {scanResult.eventName}
                      </p>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-1">
                        Log Timestamp
                      </span>
                      <p className="text-xs font-bold text-slate-200">
                        {scanResult.entryTime}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl sm:col-span-2">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-1">
                        Organization
                      </span>
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {scanResult.organization || "Direct Guest"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={restartScanner}
                  className="w-full py-3.5 bg-slate-950 border border-slate-800 hover:border-violet-500 hover:text-white text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4"
                >
                  Close & Scan Next <ArrowRight size={14} />
                </button>
              </div>

              {/* Right Side: Pass Details & Print */}
              <div className="bg-slate-950/60 rounded-3xl p-6 flex flex-col justify-between border border-slate-800">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-xl">
                  {/* Top glowing card line */}
                  <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-violet-500 to-cyan-500"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
                        Pass Verification
                      </p>
                      <h5 className="text-base font-extrabold text-white mt-1 leading-tight">
                        {scanResult.name}
                      </h5>
                    </div>
                    <span className="bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase">
                      Visitor
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                        Pass Class
                      </span>
                      <p className="text-xs font-black text-slate-200">
                        {scanResult.passType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
                        Pass Serial
                      </span>
                      <p className="text-xs font-mono font-bold text-cyan-400">
                        #VP-{Math.floor(1000 + Math.random() * 9000)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  disabled={scanResult.action === "OUT"}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-xs uppercase tracking-wider mt-6 ${
                    scanResult.action === "OUT"
                      ? "bg-slate-900 border border-slate-850/50 text-slate-600 cursor-not-allowed"
                      : "bg-gradient-accent text-white hover:shadow-violet-500/25 active:scale-95"
                  }`}
                >
                  <Printer size={15} />
                  <span>Print Gate Pass</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-[10px] font-black tracking-[0.25em] uppercase flex items-center gap-1.5 pointer-events-none">
        <Sparkles size={10} className="text-violet-500/60" /> VMS Terminal Alpha-v1.0
      </p>
    </div>
  );
}

export default QRScanner;
