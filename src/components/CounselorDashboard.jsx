import React, { useState, useEffect } from "react";
import { Calendar, User, Shield, Plus, FileSpreadsheet, Clock, CheckCircle, Save, Loader2, MessageCircle, Mail, Paperclip } from "lucide-react";
import ChatInterface from "./ChatInterface";
import EmailSimulationView from "./EmailSimulationView";
import VideoCallContainer from "./VideoCallContainer";

export default function CounselorDashboard({
  counselorId,
  counselors,
  appointments,
  notes,
  onRefreshData,
}) {
  // Current active counselor profile
  const counselor = counselors.find((c) => c.id === counselorId) || counselors[0];

  const [activeSubTab, setActiveSubTab] = useState("appointments");

  // Form Fields for Availability Customization
  const [hourlyPrice, setHourlyPrice] = useState(counselor?.price || 120);
  const [slotInputs, setSlotInputs] = useState(counselor?.availability || []);

  // Form Fields for Profile Edit
  const [bioEdit, setBioEdit] = useState(counselor?.bio || "");
  const [roleTitle, setRoleTitle] = useState(counselor?.role || "");

  // Form Fields for New Clinical Note
  const [noteAptId, setNoteAptId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteAttachments, setNoteAttachments] = useState([]);
  const [attUploading, setAttUploading] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);

  // Counselor specific appointments
  const myAppointments = appointments.filter((a) => a.counselorId === counselorId);

  // Counselor specific notes
  const myNotes = notes.filter((n) => n.counselorId === counselorId);

  // Active Video Call tracker
  const [activeVideoCallApt, setActiveVideoCallApt] = useState(null);

  // Sync edits when counselor switches
  useEffect(() => {
    if (counselor) {
      setHourlyPrice(counselor.price);
      setSlotInputs(counselor.availability);
      setBioEdit(counselor.bio);
      setRoleTitle(counselor.role);
    }
    setActiveVideoCallApt(null);
  }, [counselorId]);

  // Handle Save Profile Specialties & Pricing
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const response = await fetch(`/api/counselors/${counselorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(hourlyPrice),
          availability: slotInputs,
          bio: bioEdit,
          role: roleTitle,
        }),
      });

      if (response.ok) {
        onRefreshData();
        alert("Practitioner security records and portal filters have been refreshed.");
      }
    } catch (err) {
      console.error("Failed to update therapist credentials:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Add Clinical note
  const handleSubmitClinicalNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert("Please provide text clinical summary first.");
      return;
    }

    const selectedApt = appointments.find((a) => a.id === noteAptId);

    const payload = {
      appointmentId: noteAptId || "independent_session",
      clientId: "default_client",
      clientName: selectedApt ? selectedApt.clientName : "Alex Mercer",
      counselorId,
      counselorName: counselor.name,
      notes: noteText,
      attachments: noteAttachments,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNoteText("");
        setNoteAptId("");
        setNoteAttachments([]);
        onRefreshData();
        alert("Session Note securely filed inside HIPAA database vault.");
      }
    } catch (err) {
      console.error("Clinical note submission error:", err);
    }
  };

  // Mock note attachment upload
  const handleNoteAttachment = async () => {
    setAttUploading(true);
    try {
      const res = await fetch("/api/upload-file", { method: "POST" });
      if (res.ok) {
        const fileMeta = await res.json();
        setNoteAttachments((prev) => [...prev, fileMeta]);
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setAttUploading(false);
    }
  };

  const toggleSlotCheckbox = (slot) => {
    if (slotInputs.includes(slot)) {
      setSlotInputs(slotInputs.filter((s) => s !== slot));
    } else {
      setSlotInputs([...slotInputs, slot]);
    }
  };

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

  return (
    <div id="counselor-dashboard-layout" className="flex flex-col gap-6">
      
      {/* Upper Bio Card of Counselor */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-bento flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row z-10">
          <img
            src={counselor?.avatar}
            alt={counselor?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">{counselor?.name}</h2>
              <span className="text-[10px] bg-indigo-500/25 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded-lg border border-indigo-500/30 uppercase tracking-wider">
                {counselor?.serviceType || "Active Specialist"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1.5 font-mono">{counselor?.role}</p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono flex items-center justify-center md:justify-start gap-1">
              <Shield size={12} className="text-emerald-500" />
              <span>臨床 Vault Credentials Access Key Active</span>
            </p>
          </div>
        </div>
 
        {/* Rating detail card */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono z-10 w-full md:w-auto">
          <div className="bg-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/50 text-center min-w-[125px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hourly Rate</span>
            <span className="text-emerald-400 text-lg font-bold mt-1 block">₹{counselor?.price}.00/hr</span>
          </div>
          <div className="bg-slate-805/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-705/50 text-center min-w-[125px]">
            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Assigned Caps</span>
            <span className="text-indigo-400 text-lg font-bold mt-1 block">{myAppointments.length} Cases</span>
          </div>
        </div>
      </div>

      {/* Counselor sub tab bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto select-none border border-slate-200/65">
        <button
          onClick={() => {
            setActiveSubTab("appointments");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "appointments"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Calendar size={15} />
          <span>Appt Queue & Notes</span>
        </button>
 
        <button
          onClick={() => {
            setActiveSubTab("records");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "records"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-805 hover:bg-white/40"
          }`}
        >
          <Plus size={15} />
          <span>Clinical Records Vault</span>
        </button>
 
        <button
          onClick={() => {
            setActiveSubTab("availability");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "availability"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Clock size={15} />
          <span>Edit Calendar Slots</span>
        </button>
 
        <button
          onClick={() => {
            setActiveSubTab("profile");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "profile"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <User size={15} />
          <span>Edit Profile</span>
        </button>
 
        <button
          onClick={() => {
            setActiveSubTab("chat");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "chat"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <MessageCircle size={15} />
          <span>Chat Console</span>
        </button>
 
        <button
          onClick={() => {
            setActiveSubTab("email");
            setActiveVideoCallApt(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeSubTab === "email"
              ? "bg-white text-indigo-600 shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
          }`}
        >
          <Mail size={15} />
          <span>Email Desk</span>
        </button>
      </div>

      {/* ACTIVE VIDEO SESSION FOR COUNSELOR */}
      {activeVideoCallApt ? (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl flex items-center justify-between text-xs font-sans">
            <span>You are presiding in an active secure conference feed with patient <b>{activeVideoCallApt.clientName}</b></span>
            <button
              onClick={() => setActiveVideoCallApt(null)}
              className="px-3 py-1.5 bg-slate-850 rounded font-semibold text-white border border-slate-700"
            >
              Minimize Session View
            </button>
          </div>
          <VideoCallContainer
            appointment={activeVideoCallApt}
            counselorAvatar={counselor?.avatar || ""}
            senderRole="counselor"
            onEndCall={() => {
              // Complete session recursively
              fetch(`/api/appointments/${activeVideoCallApt.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed" }),
              }).then(() => {
                onRefreshData();
                setActiveVideoCallApt(null);
                alert("Security video call is completed. Please write clinical notes now.");
              });
            }}
          />
        </div>
      ) : (
        /* STANDARD SECTION BOXES */
        <>
          {activeSubTab === "appointments" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
              
              {/* Left Side: Upcoming Appointments */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col gap-4 font-sans">
                <h3 className="text-base font-bold text-slate-1000 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Calendar size={18} className="text-indigo-600" />
                  <span>Interactive Appointments Queue ({myAppointments.length})</span>
                </h3>

                {myAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No appointments scheduled to this practitioner.</p>
                ) : (
                  <div className="flex flex-col gap-3 font-sans">
                    {myAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-3 justify-between"
                      >
                        <div className="flex items-start justify-between font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-950">{apt.clientName}</span>
                              <span className={`text-[10px] font-mono font-bold uppercase py-0.5 px-2 rounded-full border ${getStatusBadge(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-505 font-medium mt-1">
                              {apt.serviceType} Consultation • <b>{apt.date}</b> at <b>{apt.time}</b>
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-650 bg-slate-200/80 px-2.5 py-1 rounded-md">
                            ₹{apt.price}.00
                          </span>
                        </div>

                        {apt.notes && (
                          <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-[11px] text-slate-600 font-sans">
                            <b>Intake Note:</b> "{apt.notes}"
                          </div>
                        )}

                        {apt.status === "upcoming" && (
                          <div className="flex gap-2 font-sans">
                            <button
                              id={`counselor-join-vid-${apt.id}`}
                              onClick={() => setActiveVideoCallApt(apt)}
                              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-3xs"
                            >
                              <Shield size={12} />
                              <span>Preside Secure Video</span>
                            </button>
                            <button
                              onClick={() => {
                                fetch(`/api/appointments/${apt.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "cancelled" }),
                                }).then(() => onRefreshData());
                              }}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Log Clinical Note Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs font-sans">
                <h3 className="text-base font-bold text-slate-955 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Plus size={18} className="text-indigo-600" />
                  <span>Secure Clinical Notes Submission</span>
                </h3>

                <form onSubmit={handleSubmitClinicalNote} className="flex flex-col gap-4 font-sans">
                  {/* Bind Appointment selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Assign to Consultation Slot
                    </label>
                    <select
                      value={noteAptId}
                      onChange={(e) => setNoteAptId(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-202 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/55"
                    >
                      <option value="">Select Appointment session...</option>
                      {myAppointments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.clientName} - {a.serviceType} ({a.date} {a.time})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes text area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Clinical Notes & Professional Formulation
                    </label>
                    <textarea
                      placeholder="Write psychiatric formulation, therapeutic progressions, specific intervention exercises, or future action plans..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={5}
                      required
                      className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs leading-relaxed resize-none bg-stone-50/50"
                    />
                  </div>

                  {/* Attachment indicator block */}
                  {noteAttachments.length > 0 && (
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col gap-1 font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Filed PDFs:</span>
                      {noteAttachments.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs text-indigo-700 font-semibold">
                          <span>• {f.name} ({f.size})</span>
                          <span className="text-emerald-600 text-[10px]">✔ Stored</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleNoteAttachment}
                      disabled={attUploading}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {attUploading ? <Loader2 className="animate-spin" size={13} /> : <Paperclip size={13} />}
                      <span>Attach Clinical PDF Sheet</span>
                    </button>

                    <button
                      id="counselor-file-note-btn"
                      type="submit"
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Save size={14} />
                      <span>File Encrypted Note</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {activeSubTab === "records" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-6 font-sans">
              <h3 className="text-base font-bold text-slate-1000 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileSpreadsheet size={18} className="text-indigo-600" />
                <span>Patient Health Records Vault (Confidential)</span>
              </h3>

              {myNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No session historical clinical notes recorded under your license.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {myNotes.map((note) => (
                    <div key={note.id} className="p-5 bg-stone-50/50 border border-stone-200 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{note.clientName}</span>
                          <span className="text-[10px] text-slate-405 block mt-0.5">Note ID: {note.id} • Session: {note.appointmentId}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono font-sans">Date Filed: {note.date}</span>
                      </div>

                      <p className="text-xs font-mono text-stone-701 leading-relaxed whitespace-pre-wrap">
                        {note.notes}
                      </p>

                      {/* Notes Attachments */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {note.attachments.map((file, i) => (
                            <a
                              key={i}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Downloading simulated PDF: ${file.name}`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-indigo-700 text-[10px] font-mono font-semibold rounded-lg hover:border-indigo-500 transition-all cursor-pointer"
                            >
                              <Paperclip size={12} />
                              <span>{file.name} ({file.size})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "availability" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs font-sans">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3 mb-6 font-display">
                <Clock size={18} className="text-indigo-600" />
                <span>Practitioner Schedule & Billing Rate Customizer</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
                
                {/* Billing Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Hourly Rate per Session Consultation
                  </label>
                  <div className="relative w-44">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={hourlyPrice}
                      onChange={(e) => setHourlyPrice(Number(e.target.value))}
                      className="w-full text-sm font-bold pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 font-mono"
                    />
                  </div>
                </div>

                {/* Calendar availability checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Open Available Slots 
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">Checkbox options indicate which hourly slots patients can book:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map((slot) => {
                      const active = slotInputs.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlotCheckbox(slot)}
                          className={`p-3 rounded-xl border transition-all text-xs font-mono font-bold flex items-center justify-between ${
                            active
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-3xs"
                              : "bg-slate-50 border-slate-205 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <span>{slot}</span>
                          <span className={`w-3.5 h-3.5 rounded-sm border ${
                            active ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                          } flex items-center justify-center text-[8px]`}>✔</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit settings change */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Updating security file...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Save Changes & Refresh Calendar</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeSubTab === "profile" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs font-sans">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                <User size={18} className="text-indigo-600" />
                <span>Edit Professional Profile Details</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Professional Title Credentials
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-205 outline-none"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Therapeutic Biography & Compassionate Message to Patient
                  </label>
                  <textarea
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    rows={6}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-205 outline-none leading-relaxed"
                  />
                </div>

                {/* Submit settings change */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving credentials...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeSubTab === "chat" && (
            <div className="flex flex-col gap-4 font-sans">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs">
                <span>Practitioner Thread: Communicating with patient <b className="text-slate-950">Alex Mercer</b>. Automatic clinical HIPAA logging is authorized.</span>
              </div>
              <ChatInterface
                counselorId={counselorId}
                counselorName={counselor.name}
                counselorAvatar={counselor.avatar}
                senderRole="counselor"
              />
            </div>
          )}

          {activeSubTab === "email" && (
            <EmailSimulationView
              counselorId={counselorId}
              counselorName={counselor.name}
              counselorEmail={`${counselorId}@counselsync.health`}
              senderRole="counselor"
              counselors={counselors}
            />
          )}
        </>
      )}

    </div>
  );
}
