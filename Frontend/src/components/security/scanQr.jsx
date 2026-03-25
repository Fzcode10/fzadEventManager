import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import VisitorPass from "./VisitorPass";

function QRScanner() {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const printRef = useRef(null);

  const [scanResult, setScanResult] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

  // --- Printing Function ---
  const handlePrint = () => {
    if (scanResult?.action === "OUT") {
      alert("Not need to print pass (Due to checkout)");
      return;
    }

    const content = printRef.current.innerHTML;
    // Window sized for a vertical card
    const printWindow = window.open("", "_blank", "width=450,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor Pass</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: auto; margin: 0mm; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="flex justify-center items-start">
            ${content}
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
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
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
      { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 2 }
    );
    scannerRef.current.start().catch(() => setError("Camera failed."));
    return () => { if (scannerRef.current) scannerRef.current.destroy(); };
  }, [isScanning]);

  const sendToBackend = async (qrData) => {
    try {
      setError(null);
      let parsedData;
      try { parsedData = JSON.parse(qrData); } catch (e) { throw new Error("Invalid QR Format"); }

      const res = await fetch("/api/security/checkin/visitor", {
        method: "POST",
        body: JSON.stringify({ registrationId: parsedData.registrationId }),
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");

      setScanResult({
        name: json.visitor.fullName,
        profilePic: json.visitor.photo || DEFAULT_AVATAR,
        eventName: json.visitor.eventName,
        passType: json.visitor.passType || "Guest",
        organization:json.visitor.collegeName,
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      {/* Hidden printer component */}
      <VisitorPass ref={printRef} visitor={scanResult} eventDetails={eventDetails} />

      <div className={`transition-all duration-500 bg-white rounded-3xl shadow-2xl overflow-hidden ${
        scanResult ? "w-full max-w-5xl" : "w-full max-w-md"
      }`}>
        
        {/* Header */}
        <div className={`p-5 text-white text-center transition-colors ${error ? 'bg-red-600' : 'bg-indigo-600'}`}>
          <h2 className="text-xl font-black uppercase tracking-widest">
            {error ? "Scan Error" : "Entry Terminal"}
          </h2>
        </div>

        <div className="p-8">
          {isScanning ? (
            <div className="relative">
              <video ref={videoRef} className="w-full aspect-square object-cover rounded-2xl border-4 border-gray-100 shadow-sm" />
              <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-scan-line"></div>
              </div>
              <p className="text-center mt-4 text-gray-400 text-sm animate-pulse">Waiting for QR Code...</p>
            </div>
          ) : error ? (
            /* Error View */
            <div className="text-center py-10 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold">Invalid Scan</h3>
              <p className="text-red-500 font-medium mt-2">{error}</p>
              
              <div className="mt-10 max-w-xs mx-auto">
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Restarting in {countdown}s</p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${(countdown / 10) * 100}%` }}></div>
                </div>
                <button onClick={restartScanner} className="mt-6 text-indigo-600 font-bold text-sm hover:underline">Restart Now</button>
              </div>
            </div>
          ) : (
            /* Split View Result */
            <div className="flex flex-col md:flex-row gap-12 animate-in fade-in slide-in-from-bottom-6">
              
              {/* Left Side: System Details */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-6">
                  <img src={scanResult.profilePic} alt="Visitor" className="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-50" />
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight">{scanResult.name}</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                      scanResult.action === "OUT" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                    }`}>
                      {scanResult.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Event</p>
                    <p className="text-sm font-bold truncate">{scanResult.eventName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Time</p>
                    <p className="text-sm font-bold">{scanResult.entryTime}</p>
                  </div>
                </div>

                <button onClick={restartScanner} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
                  Done & Continue
                </button>
              </div>

              {/* Right Side: Printable Pass */}
              <div className="flex-1 bg-indigo-50 rounded-3xl p-8 flex flex-col justify-between border-2 border-dashed border-indigo-200">
                <div className="bg-white p-6 rounded-2xl shadow-xl relative overflow-hidden border-t-8 border-indigo-600">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Visitor Pass</p>
                      <h5 className="text-lg font-bold text-gray-800 leading-tight">{scanResult.name}</h5>
                    </div>
                    <div className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold">2026</div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Category</p>
                      <p className="text-sm font-black text-gray-700">{scanResult.passType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Pass ID</p>
                      <p className="text-sm font-mono font-bold">#VP-{Math.floor(1000 + Math.random() * 9000)}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePrint}
                  className={`mt-8 w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all ${
                    scanResult.action === "OUT" 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-600 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print Pass
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
      <p className="mt-6 text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">VMS Terminal Alpha-v1.0</p>
    </div>
  );
}

export default QRScanner;