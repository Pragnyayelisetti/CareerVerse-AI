import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import OTPModal from '../components/OTPModal';
import Toast from '../components/Toast';
import { signup, verifyOTP, sendOTP } from '../api/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', mobile: '', password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = useCallback((m, t = 'info') => setToast({ message: m, type: t }), []);

  const strength = (() => {
    const p = form.password;
    if (!p) return { level: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 2) return { level: s, label: 'Weak', color: 'bg-error-500' };
    if (s <= 3) return { level: s, label: 'Medium', color: 'bg-warning-500' };
    return { level: s, label: 'Strong', color: 'bg-success-500' };
  })();

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    else if (form.full_name.length < 2) e.full_name = 'Min 2 chars';
    if (!form.username.trim()) e.username = 'Required';
    else if (form.username.length < 3) e.username = 'Min 3 chars';
    if (!form.mobile.trim()) e.mobile = 'Required';
    else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter 10 digits';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.confirm_password) e.confirm_password = 'Required';
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      notify('Account created! Verify your mobile.', 'success');
      setOtpOpen(true);
    } catch (err) {
      notify(err.response?.data?.detail || 'Signup failed.', 'error');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (otp) => {
    setOtpLoading(true);
    try {
      await verifyOTP(form.mobile, otp, 'signup');
      notify('Verified! Redirecting to login...', 'success');
      setOtpOpen(false);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      notify(err.response?.data?.detail || 'Invalid OTP.', 'error');
    } finally { setOtpLoading(false); }
  };

  const handleResend = async () => {
    try {
      await sendOTP(form.mobile, 'signup');
      notify('OTP resent!', 'info');
    } catch { notify('Resend failed.', 'error'); }
  };

  const chg = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };
  const inputCls = (field) => `w-full pl-11 pr-4 py-3 rounded-xl bg-dark-700/80 border text-white placeholder-gray-500 outline-none transition-all duration-200 text-sm ${errors[field] ? 'border-error-500' : 'border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'}`;
  const EyeOpen = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
  const EyeClosed = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"/></svg>;
  const Spinner = <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <OTPModal isOpen={otpOpen} onClose={() => setOtpOpen(false)} onVerify={handleVerifyOTP} onResend={handleResend} loading={otpLoading} mobile={form.mobile} />

      <div className="w-full max-w-md relative animate-slide-up" style={{ zIndex: 10 }}>
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold font-display tracking-tight bg-gradient-to-r from-primary-300 via-accent-300 to-primary-400 bg-clip-text text-transparent mb-3">
            Join CareerVerse
          </h1>
          <p className="text-gray-400 text-lg font-medium opacity-80">
            Start your AI-powered career journey today
          </p>
        </div>

        <div className="glass-card rounded-3xl p-10 shadow-2xl border border-white/10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Create Account</h2>
            <p className="text-gray-400 text-sm">Join thousands of professionals already here</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="s-name" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Full Name</label>
              <input 
                id="s-name" 
                type="text" 
                placeholder="Enter your full name" 
                value={form.full_name} 
                onChange={chg('full_name')} 
                className={`${inputCls('full_name')} !pl-4 h-12`} 
              />
              {errors.full_name && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.full_name}</p>}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="s-user" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Username</label>
              <input 
                id="s-user" 
                type="text" 
                placeholder="Choose a username" 
                value={form.username} 
                onChange={chg('username')} 
                className={`${inputCls('username')} !pl-4 h-12`} 
              />
              {errors.username && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.username}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="s-mob" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Mobile Number</label>
              <input 
                id="s-mob" 
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

            {/* Password */}
            <div>
              <label htmlFor="s-pw" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  id="s-pw" 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Create a strong password" 
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
              
              {form.password && (
                <div className="mt-3 px-1">
                  <div className="flex gap-1.5 h-1.5 rounded-full overflow-hidden bg-dark-700/50">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-all duration-500 ${i <= strength.level ? strength.color : 'bg-dark-600/30'}`} 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Password Strength</p>
                    <p className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="s-cpw" className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Confirm Password</label>
              <div className="relative">
                <input 
                  id="s-cpw" 
                  type={showCpw ? 'text' : 'password'} 
                  placeholder="Confirm your password" 
                  value={form.confirm_password} 
                  onChange={chg('confirm_password')} 
                  className={`${inputCls('confirm_password')} !pl-4 !pr-12 h-12`} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCpw(s => !s)} 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-primary-300 transition-colors cursor-pointer"
                >
                  {showCpw ? EyeClosed : EyeOpen}
                </button>
              </div>
              {errors.confirm_password && <p className="text-error-500 text-xs mt-1.5 ml-1">{errors.confirm_password}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 hover:from-primary-500 hover:via-primary-400 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <>{Spinner} Processing...</> : 'Create My Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-10 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} CareerVerse AI &bull; Intelligent Career Solutions
        </p>
      </div>
    </div>
  );
}
