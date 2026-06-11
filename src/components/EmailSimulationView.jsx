import React, { useState, useEffect } from "react";
import { Mail, Send, Inbox, Plus, HelpCircle, Shield, Loader2 } from "lucide-react";

export default function EmailSimulationView({
  counselorId,
  counselorName,
  counselorEmail,
  senderRole,
  counselors,
}) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEmail, setActiveEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);

  // Compose Fields
  const [composeRecipientId, setComposeRecipientId] = useState(counselors[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const emailTemplates = [
    {
      label: "Support Worksheet Review",
      subject: "Cognitive Schema Thought Log Review",
      body: "Hi,\n\nI have attached my cognitive worksheet log and wanted to coordinate a review. I feel my trigger points are becoming clearer. Let me know what you think.\n\nBest,\nAlex Mercer",
    },
    {
      label: "Schedule Consultation Assistance",
      subject: "Appointment Booking Question",
      body: "Hi,\n\nI was looking to organize a specialized session but have conflict blocks with the standard 11:00 AM slots. Are there custom slots or weekend availabilities you could make open?\n\nWarm regards,\nAlex",
    }
  ];

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/emails");
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((em) => {
          if (senderRole === "client") {
            // Client emails (sent by user or sent to user)
            return em.recipientEmail === "alex.mercer@gmail.com" || em.senderEmail === "alex.mercer@gmail.com";
          } else {
            // Counselor specific emails
            return em.counselorId === counselorId;
          }
        });
        setEmails(filtered);
        if (filtered.length > 0 && !activeEmail) {
          setActiveEmail(filtered[0]);
        }
      }
    } catch (err) {
      console.error("Error loading email sync logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [counselorId, senderRole]);

  const handleApplyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setStatusMsg("Please provide subject and content body.");
      return;
    }

    let payload = {};

    if (senderRole === "client") {
      const selectedCounselor = counselors.find((c) => c.id === composeRecipientId) || counselors[0];
      payload = {
        senderName: "Alex Mercer",
        senderEmail: "alex.mercer@gmail.com",
        recipientName: selectedCounselor.name,
        recipientEmail: `${selectedCounselor.id}@counselsync.health`,
        subject,
        body,
        counselorId: selectedCounselor.id,
      };
    } else {
      payload = {
        senderName: counselorName,
        senderEmail: `${counselorId}@counselsync.health`,
        recipientName: "Alex Mercer",
        recipientEmail: "alex.mercer@gmail.com",
        subject,
        body,
        counselorId: counselorId,
      };
    }

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setEmails((prev) => [created, ...prev]);
        setActiveEmail(created);
        setIsComposing(false);
        setSubject("");
        setBody("");
        setStatusMsg("");
      }
    } catch (err) {
      console.error("Failed to transmit email:", err);
    }
  };

  return (
    <div id="email-portal-layout" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[550px]">
      
      {/* Inbox Left Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50/60">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Inbox size={18} className="text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Email Notifications</h4>
          </div>
          <button
            id="email-compose-btn"
            onClick={() => {
              setIsComposing(true);
              setActiveEmail(null);
            }}
            className="p-1 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus size={14} />
            <span>Compose</span>
          </button>
        </div>

        {/* Email lists */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center">
              <Loader2 className="animate-spin text-slate-400 mb-1" size={18} />
              <span>indexing security server...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No secure offline emails logged yet.</div>
          ) : (
            emails.map((em) => (
              <button
                key={em.id}
                onClick={() => {
                  setActiveEmail(em);
                  setIsComposing(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl transition-all border flex gap-3 ${
                  activeEmail?.id === em.id
                    ? "bg-white border-indigo-200/80 shadow-xs ring-1 ring-indigo-50"
                    : "bg-transparent border-transparent hover:bg-slate-100/60"
                }`}
              >
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 self-start">
                  <Mail size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 text-[10px] font-mono">
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">
                      {em.senderName.split(",")[0]}
                    </span>
                    <span className="text-slate-400">{em.date}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 truncate">{em.subject}</h5>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{em.body}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail Area Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {isComposing ? (
          /* Composer view */
          <form onSubmit={handleSendEmail} className="p-6 flex flex-col gap-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Compose Secure HIPAA Message</h4>
              <button
                type="button"
                onClick={() => {
                  setIsComposing(false);
                  if (emails.length > 0) setActiveEmail(emails[0]);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            {/* Recipient SELECT if client role */}
            {senderRole === "client" ? (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Secure Counselor Recipient
                </label>
                <select
                  value={composeRecipientId}
                  onChange={(e) => setComposeRecipientId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                >
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.serviceType})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Patient Recipient Address
                </label>
                <div className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                  alex.mercer@gmail.com (Alex Mercer - Client ID)
                </div>
              </div>
            )}

            {/* Templates helpful toolbar */}
            {senderRole === "client" && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="text-[10px] uppercase font-mono tracking-wide text-slate-400 font-bold block mb-1.5">
                  Insert Client Intake Templates:
                </span>
                <div className="flex flex-wrap gap-2">
                  {emailTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(t)}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-[10px] text-slate-700 font-medium transition-all"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Message Subject Line
              </label>
              <input
                type="text"
                placeholder="e.g. Question regarding anxiety triggers..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Correspondence Body
              </label>
              <textarea
                placeholder="Type secure medical correspondence here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full flex-1 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs leading-relaxed resize-none min-h-[150px]"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
              <Shield size={12} className="text-emerald-600" />
              <span>Your communication leaves this app via TLS point-to-point and is logged under patient records securely.</span>
            </div>

            <button
              id="email-submit-btn"
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <Send size={13} />
              <span>Transmit Secure Email</span>
            </button>
          </form>
        ) : activeEmail ? (
          /* Email detail viewer */
          <div className="p-6 flex flex-col h-full overflow-y-auto">
            {/* Subject and Security Tag */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">{activeEmail.subject}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 flex-wrap">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[10px]">
                    ID: {activeEmail.id}
                  </span>
                  <span>•</span>
                  <span>Date Tracked: {activeEmail.date}</span>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-1 rounded-full text-[10px] tracking-wider font-bold uppercase">
                ENCRYPTED TRANSIT
              </span>
            </div>

            {/* Sender and Recipient */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 my-4 flex flex-col gap-1 text-xs">
              <div>
                <span className="text-slate-400 font-medium mr-1 select-none">Sender:</span>
                <b className="text-slate-800">{activeEmail.senderName}</b>{" "}
                <span className="text-slate-500 font-mono">({activeEmail.senderEmail})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium mr-1 select-none">Recipient:</span>
                <b className="text-slate-800">{activeEmail.recipientName}</b>{" "}
                <span className="text-slate-500 font-mono">({activeEmail.recipientEmail})</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 text-sm text-slate-700 leading-relaxed font-mono bg-stone-50 border border-stone-150 p-5 rounded-xl whitespace-pre-wrap">
              {activeEmail.body}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-indigo-600" />
                <span>Patient Health Information (PHI) Secure Block</span>
              </div>
              <span>Logged by server.ts router</span>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
            <Mail className="text-slate-300 mb-2 animate-pulse" size={40} />
            <h4 className="text-sm font-bold text-slate-700">No Email Log Selected</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Click any secure email log in the left list view to display details, or start a new form compose.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
