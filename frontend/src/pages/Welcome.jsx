import { useState, useEffect } from "react";

const userTypes = [
    {
        id: "student",
        icon: "🎓",
        title: "Student",
        subtitle: "10th • 12th • Graduation • Post-Grad",
        description: "Get personalized career paths, course guidance, college finder & scholarship recommendations based on your education level.",
        color: "#6C63FF",
        glow: "rgba(108,99,255,0.35)",
        tags: ["Career Roadmap", "Course Finder", "Scholarships", "AI Guidance"],
    },
    {
        id: "parent",
        icon: "👨‍👩‍👧",
        title: "Parent",
        subtitle: "Guide your child's future",
        description: "Explore career options, safe educational paths, financial planning and scholarship opportunities for your child.",
        color: "#FF6B6B",
        glow: "rgba(255,107,107,0.35)",
        tags: ["Career Options", "Safe Paths", "Financial Planning", "Scholarship Guide"],
    },
    {
        id: "employee",
        icon: "💼",
        title: "Employee",
        subtitle: "Working professional",
        description: "Upload your resume and discover upskilling paths, better job domains, skill gap analysis and salary growth ideas.",
        color: "#00C9A7",
        glow: "rgba(0,201,167,0.35)",
        tags: ["Skill Gap Analysis", "Upskilling", "Better Jobs", "Career Switch"],
    },
    {
        id: "scholarship",
        icon: "🔍",
        title: "Scholarship & Internship Finder",
        subtitle: "Find funding & opportunities",
        description: "Discover government, private, state and merit scholarships plus internship opportunities matching your profile.",
        color: "#FFB830",
        glow: "rgba(255,184,48,0.35)",
        tags: ["Govt Scholarships", "Merit Based", "Internships", "AI Eligibility Check"],
    },
];

const studentLevels = [
    { id: "after10", label: "After 10th", icon: "📘", desc: "MPC, BiPC, MEC, CEC, Diploma, ITI, Polytechnic, Arts" },
    { id: "after12", label: "After 12th", icon: "📗", desc: "Engineering, Medical, Degree, Law, Design, CA/CS, Govt Exams" },
    { id: "graduation", label: "During Graduation", icon: "📙", desc: "Course guidance, internships, specializations & scholarships" },
    { id: "postgrad", label: "After Graduation", icon: "📕", desc: "PG courses, job prep, career switch & higher education" },
];

const features = [
    { icon: "🤖", label: "AI Career Engine" },
    { icon: "🎯", label: "Skill Mapping" },
    { icon: "🏛️", label: "College Finder" },
    { icon: "💰", label: "Budget Planner" },
    { icon: "📊", label: "Career Graph" },
    { icon: "🔔", label: "Smart Alerts" },
    { icon: "📝", label: "Resume Builder" },
    { icon: "🌐", label: "AI Chatbot" },
];

export default function Welcome() {
    const [selected, setSelected] = useState(null);
    const [studentLevel, setStudentLevel] = useState(null);
    const [step, setStep] = useState("select"); // select | studentLevel | confirm
    const [animIn, setAnimIn] = useState(false);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        setTimeout(() => setAnimIn(true), 100);
        setParticles(
            Array.from({ length: 18 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 6 + 3,
                duration: Math.random() * 8 + 6,
                delay: Math.random() * 4,
                color: ["#6C63FF", "#FF6B6B", "#00C9A7", "#FFB830"][Math.floor(Math.random() * 4)],
            }))
        );
    }, []);

    const handleSelect = (id) => {
        setSelected(id);
        if (id === "student") {
            setTimeout(() => setStep("studentLevel"), 300);
        }
    };

    const handleContinue = () => {
        if (selected === "student" && !studentLevel) return;
        setStep("confirm");
        setTimeout(() => {
            // Navigate to respective dashboard
            const routes = {
                student:
                    studentLevel === "after10"
                        ? "/dashboard/after10"
                        : studentLevel === "after12"
                            ? "/dashboard/after12"
                            : studentLevel === "graduation"
                                ? "/dashboard/during-grad"
                                : "/dashboard/after-grad",

                parent: "/dashboard/parent",
                employee: "/dashboard/employee",
                scholarship: "/dashboard/scholarship",
            };
            window.location.href = routes[selected] || "/dashboard";
        }, 1800);
    };

    const selectedType = userTypes.find((u) => u.id === selected);

    return (
        <div style={styles.root}>
            {/* Animated background particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        ...styles.particle,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        animation: `floatUp ${p.duration}s ${p.delay}s infinite ease-in-out`,
                    }}
                />
            ))}

            {/* Mesh gradient orbs */}
            <div style={{ ...styles.orb, top: "-10%", left: "-5%", background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)", width: 600, height: 600 }} />
            <div style={{ ...styles.orb, bottom: "-10%", right: "-5%", background: "radial-gradient(circle, rgba(0,201,167,0.15) 0%, transparent 70%)", width: 500, height: 500 }} />
            <div style={{ ...styles.orb, top: "40%", right: "10%", background: "radial-gradient(circle, rgba(255,184,48,0.12) 0%, transparent 70%)", width: 400, height: 400 }} />

            <div style={{ ...styles.container, opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoRow}>
                        <span style={styles.logoIcon}>🌐</span>
                        <span style={styles.logoText}>CareerVerse <span style={styles.logoAI}>AI</span></span>
                    </div>
                    <p style={styles.logoSub}>AI Career & Scholarship Guidance System</p>

                    {step === "select" && (
                        <>
                            <h1 style={styles.headline}>Who are you?</h1>
                            <p style={styles.subline}>Select your profile to get a personalized career journey crafted just for you.</p>
                        </>
                    )}
                    {step === "studentLevel" && (
                        <>
                            <h1 style={styles.headline}>Your education stage?</h1>
                            <p style={styles.subline}>We'll tailor your career roadmap based on where you are right now.</p>
                        </>
                    )}
                    {step === "confirm" && (
                        <>
                            <h1 style={{ ...styles.headline, color: selectedType?.color }}>Setting up your universe ✨</h1>
                            <p style={styles.subline}>Personalizing your AI career dashboard...</p>
                        </>
                    )}
                </div>

                {/* Step: Select User Type */}
                {step === "select" && (
                    <div style={styles.cardsGrid}>
                        {userTypes.map((u, i) => (
                            <div
                                key={u.id}
                                onClick={() => handleSelect(u.id)}
                                style={{
                                    ...styles.card,
                                    borderColor: selected === u.id ? u.color : "rgba(255,255,255,0.08)",
                                    boxShadow: selected === u.id ? `0 0 0 2px ${u.color}, 0 20px 60px ${u.glow}` : "0 4px 30px rgba(0,0,0,0.3)",
                                    transform: selected === u.id ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div style={{ ...styles.cardIconWrap, background: `${u.color}22`, border: `1.5px solid ${u.color}44` }}>
                                    <span style={styles.cardIcon}>{u.icon}</span>
                                </div>
                                <h3 style={{ ...styles.cardTitle, color: selected === u.id ? u.color : "#fff" }}>{u.title}</h3>
                                <p style={styles.cardSubtitle}>{u.subtitle}</p>
                                <p style={styles.cardDesc}>{u.description}</p>
                                <div style={styles.tagsRow}>
                                    {u.tags.map((t) => (
                                        <span key={t} style={{ ...styles.tag, background: `${u.color}18`, color: u.color, border: `1px solid ${u.color}33` }}>{t}</span>
                                    ))}
                                </div>
                                {selected === u.id && (
                                    <div style={{ ...styles.selectedBadge, background: u.color }}>✓ Selected</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Step: Student Level */}
                {step === "studentLevel" && (
                    <div style={styles.levelGrid}>
                        <button onClick={() => { setStep("select"); setSelected(null); setStudentLevel(null); }} style={styles.backBtn}>← Back</button>
                        {studentLevels.map((lvl, i) => (
                            <div
                                key={lvl.id}
                                onClick={() => setStudentLevel(lvl.id)}
                                style={{
                                    ...styles.levelCard,
                                    borderColor: studentLevel === lvl.id ? "#6C63FF" : "rgba(255,255,255,0.08)",
                                    boxShadow: studentLevel === lvl.id ? "0 0 0 2px #6C63FF, 0 16px 50px rgba(108,99,255,0.3)" : "0 4px 24px rgba(0,0,0,0.3)",
                                    transform: studentLevel === lvl.id ? "scale(1.03)" : "scale(1)",
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <span style={styles.levelIcon}>{lvl.icon}</span>
                                <div>
                                    <div style={{ ...styles.levelLabel, color: studentLevel === lvl.id ? "#6C63FF" : "#fff" }}>{lvl.label}</div>
                                    <div style={styles.levelDesc}>{lvl.desc}</div>
                                </div>
                                {studentLevel === lvl.id && <span style={styles.checkMark}>✓</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Step: Confirm / Loading */}
                {step === "confirm" && (
                    <div style={styles.confirmWrap}>
                        <div style={{ ...styles.confirmOrb, background: `radial-gradient(circle, ${selectedType?.color}44 0%, transparent 70%)` }} />
                        <div style={styles.confirmIcon}>{selectedType?.icon}</div>
                        <div style={styles.loadingDots}>
                            <span style={{ ...styles.dot, animationDelay: "0s" }} />
                            <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                            <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                        </div>
                        <p style={{ color: "#aaa", marginTop: 16 }}>Launching your personalized dashboard...</p>
                    </div>
                )}

                {/* CTA Button */}
                {step !== "confirm" && (
                    <div style={styles.ctaWrap}>
                        <button
                            onClick={handleContinue}
                            disabled={!selected || (selected === "student" && !studentLevel)}
                            style={{
                                ...styles.ctaBtn,
                                background: selected ? `linear-gradient(135deg, ${selectedType?.color}, ${selectedType?.color}99)` : "rgba(255,255,255,0.08)",
                                boxShadow: selected ? `0 8px 40px ${selectedType?.glow}` : "none",
                                cursor: selected && (selected !== "student" || studentLevel) ? "pointer" : "not-allowed",
                                opacity: selected && (selected !== "student" || studentLevel) ? 1 : 0.5,
                            }}
                        >
                            {step === "select" && selected === "student" ? "Choose Education Level →" : "Continue to Dashboard →"}
                        </button>
                    </div>
                )}

                {/* Features strip */}
                {step === "select" && (
                    <div style={styles.featuresSection}>
                        <p style={styles.featuresTitle}>Everything you need, all in one place</p>
                        <div style={styles.featuresRow}>
                            {features.map((f) => (
                                <div key={f.label} style={styles.featureChip}>
                                    <span style={styles.featureChipIcon}>{f.icon}</span>
                                    <span style={styles.featureChipLabel}>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080B14; }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

const styles = {
    root: {
        minHeight: "100vh",
        background: "#080B14",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px 60px",
    },
    particle: {
        position: "fixed",
        borderRadius: "50%",
        opacity: 0.5,
        pointerEvents: "none",
        zIndex: 0,
    },
    orb: {
        position: "fixed",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
    },
    container: {
        position: "relative",
        zIndex: 1,
        maxWidth: 1100,
        margin: "0 auto",
    },
    header: {
        textAlign: "center",
        marginBottom: 48,
    },
    logoRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 6,
    },
    logoIcon: { fontSize: 28 },
    logoText: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: "#fff",
        letterSpacing: "-0.5px",
    },
    logoAI: {
        background: "linear-gradient(135deg, #6C63FF, #00C9A7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    logoSub: {
        color: "#666",
        fontSize: 13,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 32,
    },
    headline: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(28px, 5vw, 48px)",
        color: "#fff",
        lineHeight: 1.15,
        marginBottom: 12,
    },
    subline: {
        color: "#888",
        fontSize: 16,
        maxWidth: 500,
        margin: "0 auto",
        lineHeight: 1.6,
    },
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20,
        marginBottom: 36,
    },
    card: {
        background: "rgba(255,255,255,0.03)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
        backdropFilter: "blur(10px)",
        animation: "fadeSlideIn 0.5s both",
    },
    cardIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    cardIcon: { fontSize: 26 },
    cardTitle: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 20,
        marginBottom: 4,
        transition: "color 0.3s",
    },
    cardSubtitle: {
        color: "#666",
        fontSize: 12,
        marginBottom: 12,
        letterSpacing: "0.03em",
    },
    cardDesc: {
        color: "#999",
        fontSize: 13.5,
        lineHeight: 1.6,
        marginBottom: 16,
    },
    tagsRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
    },
    tag: {
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 20,
        letterSpacing: "0.02em",
    },
    selectedBadge: {
        position: "absolute",
        top: 16,
        right: 16,
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 20,
        letterSpacing: "0.05em",
    },
    levelGrid: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 680,
        margin: "0 auto 36px",
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "#888",
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        marginBottom: 4,
        padding: 0,
        fontFamily: "'DM Sans', sans-serif",
    },
    levelCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "20px 24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 18,
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
        animation: "fadeSlideIn 0.4s both",
        backdropFilter: "blur(10px)",
    },
    levelIcon: { fontSize: 28, flexShrink: 0 },
    levelLabel: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 17,
        marginBottom: 4,
        transition: "color 0.3s",
    },
    levelDesc: { color: "#777", fontSize: 13, lineHeight: 1.5 },
    checkMark: {
        marginLeft: "auto",
        background: "#6C63FF",
        color: "#fff",
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
    },
    ctaWrap: {
        textAlign: "center",
        marginBottom: 48,
    },
    ctaBtn: {
        border: "none",
        color: "#fff",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 16,
        padding: "16px 48px",
        borderRadius: 50,
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        letterSpacing: "0.02em",
    },
    confirmWrap: {
        textAlign: "center",
        padding: "60px 0",
        position: "relative",
    },
    confirmOrb: {
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
    },
    confirmIcon: {
        fontSize: 72,
        marginBottom: 28,
        animation: "pulse 1.5s infinite",
        display: "inline-block",
    },
    loadingDots: {
        display: "flex",
        gap: 8,
        justifyContent: "center",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#6C63FF",
        display: "inline-block",
        animation: "pulse 1s infinite",
    },
    featuresSection: {
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 36,
        textAlign: "center",
    },
    featuresTitle: {
        color: "#555",
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 20,
    },
    featuresRow: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
    },
    featureChip: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 30,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 7,
        backdropFilter: "blur(6px)",
    },
    featureChipIcon: { fontSize: 15 },
    featureChipLabel: { color: "#888", fontSize: 13 },
};
