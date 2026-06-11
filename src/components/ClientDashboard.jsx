import React, { useState } from "react";
import { Search, Compass, Calendar, Receipt, MessageCircle, Mail, Video, UserCheck, Shield } from "lucide-react";
import CounselorCard from "./CounselorCard";
import BookingModal from "./BookingModal";
import ChatInterface from "./ChatInterface";
import EmailSimulationView from "./EmailSimulationView";
import VideoCallContainer from "./VideoCallContainer";

export default function ClientDashboard({
  counselors,
  appointments,
  transactions,
  onBookSuccess,
  onSelectCounselorForChat,
  chatModeCounselorId,
}) {
  const [activeTab, setActiveTab] = useState("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");

  // Booking Modal management
  const [bookingCounselor, setBookingCounselor] = useState(null);

  // Active Video Call appointment tracker
  const [activeVideoCallApt, setActiveVideoCallApt] = useState(null);

  // Filter counselors
  const filteredCounselors = counselors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesService = serviceFilter === "All" || c.serviceType === serviceFilter;
    return matchesSearch && matchesService;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse";
      case "completed":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-slate-50 border-slate-200 text-slate-500";
      default:
        return "bg-amber-50 border-amber-200 text-amber-700";
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled appointment? Refund will be auto-triggered to original payment card.")) {
      return;
    }
    try {
      const response = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (response.ok) {
        onBookSuccess(); // refresh parent state
      }
    } catch (err) {
      console.error("Cancel appt error:", err);
    }
  };

  // Determine active contact to display inside general chat tab
  const activeChatCounselor = counselors.find((c) => c.id === chatModeCounselorId) || counselors[0];

  return (
    <div id="client-dashboard-layout" className="flex flex-col gap-6">
      
      {/* Upper Bio card alex */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-bento flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 backdrop-blur-md flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <UserCheck size={30} className="text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Alex Mercer</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono text-[9px] font-bold tracking-wider">
                ● ACTIVE SESSION
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1.5 font-mono">
              Patient Vault ID: <span className="text-indigo-300 font-bold">med_alex_usr</span> • Authorized Secure Login
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-center text-xs z-10 w-full md:w-auto justify-center md:justify-end">
          <div className="bg-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/50 flex-1 md:flex-none min-w-[125px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Sessions Booked</span>
            <span className="text-xl font-bold mt-1 block text-indigo-400">{appointments.length} Sessions</span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/50 flex-1 md:flex-none min-w-[125px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Active Wallet</span>
            <span className="text-xl font-bold mt-1 block text-emerald-400">Visa Debit</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto select-none border border-slate-200/65">
        <button
          id="client-tab-catalog"
          onClick={() => {
            setActiveTab("catalog");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeTab === "catalog"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Compass size={15} />
          <span>Browse Practitioners</span>
        </button>
 
        <button
          id="client-tab-bookings"
          onClick={() => {
            setActiveTab("bookings");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeTab === "bookings"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Calendar size={15} />
          <span>My Sessions & Billing</span>
        </button>
 
        <button
          id="client-tab-chat"
          onClick={() => {
            setActiveTab("chat");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeTab === "chat"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <MessageCircle size={15} />
          <span>Chat Platform</span>
        </button>
 
        <button
          id="client-tab-email"
          onClick={() => {
            setActiveTab("email");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeTab === "email"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Mail size={15} />
          <span>Email Portal</span>
        </button>
      </div>

      {/* ACTIVE VIDEO CALL WORKSPACE */}
      {activeVideoCallApt ? (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-850">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
              <span>You are currently inside an active peer clinical stream with <b>{activeVideoCallApt.counselorName}</b></span>
            </div>
            <button
              onClick={() => setActiveVideoCallApt(null)}
              className="text-white hover:text-indigo-200 text-xs font-semibold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-755 transition-colors"
            >
              Minimize Video
            </button>
          </div>
          <VideoCallContainer
            appointment={activeVideoCallApt}
            counselorAvatar={
              counselors.find(c => c.id === activeVideoCallApt.counselorId)?.avatar || ""
            }
            senderRole="client"
            onEndCall={() => {
              // mark session completed recursively
              fetch(`/api/appointments/${activeVideoCallApt.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed" }),
              }).then(() => {
                onBookSuccess();
                setActiveVideoCallApt(null);
                alert("The secure clinical feed was summarized and saved under historical patient charts.");
              });
            }}
          />
        </div>
      ) : (
        /* STANDARD TAB VIEWS */
        <>
          {activeTab === "catalog" && (
            <div className="flex flex-col gap-6">
              {/* Search and Filters Bar */}
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-bento flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full lg:w-[420px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    id="counselor-search-query"
                    type="text"
                    placeholder="Search cognitive behavioral (CBT), anxiety specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-11 pr-4 py-3 rounded-2xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 bg-slate-50/50 hover:bg-slate-50 transition-all font-sans"
                  />
                </div>
 
                {/* Filters */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-start lg:justify-end overflow-x-auto select-none py-1 scrollbar-none">
                  <span className="text-[11px] text-slate-400 font-bold font-mono tracking-wider mr-2 uppercase hidden xl:inline">Filter Specialties:</span>
                  {["All", "Mental Health", "Relationship Advice", "Career Counseling"].map((f) => (
                    <button
                      key={f}
                      id={`filter-btn-${f.toLowerCase().replace(" ", "-")}`}
                      onClick={() => setServiceFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                        serviceFilter === f
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-semibold"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCounselors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-slate-400 font-medium font-sans">
                  <Compass className="mx-auto mb-2 text-slate-350" size={32} />
                  <span>No counselors matching your search criteria. Try removing terms or filtering by all practices.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                  {filteredCounselors.map((c) => (
                    <CounselorCard
                      key={c.id}
                      counselor={c}
                      onBook={(couns) => setBookingCounselor(couns)}
                      onMessage={(couns) => {
                        onSelectCounselorForChat(couns.id);
                        setActiveTab("chat");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
              
              {/* Left Column: Sessions List */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-white border border-slate-205 p-6 rounded-3xl shadow-bento">
                  <h3 className="text-lg font-bold font-display text-slate-1000 mb-5 flex items-center gap-2.5">
                    <Calendar size={18} className="text-indigo-650" />
                    <span>My Consultation History</span>
                  </h3>
 
                  {appointments.length === 0 ? (
                    <div className="p-12 text-center text-slate-405 text-xs font-semibold">
                      No session times registered. Visit our catalog panel to choose a therapist.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 font-sans">
                      {appointments.map((a) => (
                        <div
                          key={a.id}
                          className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-650 rounded-2xl shrink-0">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900 font-display">{a.counselorName}</h4>
                                <span className={`text-[9px] font-bold uppercase tracking-widest font-mono border px-2.5 py-0.5 rounded-lg ${getStatusBadge(a.status)}`}>
                                  {a.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium mt-1">
                                {a.serviceType} Consultation • <b className="text-slate-855 font-mono text-[11px]">{a.date}</b> at <b className="text-slate-855 font-mono text-[11px]">{a.time}</b>
                              </p>
                              {a.notes && (
                                <div className="mt-2.5 px-3 py-2 bg-stone-100/60 rounded-xl border border-stone-150 text-[11px] text-slate-655 leading-relaxed font-mono max-w-lg">
                                  <b>Intake brief:</b> "{a.notes}"
                                </div>
                              )}
                            </div>
                          </div>
 
                          {/* Action area */}
                          <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center">
                            {a.status === "upcoming" && (
                              <>
                                <button
                                  id={`join-vid-${a.id}`}
                                  onClick={() => setActiveVideoCallApt(a)}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                                >
                                  <Video size={13} />
                                  <span>Join Secured Video</span>
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(a.id)}
                                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-650 text-slate-600 border border-slate-205 hover:border-rose-100 text-xs font-bold transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
 
                            {a.status === "completed" && (
                              <button
                                onClick={() => {
                                  onSelectCounselorForChat(a.counselorId);
                                  setActiveTab("chat");
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-755 hover:text-slate-900 text-xs font-bold border border-slate-205 transition-all"
                              >
                                <span>Message Provider</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
 
              {/* Right Column: Receipts */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-bento text-white relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <h3 className="text-base font-bold font-display text-white mb-5 flex items-center gap-2.5">
                    <Receipt size={18} className="text-indigo-400" />
                    <span>Invoices & Billing</span>
                  </h3>
 
                  <div className="flex flex-col gap-3.5 relative z-10 font-sans">
                    {transactions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4">No invoices logged.</p>
                    ) : (
                      transactions.map((t) => (
                        <div key={t.id} className="p-4 bg-slate-900 border border-slate-801 rounded-2xl text-xs flex flex-col gap-2 shadow-inner">
                          <div className="flex justify-between font-bold text-slate-100">
                            <span className="font-mono text-slate-400">Statement #{t.id}</span>
                            <span className="font-mono text-emerald-450">₹{t.amount}.00</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>Date: {t.createdAt.split("T")[0]}</span>
                            <span>Card: •••• {t.cardLast4}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Shield size={11} className="text-emerald-500" /> Secure Settlement
                            </span>
                            <span className="font-bold text-emerald-400 tracking-wider">PAID</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
 
                  {/* Total spent placeholder widget matching quick stats in Bento style */}
                  <div className="mt-6 pt-5 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">BENTO CO-PAY PROTECT</span>
                      <p className="text-sm font-bold text-indigo-300 mt-1">Automatic co-pay enabled</p>
                    </div>
                    <div className="w-10 h-6 bg-slate-800 border border-slate-705 rounded flex items-center justify-center gap-0.5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-405" />
                    </div>
                  </div>
                </div>
              </div>
 
            </div>
          )}

          {activeTab === "chat" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
              {/* Small sidebar select inside chat */}
              <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Practice Channels</h4>
                {counselors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCounselorForChat(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                      c.id === chatModeCounselorId
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-101"
                        : "bg-transparent text-slate-605 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate">{c.name.split(",")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Chat frame */}
              <div className="md:col-span-3">
                <ChatInterface
                  counselorId={chatModeCounselorId}
                  counselorName={activeChatCounselor.name}
                  counselorAvatar={activeChatCounselor.avatar}
                  senderRole="client"
                />
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <EmailSimulationView
              counselorId={chatModeCounselorId}
              counselorName={activeChatCounselor.name}
              counselorEmail={`${chatModeCounselorId}@counselsync.health`}
              senderRole="client"
              counselors={counselors}
            />
          )}
        </>
      )}

      {/* Booking Modal Overlay */}
      {bookingCounselor && (
        <BookingModal
          counselor={bookingCounselor}
          onClose={() => setBookingCounselor(null)}
          onSuccess={() => {
            onBookSuccess(); // refresh parent feeds
          }}
        />
      )}
    </div>
  );
}
