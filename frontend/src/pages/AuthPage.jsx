import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import OTPModal from '../components/OTPModal';
import Toast from '../components/Toast';
import { login, signup, verifyOTP, sendOTP, forgotPassword } from '../api/auth';

/* ─────────────────────────────────────────────────────────────────
   AuthPage — Login + Sign Up + Forgot Password in one card.
   Font: Sora (add to index.html or CSS):
   @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
   ───────────────────────────────────────────────────────────────── */

/* ── Inline styles (avoids Tailwind custom-value clutter) ── */
const S = {
    page: {
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflowX: 'hidden',
        fontFamily: "'Sora', sans-serif",
        background: '#050b18',
    },
    layout: {
        width: '100%',
        maxWidth: '1180px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3rem',
    },
    // Brand
    brand: {
        flex: 1,
        maxWidth: '500px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
    },
    logoWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 40px rgba(99,102,241,0.35)',
        border: '1px solid rgba(255,255,255,0.12)',
        marginBottom: '1.75rem',
        flexShrink: 0,
    },
    brandTitle: {
        fontSize: 'clamp(2.4rem, 5vw, 4rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        marginBottom: '1.25rem',
    },
    brandSub: {
        color: 'rgba(156,163,175,0.85)',
        fontSize: '1.05rem',
        lineHeight: 1.7,
        maxWidth: 400,
        fontWeight: 400,
        marginBottom: '2.25rem',
    },
    badgesRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#6b7280',
    },
    badgeItem: { display: 'flex', alignItems: 'center', gap: 8 },
    dotBase: { width: 8, height: 8, borderRadius: '50%' },
    // Card
    authWrap: { width: '100%', maxWidth: 440 },
    card: {
        background: 'rgba(13, 22, 42, 0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 28,
        padding: '2.75rem 2.5rem',
        transition: 'border-color 0.3s',
    },
    cardHeader: { textAlign: 'center', marginBottom: '2.25rem' },
    cardTitle: {
        fontSize: '1.65rem',
        fontWeight: 700,
        color: '#f1f5f9',
        letterSpacing: '-0.02em',
        marginBottom: '0.4rem',
    },
    cardSub: { color: '#64748b', fontSize: '0.9rem', fontWeight: 400 },
    // Tabs
    tabs: {
        display: 'flex',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 4,
        marginBottom: '2.25rem',
        border: '1px solid rgba(255,255,255,0.06)',
        gap: 0,
    },
    tabBase: {
        flex: 1,
        padding: '0.55rem 1rem',
        borderRadius: 10,
        border: 'none',
        background: 'transparent',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.22s',
        letterSpacing: '0.01em',
    },
    tabInactive: { color: '#6b7280' },
    tabActive: {
        background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
        color: 'white',
        boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
    },
    // Fields
    fields: { display: 'flex', flexDirection: 'column', gap: '1.35rem' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.45rem' },
    fieldLabel: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        paddingLeft: 2,
    },
    fieldWrap: { position: 'relative' },
    fieldIcon: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#4b5563',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 48,
        background: 'rgba(30, 41, 59, 0.55)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 13,
        color: '#f1f5f9',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 400,
        paddingLeft: 42,
        paddingRight: 14,
        outline: 'none',
        transition: 'all 0.2s',
        WebkitAppearance: 'none',
    },
    inputWithEye: { paddingRight: 42 },
    eyeBtn: {
        position: 'absolute',
        right: 13,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#4b5563',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        transition: 'color 0.18s',
    },
    errorMsg: {
        fontSize: '0.75rem',
        color: '#f87171',
        paddingLeft: 2,
    },
    // Row
    rowBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.25rem',
    },
    rememberLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#6b7280',
        fontSize: '0.83rem',
        cursor: 'pointer',
        fontWeight: 500,
    },
    forgotLink: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#60a5fa',
        fontSize: '0.83rem',
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        transition: 'color 0.18s',
    },
    // Submit
    submitBtn: {
        width: '100%',
        height: 50,
        borderRadius: 13,
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
        color: 'white',
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 8px 24px rgba(99,102,241,0.28)',
        marginTop: '0.5rem',
        letterSpacing: '0.01em',
        transition: 'all 0.25s',
    },
    // Divider
    dividerWrap: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        margin: '1.5rem 0 0.25rem',
    },
    dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' },
    dividerText: {
        padding: '0 14px',
        fontSize: '0.68rem',
        fontWeight: 800,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#374151',
    },
    switchText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem',
        fontWeight: 400,
        marginTop: '1.25rem',
    },
    switchBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#60a5fa',
        fontWeight: 800,
        fontFamily: "'Sora', sans-serif",
        fontSize: '0.875rem',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        transition: 'color 0.18s',
        marginLeft: 4,
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6b7280',
        fontSize: '0.875rem',
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        transition: 'color 0.18s',
        marginBottom: '1.75rem',
        padding: 0,
    },
    // Strength
    strengthBarWrap: { display: 'flex', gap: 5, marginTop: 6 },
    strengthSeg: { flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', transition: 'background 0.3s' },
    strengthLbl: { fontSize: '0.7rem', marginTop: 3 },
    footer: {
        textAlign: 'center',
        fontSize: '0.65rem',
        color: '#374151',
        fontWeight: 800,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        marginTop: '1.5rem',
        opacity: 0.55,
    },
};

/* ── Tiny password-strength helper ── */
function pwStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 2) return { score: 1, label: 'Weak', color: '#f87171' };
    if (s <= 3) return { score: 2, label: 'Medium', color: '#fbbf24' };
    return { score: 4, label: 'Strong', color: '#34d399' };
}

/* ── SVG Icons ── */
const IconUser = () => (
    <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconLock = () => (
    <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const IconPhone = () => (
    <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const IconEyeOpen = () => (
    <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const IconEyeClosed = () => (
    <svg width={17} height={17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
    </svg>
);
const IconArrowLeft = () => (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);
const IconBulb = () => (
    <svg width={36} height={36} fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const Spinner = () => (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 0.9s linear infinite' }}>
        <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
        <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

/* ── Reusable sub-components ── */
const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={S.eyeBtn}>
        {show ? <IconEyeClosed /> : <IconEyeOpen />}
    </button>
);

const FieldError = ({ msg }) =>
    msg ? <p style={S.errorMsg}>{msg}</p> : null;

const StrengthBar = ({ password }) => {
    const { score, label, color } = pwStrength(password);
    const segs = [1, 2, 3, 4];
    return (
        <>
            <div style={S.strengthBarWrap}>
                {segs.map(i => (
                    <div key={i} style={{ ...S.strengthSeg, background: i <= score ? color : 'rgba(255,255,255,0.08)' }} />
                ))}
            </div>
            {label && <span style={{ ...S.strengthLbl, color }}>{label}</span>}
        </>
    );
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'

    useEffect(() => {
        if (location.pathname === '/signup') setMode('signup');
        else if (location.pathname === '/login') setMode('login');
    }, [location.pathname]);

    /* ── Login form state ── */
    const [lf, setLf] = useState({ username: '', password: '', mobile: '' });
    const [showLPw, setShowLPw] = useState(false);
    const [remember, setRemember] = useState(false);

    /* ── Signup form state ── */
    const [sf, setSf] = useState({ full_name: '', username: '', mobile: '', password: '', confirm_password: '' });
    const [showSPw, setShowSPw] = useState(false);
    const [showSCPw, setShowSCPw] = useState(false);

    /* ── Forgot form state ── */
    const [fMobile, setFMobile] = useState('');
    const [fNewPw, setFNewPw] = useState('');
    const [fStep, setFStep] = useState(1);

    /* ── Common state ── */
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpPurpose, setOtpPurpose] = useState('login');
    const [otpMobile, setOtpMobile] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const notify = useCallback((m, t = 'info') => setToast({ message: m, type: t }), []);

    /* ── Mode switch ── */
    const switchMode = (m) => {
        setMode(m);
        setErrors({});
        setFStep(1);
        setFMobile('');
        setFNewPw('');
        if (m === 'login' || m === 'signup') navigate(`/${m}`, { replace: true });
    };

    /* ── Validators ── */
    const validateLogin = () => {
        const e = {};
        if (!lf.username.trim()) e.username = 'Username is required';
        else if (lf.username.length < 3) e.username = 'Minimum 3 characters';
        if (!lf.password) e.password = 'Password is required';
        else if (lf.password.length < 6) e.password = 'Minimum 6 characters';
        if (!lf.mobile.trim()) e.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(lf.mobile)) e.mobile = 'Enter valid 10-digit number';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const validateSignup = () => {
        const e = {};
        if (!sf.full_name.trim()) e.full_name = 'Full name is required';
        if (!sf.username.trim()) e.username = 'Username is required';
        else if (sf.username.length < 3) e.username = 'Minimum 3 characters';
        if (!sf.mobile.trim()) e.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(sf.mobile)) e.mobile = 'Enter valid 10-digit number';
        if (!sf.password) e.password = 'Password is required';
        else if (sf.password.length < 6) e.password = 'Minimum 6 characters';
        if (!sf.confirm_password) e.confirm_password = 'Please confirm password';
        else if (sf.password !== sf.confirm_password) e.confirm_password = 'Passwords do not match';
        setErrors(e);
        return !Object.keys(e).length;
    };

    /* ── Handlers ── */
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateLogin()) return;
        setLoading(true);
        try {
            await login(lf);

            notify('Login successful!', 'success');

            setTimeout(() => navigate('/welcome'), 800);
        } catch (err) {
            notify(err.response?.data?.detail || 'Login failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateSignup()) return;
        setLoading(true);
        try {
            await signup(sf);

            notify('Account created successfully!', 'success');

            setTimeout(() => navigate('/welcome'), 800);
        } catch (err) {
            notify(err.response?.data?.detail || 'Signup failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(fMobile)) { notify('Enter valid 10-digit number.', 'error'); return; }
        if (fStep === 2 && fNewPw.length < 6) { notify('Minimum 6 characters.', 'error'); return; }
        setLoading(true);
        try {
            await sendOTP(fMobile, 'forgot');
            notify('OTP sent!', 'success');
            if (fStep === 1) setFStep(2);
            else { setOtpPurpose('forgot'); setOtpMobile(fMobile); setOtpOpen(true); }
        } catch (err) {
            notify(err.response?.data?.detail || 'Failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp) => {
        setOtpLoading(true);
        try {
            if (otpPurpose === 'forgot') {
                await forgotPassword({ mobile: otpMobile, otp, new_password: fNewPw });
                notify('Password reset! You can now login.', 'success');
                setOtpOpen(false);
                switchMode('login');
            } else if (otpPurpose === 'signup') {
                await verifyOTP(otpMobile, otp, 'signup');
                notify('Verified! You can now login.', 'success');
                setOtpOpen(false);
                switchMode('login');
            } else {
                await verifyOTP(otpMobile, otp, 'login');
                notify('Login successful!', 'success');
                setOtpOpen(false);
                if (remember) localStorage.setItem('cv_user', lf.username);
                setTimeout(() => navigate('/dashboard'), 800);
            }
        } catch (err) {
            notify(err.response?.data?.detail || 'Invalid OTP.', 'error');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await sendOTP(otpMobile, otpPurpose);
            notify('OTP resent!', 'info');
        } catch {
            notify('Resend failed.', 'error');
        }
    };

    /* ── Input style helpers ── */
    const inputStyle = (hasErr, withEye = false) => ({
        ...S.input,
        ...(withEye ? S.inputWithEye : {}),
        borderColor: hasErr ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.07)',
    });

    const lFieldChange = (key) => (e) => {
        setLf(p => ({ ...p, [key]: e.target.value }));
        setErrors(p => ({ ...p, [key]: '' }));
    };
    const sFieldChange = (key) => (e) => {
        setSf(p => ({ ...p, [key]: e.target.value }));
        setErrors(p => ({ ...p, [key]: '' }));
    };

    /* ═══════════════════════════════════
       RENDER
    ═══════════════════════════════════ */
    return (
        <div style={S.page}>
            {/* Keyframe injection */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(30px,20px) scale(1.06); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.82); }
        }
        .cv-input:focus {
          border-color: rgba(99,102,241,0.55) !important;
          background: rgba(30,41,59,0.75) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          outline: none;
        }
        .cv-input::placeholder { color: #374151; }
        .cv-card:hover { border-color: rgba(255,255,255,0.13) !important; }
        .cv-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.38) !important; }
        .cv-submit:active { transform: translateY(0) !important; }
        .cv-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .cv-back:hover { color: #f1f5f9 !important; }
        .cv-forgot:hover { color: #93c5fd !important; }
        .cv-switch:hover { color: #93c5fd !important; }
        .cv-eye:hover { color: #818cf8 !important; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; animation: drift 12s ease-in-out infinite alternate; }
        @media (min-width: 900px) {
          .cv-layout { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; }
          .cv-brand  { text-align: left !important; align-items: flex-start !important; }
        }
      `}</style>

            {/* ── Animated background orbs ── */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div className="orb" style={{ width: 500, height: 500, background: '#6366f1', top: '-10%', left: '-5%', animationDelay: '0s' }} />
                <div className="orb" style={{ width: 400, height: 400, background: '#0ea5e9', bottom: '-5%', right: '0%', animationDelay: '-4s' }} />
                <div className="orb" style={{ width: 300, height: 300, background: '#a855f7', top: '40%', left: '40%', animationDelay: '-8s' }} />
            </div>

            {/* Existing AnimatedBackground (keep if you have it) */}
            <AnimatedBackground />

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* OTP Modal */}
            <OTPModal
                isOpen={otpOpen}
                onClose={() => setOtpOpen(false)}
                onVerify={handleVerifyOTP}
                onResend={handleResend}
                loading={otpLoading}
                mobile={otpMobile}
            />

            {/* ── Main Layout ── */}
            <div className="cv-layout" style={S.layout}>

                {/* ─────────── BRAND SIDE ─────────── */}
                <div className="cv-brand" style={S.brand}>
                    <div style={S.logoWrap}>
                        <IconBulb />
                    </div>

                    <h1 style={S.brandTitle}>CareerVerse AI</h1>

                    <p style={S.brandSub}>
                        Your AI-powered career compass. Navigate the future of your professional journey with precision and intelligence.
                    </p>

                    <div style={S.badgesRow}>
                        <div style={S.badgeItem}>
                            <div style={{ ...S.dotBase, background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.7)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                            Intelligent Analysis
                        </div>
                        <div style={S.badgeItem}>
                            <div style={{ ...S.dotBase, background: '#6366f1', boxShadow: '0 0 10px rgba(99,102,241,0.7)', animation: 'pulseGlow 2s ease-in-out infinite', animationDelay: '1s' }} />
                            Expert Guidance
                        </div>
                    </div>
                </div>

                {/* ─────────── AUTH CARD ─────────── */}
                <div style={S.authWrap}>
                    <div className="cv-card" style={S.card}>

                        {/* ════════ LOGIN PANEL ════════ */}
                        {mode === 'login' && (
                            <div>
                                <div style={S.cardHeader}>
                                    <h2 style={S.cardTitle}>Welcome Back</h2>
                                    <p style={S.cardSub}>Login to continue your journey</p>
                                </div>

                                {/* Tabs */}
                                <div style={S.tabs}>
                                    <button style={{ ...S.tabBase, ...S.tabActive }}>Sign In</button>
                                    <button style={{ ...S.tabBase, ...S.tabInactive }} onClick={() => switchMode('signup')}>Sign Up</button>
                                </div>

                                <form onSubmit={handleLogin} noValidate>
                                    <div style={S.fields}>
                                        {/* Username */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Username</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconUser /></span>
                                                <input
                                                    className="cv-input"
                                                    type="text"
                                                    placeholder="Enter your username"
                                                    value={lf.username}
                                                    onChange={lFieldChange('username')}
                                                    style={inputStyle(errors.username)}
                                                />
                                            </div>
                                            <FieldError msg={errors.username} />
                                        </div>

                                        {/* Password */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Password</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconLock /></span>
                                                <input
                                                    className="cv-input"
                                                    type={showLPw ? 'text' : 'password'}
                                                    placeholder="Enter your password"
                                                    value={lf.password}
                                                    onChange={lFieldChange('password')}
                                                    style={inputStyle(errors.password, true)}
                                                />
                                                <EyeBtn show={showLPw} onToggle={() => setShowLPw(s => !s)} />
                                            </div>
                                            <FieldError msg={errors.password} />
                                        </div>

                                        {/* Mobile */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Mobile Number</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconPhone /></span>
                                                <input
                                                    className="cv-input"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="10-digit mobile number"
                                                    value={lf.mobile}
                                                    onChange={lFieldChange('mobile')}
                                                    maxLength={10}
                                                    style={inputStyle(errors.mobile)}
                                                />
                                            </div>
                                            <FieldError msg={errors.mobile} />
                                        </div>

                                        {/* Remember + Forgot */}
                                        <div style={S.rowBetween}>
                                            <label style={S.rememberLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={remember}
                                                    onChange={e => setRemember(e.target.checked)}
                                                    style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
                                                />
                                                Remember me
                                            </label>
                                            <button
                                                type="button"
                                                className="cv-forgot"
                                                style={S.forgotLink}
                                                onClick={() => switchMode('forgot')}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>

                                        {/* Submit */}
                                        <button type="submit" className="cv-submit" disabled={loading} style={S.submitBtn}>
                                            {loading ? <><Spinner /> Signing in...</> : 'Sign In to Account'}
                                        </button>
                                    </div>
                                </form>

                                {/* Divider */}
                                <div style={S.dividerWrap}>
                                    <div style={S.dividerLine} />
                                    <span style={S.dividerText}>or</span>
                                    <div style={S.dividerLine} />
                                </div>

                                <p style={S.switchText}>
                                    New to CareerVerse?
                                    <button className="cv-switch" style={S.switchBtn} onClick={() => switchMode('signup')}>
                                        Sign up free
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ════════ SIGNUP PANEL ════════ */}
                        {mode === 'signup' && (
                            <div>
                                <div style={S.cardHeader}>
                                    <h2 style={S.cardTitle}>Create Account</h2>
                                    <p style={S.cardSub}>Join the future of career guidance</p>
                                </div>

                                {/* Tabs */}
                                <div style={S.tabs}>
                                    <button style={{ ...S.tabBase, ...S.tabInactive }} onClick={() => switchMode('login')}>Sign In</button>
                                    <button style={{ ...S.tabBase, ...S.tabActive }}>Sign Up</button>
                                </div>

                                <form onSubmit={handleSignup} noValidate>
                                    <div style={S.fields}>
                                        {/* Full Name */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Full Name</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconUser /></span>
                                                <input
                                                    className="cv-input"
                                                    type="text"
                                                    placeholder="Your full name"
                                                    value={sf.full_name}
                                                    onChange={sFieldChange('full_name')}
                                                    style={inputStyle(errors.full_name)}
                                                />
                                            </div>
                                            <FieldError msg={errors.full_name} />
                                        </div>

                                        {/* Username */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Username</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconUser /></span>
                                                <input
                                                    className="cv-input"
                                                    type="text"
                                                    placeholder="Choose a username"
                                                    value={sf.username}
                                                    onChange={sFieldChange('username')}
                                                    style={inputStyle(errors.username)}
                                                />
                                            </div>
                                            <FieldError msg={errors.username} />
                                        </div>

                                        {/* Mobile */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Mobile Number</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconPhone /></span>
                                                <input
                                                    className="cv-input"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="10-digit mobile number"
                                                    value={sf.mobile}
                                                    onChange={sFieldChange('mobile')}
                                                    maxLength={10}
                                                    style={inputStyle(errors.mobile)}
                                                />
                                            </div>
                                            <FieldError msg={errors.mobile} />
                                        </div>

                                        {/* Password */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Password</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconLock /></span>
                                                <input
                                                    className="cv-input"
                                                    type={showSPw ? 'text' : 'password'}
                                                    placeholder="Create a strong password"
                                                    value={sf.password}
                                                    onChange={sFieldChange('password')}
                                                    style={inputStyle(errors.password, true)}
                                                />
                                                <EyeBtn show={showSPw} onToggle={() => setShowSPw(s => !s)} />
                                            </div>
                                            <StrengthBar password={sf.password} />
                                            <FieldError msg={errors.password} />
                                        </div>

                                        {/* Confirm Password */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Confirm Password</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconLock /></span>
                                                <input
                                                    className="cv-input"
                                                    type={showSCPw ? 'text' : 'password'}
                                                    placeholder="Re-enter your password"
                                                    value={sf.confirm_password}
                                                    onChange={sFieldChange('confirm_password')}
                                                    style={inputStyle(errors.confirm_password, true)}
                                                />
                                                <EyeBtn show={showSCPw} onToggle={() => setShowSCPw(s => !s)} />
                                            </div>
                                            <FieldError msg={errors.confirm_password} />
                                        </div>

                                        {/* Submit */}
                                        <button type="submit" className="cv-submit" disabled={loading} style={S.submitBtn}>
                                            {loading ? <><Spinner /> Creating...</> : 'Get Started Now'}
                                        </button>
                                    </div>
                                </form>

                                <p style={{ ...S.switchText, marginTop: '1.5rem' }}>
                                    Already have an account?
                                    <button className="cv-switch" style={S.switchBtn} onClick={() => switchMode('login')}>
                                        Sign in here
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ════════ FORGOT PANEL ════════ */}
                        {mode === 'forgot' && (
                            <div>
                                <button
                                    type="button"
                                    className="cv-back"
                                    style={S.backBtn}
                                    onClick={() => switchMode('login')}
                                >
                                    <IconArrowLeft />
                                    Back to Sign In
                                </button>

                                <div style={S.cardHeader}>
                                    <h2 style={S.cardTitle}>Reset Password</h2>
                                    <p style={S.cardSub}>Recover your account access securely</p>
                                </div>

                                <form onSubmit={handleForgot}>
                                    <div style={S.fields}>
                                        {/* Mobile */}
                                        <div style={S.fieldGroup}>
                                            <label style={S.fieldLabel}>Mobile Number</label>
                                            <div style={S.fieldWrap}>
                                                <span style={S.fieldIcon}><IconPhone /></span>
                                                <input
                                                    className="cv-input"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="10-digit mobile number"
                                                    value={fMobile}
                                                    onChange={e => setFMobile(e.target.value)}
                                                    maxLength={10}
                                                    disabled={fStep === 2}
                                                    style={{ ...inputStyle(false), opacity: fStep === 2 ? 0.6 : 1 }}
                                                />
                                            </div>
                                        </div>

                                        {/* New Password (step 2) */}
                                        {fStep === 2 && (
                                            <div style={S.fieldGroup}>
                                                <label style={S.fieldLabel}>New Password</label>
                                                <div style={S.fieldWrap}>
                                                    <span style={S.fieldIcon}><IconLock /></span>
                                                    <input
                                                        className="cv-input"
                                                        type="password"
                                                        placeholder="Min 6 characters"
                                                        value={fNewPw}
                                                        onChange={e => setFNewPw(e.target.value)}
                                                        style={inputStyle(false)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button type="submit" className="cv-submit" disabled={loading} style={S.submitBtn}>
                                            {loading
                                                ? <><Spinner /> Sending...</>
                                                : fStep === 1 ? 'Send Verification Code' : 'Update Password'
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <p style={S.footer}>
                        &copy; {new Date().getFullYear()} CareerVerse AI &bull; Intelligent Career Solutions
                    </p>
                </div>
            </div>
        </div>
    );
}
