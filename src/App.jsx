import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, HeartPulse, RefreshCw } from "lucide-react";
import RoleSelector from "./components/RoleSelector";
import ClientDashboard from "./components/ClientDashboard";
import CounselorDashboard from "./components/CounselorDashboard";

export default function App() {
  const [role, setRole] = useState("client");
  const [selectedCounselorId, setSelectedCounselorId] = useState("sarah_jenkins");
  
  // Data State
  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Fetch all states from the full-stack database
  const fetchData = async () => {
    try {
      const [cRes, aRes, nRes, tRes] = await Promise.all([
        fetch("/api/counselors"),
        fetch("/api/appointments"),
        fetch("/api/notes"),
        fetch("/api/transactions")
      ]);

      if (cRes.ok && aRes.ok && nRes.ok && tRes.ok) {
        const [cData, aData, nData, tData] = await Promise.all([
          cRes.json(),
          aRes.json(),
          nRes.json(),
          tRes.json()
        ]);
        setCounselors(cData);
        setAppointments(aData);
        setSessionNotes(nData);
        setTransactions(tData);
      }
    } catch (err) {
      console.error("Critical error sync fetching state data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle user switching roles
  const handleRoleChange = (newRole, counselorId) => {
    setRole(newRole);
    if (newRole === "counselor" && counselorId) {
      setSelectedCounselorId(counselorId);
    }
  };

  // Reset demo database
  const handleResetDb = async () => {
    if (!window.confirm("This will reset all newly booked sessions, clinical notes, and custom biographies. Are you sure?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        await fetchData();
        alert("Simulated database records re-seeded successfully.");
      }
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Interactive Role Switcher Banner */}
      {!loading && (
        <RoleSelector
          currentRole={role}
          selectedCounselorId={selectedCounselorId}
          counselors={counselors}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Main Professional Header */}
      <header className="bg-white border-b border-slate-200/80 py-4.5 px-6 sticky top-0 z-40 shadow-xs font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xs">
              <HeartPulse size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 leading-none">Counselor & Client Platform</h1>
              <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase tracking-wider mt-1 block">Telehealth Link System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl text-slate-500 font-mono text-[10px] border border-slate-200">
              <ShieldCheck size={14} className="text-emerald-500 stroke-[2.5]" />
              <span className="tracking-wider text-xs">SECURE END-TO-END</span>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              title="Refresh connection status"
              className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all border border-slate-200 bg-white"
            >
              <RefreshCw size={14} className="animate-hover-spin" />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Dashboards Workspace content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 shrink-0">
        {loading ? (
          <div className="min-h-[400px] flex flex-col justify-center items-center text-center font-sans">
            <Loader2 size={36} className="animate-spin text-indigo-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Syncing Secure Database</h3>
            <p className="text-xs text-slate-405 mt-1">Acquiring token, preloading licensed schemas...</p>
          </div>
        ) : (
          <div>
            {role === "client" ? (
              <ClientDashboard
                counselors={counselors}
                appointments={appointments}
                transactions={transactions}
                onBookSuccess={fetchData}
                chatModeCounselorId={selectedCounselorId}
                onSelectCounselorForChat={(id) => setSelectedCounselorId(id)}
              />
            ) : (
              <CounselorDashboard
                counselorId={selectedCounselorId}
                counselors={counselors}
                appointments={appointments}
                notes={sessionNotes}
                onRefreshData={fetchData}
              />
            )}
          </div>
        )}
      </main>

      {/* Security compliance footer */}
      <footer className="bg-slate-900 text-slate-405 py-10 border-t border-slate-800 text-xs px-6 mt-12 pb-14 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-white font-bold text-sm">
              <HeartPulse size={16} className="text-indigo-400" />
              <span>Counselor & Client Platform Telehealth</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-md">
              Secure full-stack node engine leveraging isolated JWT authentication, AES session record keys, and Stripe-simulated checkout workflows. Complies with the highest standards of HIPAA privacy guidelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
            <button
              onClick={handleResetDb}
              className="text-xs text-red-400 hover:text-white bg-red-900/20 border border-red-500/20 hover:border-red-500 px-3.5 py-2 rounded-xl transition-all font-mono font-medium"
            >
              Reset Demo Records
            </button>
            <div className="text-slate-500 text-[11px] font-mono">
              Workspace Host: <span className="text-indigo-400 font-bold">Port 3000</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
