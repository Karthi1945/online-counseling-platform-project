import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Download, User, CheckCheck, Loader2 } from "lucide-react";

export default function ChatInterface({
  counselorId,
  counselorName,
  senderRole,
  counselorAvatar,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);

  // Fetch messages from back-end
  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        // Filter messages for current thread
        const filtered = data.filter((m) => {
          return (
            (m.senderId === "default_client" && m.recipientId === counselorId) ||
            (m.senderId === counselorId && m.recipientId === "default_client")
          );
        });
        setMessages(filtered);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // long poll
    return () => clearInterval(interval);
  }, [counselorId, senderRole]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSendMessage = async (customAttachment) => {
    if (!text.trim() && !customAttachment) return;

    const bodyData = {
      senderId: senderRole === "client" ? "default_client" : counselorId,
      senderName: senderRole === "client" ? "Alex Mercer" : counselorName,
      senderRole,
      recipientId: senderRole === "client" ? counselorId : "default_client",
      text,
      attachmentName: customAttachment || undefined,
    };

    setText("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages((prev) => [...prev, newMsg]);

        // Simulating automated response if sender is Client
        if (senderRole === "client" && !customAttachment) {
          triggerAutomatedCounselorReply();
        }
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  // Simulated counselor responses with clinical wisdom relative to specialties
  const triggerAutomatedCounselorReply = () => {
    setTimeout(async () => {
      let wisdom = "Thank you for sharing that with me. Let's delve deeper into this pattern during our next live session.";
      if (counselorId === "sarah_jenkins") {
        wisdom = "I see. When this anxiety triggers, how do you experience it in your physical body? Let's trace that trigger.";
      } else if (counselorId === "michael_carter") {
        wisdom = "This pattern represents a cycle in communication. Try stating your needs clearly with 'I feel' statements instead of defensive stances.";
      } else if (counselorId === "elena_rostova") {
        wisdom = "Fascinating goals, Alex. Burnout happens when output outpaces our personal energetic intake. Let's list your non-negotiable boundaries.";
      } else if (counselorId === "david_park") {
        wisdom = "That is very common, Alex. Remember, box breathing for just 3 cycles acts as a powerful nervous system brake. Shall we outline a routine?";
      }

      const bodyData = {
        senderId: counselorId,
        senderName: counselorName,
        senderRole: "counselor",
        recipientId: "default_client",
        text: wisdom,
      };

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        if (response.ok) {
          const reply = await response.json();
          setMessages((prev) => [...prev, reply]);
        }
      } catch (err) {
        console.error("Error sending automated server reply:", err);
      }
    }, 1500);
  };

  // Mock File Upload Integration
  const handleFileUpload = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/upload-file", { method: "POST" });
      if (res.ok) {
        const attachMeta = await res.json();
        // Post mock file attachment directly to conversation
        await handleSendMessage(attachMeta.name);
      }
    } catch (err) {
      console.error("Mock upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="general-chat-interface" className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={senderRole === "client" ? counselorAvatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
              alt={counselorName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-50/10"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {senderRole === "client" ? counselorName : "Alex Mercer"}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Confidential {senderRole === "client" ? "Telehealth Practitioner" : "Patient Thread"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] bg-slate-200 text-slate-600 font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            HIPAA COMPLIANT
          </span>
        </div>
      </div>

      {/* Messages Scrolling Grid */}
      <div
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto bg-slate-50/50 flex flex-col gap-4"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
            <span className="text-xs">Initialising chat history index...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <User className="text-slate-300 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-700">No Messages Logged</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Initiate counseling dialogues by sending your core counselor a quick greeting below.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderRole === senderRole;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-[10px] font-semibold text-slate-500">{m.senderName.split(",")[0]}</span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* File Attachment Card or standard Text bubble */}
                {m.attachmentName ? (
                  <div className="p-3.5 bg-slate-100 rounded-2xl max-w-[75%] border border-slate-200 shadow-3xs text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Paperclip size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{m.attachmentName}</p>
                        <p className="text-[10px] text-slate-400">Secure Attachment • Medical Resource</p>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3.5 rounded-2xl max-w-[75%] shadow-3xs text-sm leading-relaxed ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-slate-700 rounded-tl-none border border-slate-200/80"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                
                {isMe && (
                  <div className="flex items-center gap-0.5 mt-0.5 text-[9px] text-indigo-500 font-mono">
                    <CheckCheck size={11} />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input controls */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          {/* File Attachment Trigger */}
          <button
            id="chat-attach-btn"
            onClick={handleFileUpload}
            disabled={uploading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
            title="Attach counseling materials"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Paperclip size={16} />}
          </button>

          {/* Form Message */}
          <input
            id="chat-text-input"
            type="text"
            placeholder="Type confidential messaging outside session..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
          />

          <button
            id="chat-send-btn"
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-xs"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
