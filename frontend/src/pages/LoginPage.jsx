import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import OTPModal from '../components/OTPModal';
import Toast from '../components/Toast';
import { login, verifyOTP, sendOTP, forgotPassword } from '../api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', mobile: '' });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('login');
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [fMobile, setFMobile] = useState('');
  const [fNewPw, setFNewPw] = useState('');
  const [fStep, setFStep] = useState(1);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = 'info') => setToast({ message, type }), []);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Required';
    else if (form.username.length < 3) e.username = 'Min 3 chars';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.mobile.trim()) e.mobile = 'Required';
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter 10 digits';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      notify('Credentials verified! Enter OTP.', 'success');
      setOtpPurpose('login');
      setOtpOpen(true);
    } catch (err) {
      notify(err.response?.data?.detail || 'Login failed.', 'error');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (otp) => {
    setOtpLoading(true);
    try {
      const mob = otpPurpose === 'forgot' ? fMobile : form.mobile;
      if (otpPurpose === 'forgot') {
        await forgotPassword({ mobile: mob, otp, new_password: fNewPw });
        notify('Password reset! Login now.', 'success');
        setOtpOpen(false); setForgot(false); setFStep(1);
      } else {
        await verifyOTP(mob, otp, 'login');
        notify('Login successful!', 'success');
        setOtpOpen(false);
        if (remember) localStorage.setItem('cv_user', form.username);
        setTimeout(() => navigate('/welcome'), 800);
      }
    } catch (err) {
      notify(err.response?.data?.detail || 'Invalid OTP.', 'error');
    } finally { setOtpLoading(false); }
  };

  const handleResend = async () => {
    try {
      await sendOTP(otpPurpose === 'forgot' ? fMobile : form.mobile, otpPurpose);
      notify('OTP resent!', 'info');
    } catch { notify('Resend failed.', 'error'); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(fMobile)) { notify('Enter valid 10-digit number.', 'error'); return; }
    if (fStep === 2 && fNewPw.length < 6) { notify('Min 6 char password.', 'error'); return; }
    setLoading(true);
    try {
      await sendOTP(fMobile, 'forgot');
      notify('OTP sent!', 'success');
      if (fStep === 1) setFStep(2);
      else { setOtpPurpose('forgot'); setOtpOpen(true); }
    } catch (err) {
      notify(err.response?.data?.detail || 'Failed.', 'error');
    } finally { setLoading(false); }
  };

  const chg = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const EyeOpen = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
  const EyeClosed = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" /></svg>;

  const inputCls = (field) => `w-full pl-11 pr-4 py-3 rounded-xl bg-dark-700/80 border text-white placeholder-gray-500 outline-none transition-all duration-200 text-sm ${errors[field] ? 'border-error-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'}`;

  const Spinner = <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <OTPModal isOpen={otpOpen} onClose={() => setOtpOpen(false)} onVerify={handleVerifyOTP}
        onResend={handleResend} loading={otpLoading} mobile={otpPurpose === 'forgot' ? fMobile : form.mobile} />

      <div className="w-full max-w-md relative animate-slide-up" style={{ zIndex: 10 }}>
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold font-display tracking-tight bg-gradient-to-r from-primary-300 via-accent-300 to-primary-400 bg-clip-text text-transparent mb-3">
            CareerVerse AI
          </h1>
          <p className="text-gray-400 text-lg font-medium opacity-80">
            Your AI-powered career compass
          </p>
        </div>

        <div className="glass-card rounded-3xl p-10 shadow-2xl border border-white/10">
          {!forgot ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2 font-display">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Please sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6" noValidate>
                {/* Username */}
                <div>
                  <label htmlFor="l-user" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Username</label>
                  <input
                    id="l-user"
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={chg('username')}
                    className={`${inputCls('username')} !pl-4 h-12`}
                  />
                  {errors.username && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label htmlFor="l-pw" className="block text-sm font-semibold text-gray-300">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      id="l-pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={chg('password')}
                      className={`${inputCls('password')} !pl-4 !pr-12 h-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-primary-300 transition-colors cursor-pointer"
                    >
                      {showPw ? EyeClosed : EyeOpen}
                    </button>
                  </div>
                  {errors.password && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.password}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="l-mob" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Mobile Number</label>
                  <input
                    id="l-mob"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    value={form.mobile}
                    onChange={chg('mobile')}
                    maxLength={10}
                    className={`${inputCls('mobile')} !pl-4 h-12`}
                  />
                  {errors.mobile && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.mobile}</p>}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400 group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-dark-700/50 text-primary-500 cursor-pointer transition-all group-hover:border-primary-400/50"
                    />
                    <span className="group-hover:text-gray-300 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setForgot(true); setFStep(1); setFMobile(''); setFNewPw(''); }}
                    className="text-primary-400 hover:text-primary-300 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-500 hover:via-primary-400 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? <>{Spinner} Processing...</> : 'Sign In to Account'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                    Create one for free
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setForgot(false); setFStep(1); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer group"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sign In
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 font-display">Reset Password</h2>
                <p className="text-gray-400 text-sm">
                  {fStep === 1
                    ? 'Enter your registered mobile number to receive an OTP.'
                    : 'Create a strong new password and verify the OTP.'}
                </p>
              </div>

              <form onSubmit={handleForgot} className="space-y-6">
                <div>
                  <label htmlFor="f-mob" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Mobile Number</label>
                  <input
                    id="f-mob"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit mobile"
                    value={fMobile}
                    onChange={e => setFMobile(e.target.value)}
                    maxLength={10}
                    disabled={fStep === 2}
                    className="w-full px-4 h-12 rounded-xl bg-dark-700/50 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-primary-400/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm disabled:opacity-60"
                  />
                </div>

                {fStep === 2 && (
                  <div>
                    <label htmlFor="f-pw" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">New Password</label>
                    <input
                      id="f-pw"
                      type="password"
                      placeholder="Min 6 characters"
                      value={fNewPw}
                      onChange={e => setFNewPw(e.target.value)}
                      className="w-full px-4 h-12 rounded-xl bg-dark-700/50 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-primary-400/50 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3"
                >
                  {loading ? <>{Spinner} Sending...</> : fStep === 1 ? 'Send OTP Code' : 'Verify & Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-600 mt-10 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} CareerVerse AI &bull; Intelligent Career Solutions
        </p>
      </div>
    </div>
  );
}
