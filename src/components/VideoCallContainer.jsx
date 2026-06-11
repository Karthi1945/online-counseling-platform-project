import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Send, Shield, Radio, CircleDot } from "lucide-react";

export default function VideoCallContainer({
  appointment,
  counselorAvatar,
  onEndCall,
  senderRole,
}) {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Live media stream from user camera
  const localVideoRef = useRef(null);
  const [userStream, setUserStream] = useState(null);

  // Chat message logs
  const [callMessages, setCallMessages] = useState([
    {
      sender: senderRole === "client" ? appointment.counselorName : appointment.clientName,
      text: "Hello! Can you hear and see me alright? The TLS HIPAA-compliant link has successfully initialized.",
      time: "12:00 PM",
    },
  ]);
  const [currentText, setCurrentText] = useState("");

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Request actual camera stream
  useEffect(() => {
    if (!isVideoStopped) {
      async function activateCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
            audio: false, // audio turned off to prevent local echo
          });
          setUserStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.log("Webcam access declined or unavailable, falling back to avatars.", err);
        }
      }
      activateCamera();
    } else {
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
        setUserStream(null);
      }
    }

    return () => {
      if (userStream) {
        userStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoStopped]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendCallMessage = (e) => {
    e.preventDefault();
    if (!currentText.trim()) return;

    setCallMessages((prev) => [
      ...prev,
      {
        sender: senderRole === "client" ? appointment.clientName : appointment.counselorName,
        text: currentText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    const mockAns = currentText;
    setCurrentText("");

    // Simulate response after 1.5s
    setTimeout(() => {
      let automatedReply = "I understand. Let's focus on that emotion and explore what steps we can formulate today.";
      if (senderRole === "counselor") {
        automatedReply = "Yes Dr., that makes perfect sense. I am trying to focus on these breathing pacing steps.";
      } else {
        if (mockAns.toLowerCase().includes("hello") || mockAns.toLowerCase().includes("hi")) {
          automatedReply = "Hello! Yes, the connection quality is fantastic. Let's start whenever you are prepared.";
        } else if (mockAns.toLowerCase().includes("anxious") || mockAns.toLowerCase().includes("panic")) {
          automatedReply = "I hear you. Let us try to coordinate a box-breathing interval right now. Inhale for 4 seconds, hold for 4, and release.";
        }
      }

      setCallMessages((prev) => [
        ...prev,
        {
          sender: senderRole === "client" ? appointment.counselorName : appointment.clientName,
          text: automatedReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <div
      id="video-call-container"
      className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col lg:flex-row h-[550px] animate-in zoom-in-95 duration-300"
    >
      {/* Video Screens Layout */}
      <div className="flex-1 p-4 flex flex-col relative bg-slate-950">
        
        {/* Top Header Row of Video Workspace */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto">
            <Radio size={14} className="text-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider font-mono">SECURE PEER CONNECTION</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto">
            <CircleDot size={12} className="text-red-500 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">
              REC {formatTime(recordSeconds)}
            </span>
          </div>
        </div>

        {/* Video Canvas Stage Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 mb-16">
          
          {/* Main Remote Feed: Counselor */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Simulation of screen share / web content */}
            {isScreenSharing ? (
              <div className="w-full h-full flex flex-col p-4 bg-slate-850 justify-between">
                <div className="border-b border-indigo-500/20 pb-2">
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-mono">SHARING: CBT_WORKSHEET.PDF</span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
                  <Shield size={32} className="text-indigo-400 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-slate-200">Interactive Thought Record Matrix</p>
                  <p className="text-[10px] text-slate-450 mt-1">Automatic core cognitive mapping of core anxiety schemas</p>
                  <div className="w-4/5 h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-indigo-500 rounded-full w-2/3 animate-pulse" />
                  </div>
                </div>
                <div className="pt-2 text-[9px] text-slate-400 text-right">Licensed for patient-use only</div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <div className="relative">
                  <img
                    src={senderRole === "client" ? counselorAvatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt="Active Remote Counselor"
                    className="w-24 h-24 rounded-full border-4 border-indigo-500/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Moving Voice level bar */}
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5 bg-slate-950 p-1.5 rounded-full border border-slate-805">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                    <span className="w-1 h-3.5 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                    <span className="w-1 h-2.5 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-300 mt-3">
                  {senderRole === "client" ? appointment.counselorName : appointment.clientName}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Licensed Professional Feed</p>
              </div>
            )}
            <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] border border-slate-800 text-slate-400 pointer-events-none">
              Role: {senderRole === "client" ? "Counselor" : "Client"}
            </span>
          </div>

          {/* Local Feed: User */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            {isVideoStopped ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2 border border-slate-700">
                  <VideoOff size={28} />
                </div>
                <p className="text-xs font-semibold text-slate-400">Your camera is off</p>
              </div>
            ) : userStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-705 relative">
                  <img
                    src={senderRole === "client" ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" : counselorAvatar}
                    alt="Active Local Feed"
                    className="w-20 h-20 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {!isMicMuted && (
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5 bg-slate-950 p-1.5 rounded-full border border-slate-800">
                      <span className="w-1 h-2 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                      <span className="w-1 h-3 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                      <span className="w-1 h-1.5 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-300 mt-3">You</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Camera inactive, voice stream live</p>
              </div>
            )}
            <span className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-md text-[10px] border border-slate-800 text-slate-400 pointer-events-none">
              Client Feed (Encrypted)
            </span>
          </div>

        </div>

        {/* Action Controls Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-3">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-3 rounded-full transition-all ${
              isMicMuted ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={() => setIsVideoStopped(!isVideoStopped)}
            className={`p-3 rounded-full transition-all ${
              isVideoStopped ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title={isVideoStopped ? "Activate Camera" : "Deactivate Camera"}
          >
            {isVideoStopped ? <VideoOff size={18} /> : <Video size={18} />}
          </button>

          {/* Toggle Screen Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-full transition-all ${
              isScreenSharing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
            title="Simulate Material Screen Share"
          >
            <ScreenShare size={18} />
          </button>

          {/* End Call Separator */}
          <div className="h-6 w-px bg-slate-800 my-auto mx-1" />

          {/* End Call Button */}
          <button
            id="video-terminate-btn"
            onClick={onEndCall}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all tracking-wider shadow-md uppercase"
          >
            <PhoneOff size={14} />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Video Call Live Chat Sidebar */}
      <div id="video-chat-panel" className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-slate-900/40">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Call Chat</span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            TLS Active
          </span>
        </div>

        {/* Messages list */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 max-h-[300px] lg:max-h-none">
          {callMessages.map((msg, i) => {
            const isMe = msg.sender === (senderRole === "client" ? appointment.clientName : appointment.counselorName);
            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-slate-500 mb-0.5">{msg.sender.split(",")[0]}</span>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-750"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <form onSubmit={handleSendCallMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Type confidential message..."
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            className="flex-1 bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-850 outline-none text-white focus:border-indigo-600"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
