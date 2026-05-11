import { useState, useRef, useEffect } from 'react';

/**
 * 6-digit OTP input modal with auto-focus, timer, and resend.
 *
 * Props:
 *  - isOpen (bool)
 *  - onClose ()
 *  - onVerify (otp: string)
 *  - onResend ()
 *  - loading (bool)
 *  - mobile (string) — masked mobile shown in the modal
 */
export default function OTPModal({ isOpen, onClose, onVerify, onResend, loading, mobile }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Countdown
  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [isOpen, timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join('');
    if (code.length === 6) onVerify(code);
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    onResend();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const maskedMobile = mobile
    ? `${mobile.slice(0, 2)}****${mobile.slice(-2)}`
    : '••••••••••';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in" style={{ zIndex: 50 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="glass-strong relative rounded-2xl p-8 w-full max-w-md animate-slide-up shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-gradient-to-br from-[#6366f1]/20 to-[#0ea5e9]/20 flex items-center justify-center border border-white/5 shadow-xl">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-white font-display tracking-tight">Verify Identity</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Enter the security code sent to <span className="text-blue-400 font-bold tracking-widest">{maskedMobile}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-10" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-16 text-center text-2xl font-black rounded-2xl bg-[#1f2937]/50 border border-white/5
                         text-white focus:border-blue-500 focus:bg-[#1f2937]/80 outline-none
                         transition-all duration-300 shadow-inner"
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleSubmit}
          disabled={otp.join('').length < 6 || loading}
          className="w-full h-14 rounded-2xl font-black text-white transition-all duration-300 cursor-pointer
                     bg-gradient-to-r from-[#6366f1] to-[#0ea5e9] hover:from-[#4f46e5] hover:to-[#0284c7]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40
                     flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <span>Verify OTP</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center mt-6 text-xs tracking-widest uppercase font-black">
          {timer > 0 ? (
            <p className="text-gray-600">
              Resend in <span className="text-blue-400">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Request New Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
