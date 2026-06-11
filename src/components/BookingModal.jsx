import React, { useState } from "react";
import { X, Calendar, Clock, Sparkles, CreditCard, Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function BookingModal({ counselor, onClose, onSuccess }) {
  const [step, setStep] = useState(1);

  // Form Fields
  const [sessionType, setSessionType] = useState(counselor.serviceType);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  // Payment Fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdApt, setCreatedApt] = useState(null);

  // Form Valids
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg("Please select an available appointment time slot.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setErrorMsg("Please fill out all simulated payment fields.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselorId: counselor.id,
          counselorName: counselor.name,
          clientName: "Alex Mercer", // active demo client
          clientEmail: "alex.mercer@gmail.com",
          date,
          time: selectedTime,
          serviceType: sessionType,
          price: counselor.price,
          notes,
          cardName,
          cardNumber,
          cardExpiry,
          cardCvv,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process session booking.");
      }

      const result = await response.json();
      setCreatedApt(result.appointment);
      setStep(3); // Go to success
    } catch (err) {
      setErrorMsg(err.message || "An unexpected transaction error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="booking-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col relative animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {step === 1 ? "Step 1: Details" : step === 2 ? "Step 2: Checkout" : "Finalized"}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Book Session with {counselor.name.split(",")[0]}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-6 flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-100">
                {errorMsg}
              </div>
            )}

            {/* Session Type selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Session Focus / Specialty
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="Mental Health">Mental Health & Well-being (₹{counselor.price}/hr)</option>
                <option value="Relationship Advice">Relationship & Couple Counsel (₹{counselor.price}/hr)</option>
                <option value="Career Counseling">Career & Growth Roadmap (₹{counselor.price}/hr)</option>
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose Session Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Available Time Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Available Hours on selected date
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Please click one of the counselor's listed slots below:</p>
              <div className="grid grid-cols-3 gap-2">
                {counselor.availability.map((timeSlot) => (
                  <button
                    key={timeSlot}
                    type="button"
                    onClick={() => setSelectedTime(timeSlot)}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                      selectedTime === timeSlot
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Clock size={11} className="inline mr-1 -mt-0.5" />
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>

            {/* Intake details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Intake Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly state what you intend to address, or any anxiety/challenges you are experiencing..."
                rows={3}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <button
              id="booking-confirm-details-btn"
              type="submit"
              className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Continue to Secure Checkout</span>
              <Sparkles size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Payment Checklist */}
        {step === 2 && (
          <form onSubmit={handleProcessPayment} className="p-6 flex flex-col gap-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-100 animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* Back Arrow & Pricing Bill */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Change Time/Notes</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">Secured by Stripe SSL</span>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 text-sm">
              <h4 className="font-bold text-slate-900 mb-2">Billing Invoice Summary</h4>
              <div className="flex justify-between py-1 text-slate-600 text-xs">
                <span>{sessionType} Consultation ({selectedTime})</span>
                <span>₹{counselor.price}.00</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 text-xs">
                <span>Intake Processing & Video Encryption</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total Charge Amount</span>
                <span>₹{counselor.price}.00</span>
              </div>
            </div>

            {/* Card Inputs */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Mercer"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Card Number (Simulated)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => {
                      // auto space layout
                      const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                      const matches = v.match(/\d{4,16}/g);
                      const match = (matches && matches[0]) || "";
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(" "));
                      } else {
                        setCardNumber(v);
                      }
                    }}
                    maxLength={19}
                    required
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, "");
                      if (val.length >= 2) {
                        val = val.slice(0, 2) + "/" + val.slice(2, 4);
                      }
                      setCardExpiry(val);
                    }}
                    required
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Security CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono text-lg tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <Lock size={12} className="text-emerald-600 flex-shrink-0" />
              <span>Simulated Payment Gateway. Your information is processed safely in isolated workspace models.</span>
            </div>

            <button
              id="booking-charge-checkout-btn"
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm transition-all hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Authorizing Funds & Booking...</span>
                </>
              ) : (
                <>
                  <Lock size={14} className="-mt-0.5" />
                  <span>Authorize & Pay ₹{counselor.price}.00</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Session Successfully Booked!</h4>
            <p className="text-sm text-slate-600 mt-2 max-w-sm">
              We have booked your appointment with <b className="text-slate-950">{counselor.name}</b> on{" "}
              <b className="text-slate-950">{date}</b> at <b className="text-slate-950">{selectedTime}</b>.
            </p>

            <div className="bg-slate-50 w-full rounded-2xl p-4 border border-indigo-50 mt-6 text-xs text-left text-slate-600 flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Confirmation ID:</span>
                <span className="font-mono font-bold text-slate-800">{createdApt?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Encrypted Billing ID:</span>
                <span className="font-mono text-slate-500">{createdApt?.paymentId}</span>
              </div>
              <p className="mt-1.5 pt-2 border-t border-slate-200 text-[11px] leading-relaxed text-slate-400 text-center">
                An automatic welcome email with your secure session link has been delivered. Feel free to initiate real-time text chat panels right now!
              </p>
            </div>

            <button
              id="booking-finalize-dismiss-btn"
              onClick={() => {
                onSuccess(createdApt);
                onClose();
              }}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Great, Go to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
