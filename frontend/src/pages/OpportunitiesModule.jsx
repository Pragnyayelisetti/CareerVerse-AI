import { useState, useEffect, useRef } from "react";

const GROQ_API_KEY = "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";

const STAGES = [
    {
        id: "after10",
        label: "After 10th",
        icon: "🎓",
        color: "#6C63FF",
        glow: "rgba(108,99,255,0.35)",
        desc: "Class 10 pass / appearing",
    },
    {
        id: "after12",
        label: "After 12th",
        icon: "📘",
        color: "#0EA5E9",
        glow: "rgba(14,165,233,0.35)",
        desc: "Class 12 pass / appearing",
    },
    {
        id: "graduation",
        label: "During Graduation",
        icon: "🏫",
        color: "#00C9A7",
        glow: "rgba(0,201,167,0.35)",
        desc: "Currently in college",
    },
    {
        id: "working",
        label: "After Graduation",
        icon: "💼",
        color: "#FFB830",
        glow: "rgba(255,184,48,0.35)",
        desc: "Working professional",
    },
];

const BOARDS = ["CBSE", "ICSE", "State Board (AP)", "State Board (TS)", "State Board (MH)", "State Board (KA)", "State Board (TN)", "IB", "Other"];
const STREAMS_12 = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities", "Vocational"];
const SALARY_RANGES = ["Under ₹3 LPA", "₹3–5 LPA", "₹5–8 LPA", "₹8–12 LPA", "₹12–20 LPA", "Above ₹20 LPA"];
const SKILLS_LIST = ["Python", "JavaScript", "React", "Java", "Data Science", "ML/AI", "Marketing", "Finance", "Design", "Communication", "Management", "Sales", "DevOps", "Cybersecurity", "Cloud", "Writing", "Research"];

async function callGroq(messages, systemPrompt = "") {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
                ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 2000,
        }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

function NotificationBell({ notifications, onOpen }) {
    const unread = notifications.filter((n) => !n.read).length;
    return (
        <button
            onClick={onOpen}
            style={{
                position: "relative",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 18,
                color: "#fff",
                backdropFilter: "blur(10px)",
            }}
            title="Notifications"
        >
            🔔
            {unread > 0 && (
                <span
                    style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        background: "#FF6B6B",
                        color: "#fff",
                        borderRadius: "50%",
                        minWidth: 18,
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                    }}
                >
                    {unread}
                </span>
            )}
        </button>
    );
}

function NotificationPanel({ notifications, onClose, onMarkRead }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 100,
                display: "flex",
                justifyContent: "flex-end",
                backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    height: "100%",
                    background: "#0F1320",
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    padding: 20,
                    overflowY: "auto",
                    color: "#fff",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18 }}>🔔 Notifications</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onMarkRead} style={{ background: "rgba(108,99,255,0.15)", color: "#6C63FF", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                            Mark all read
                        </button>
                        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                            ✕
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {notifications.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#666", padding: 40 }}>No notifications yet</div>
                    ) : (
                        notifications.map((n, i) => (
                            <div
                                key={i}
                                style={{
                                    background: n.read ? "rgba(255,255,255,0.02)" : "rgba(108,99,255,0.08)",
                                    border: `1px solid ${n.read ? "rgba(255,255,255,0.05)" : "rgba(108,99,255,0.25)"}`,
                                    borderRadius: 12,
                                    padding: 14,
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#fff" }}>
                                    {n.type === "closing" ? "⏰" : "🟢"} {n.title}
                                </div>
                                <div style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>{n.message}</div>
                                <div style={{ fontSize: 10, color: "#555" }}>{n.time}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StepProgress({ step, total, color }) {
    return (
        <div style={{ display: "flex", gap: 6, margin: "16px 0 24px" }}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 4,
                        background: i <= step ? color : "rgba(255,255,255,0.08)",
                        transition: "background 0.3s",
                    }}
                />
            ))}
        </div>
    );
}

function OpportunityCard({ item, onNotify, isNotified }) {
    const [expanded, setExpanded] = useState(false);
    const urgency = item.daysLeft <= 2 ? "closing" : item.daysLeft <= 7 ? "soon" : "open";
    const eligColor = item.eligibility >= 70 ? "#00C9A7" : item.eligibility >= 40 ? "#FFB830" : "#FF6B6B";
    const eligLabel = item.eligibility >= 70 ? "✅ Likely Eligible" : item.eligibility >= 40 ? "⚠️ Partially Eligible" : "❌ May Not Qualify";
    const urgencyColor = urgency === "closing" ? "#FF6B6B" : urgency === "soon" ? "#FFB830" : "#00C9A7";

    return (
        <div
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 18,
                marginBottom: 12,
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
                color: "#fff",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 12, background: `${urgencyColor}22`, color: urgencyColor }}>
                            {urgency === "closing" ? `🔴 Closes in ${item.daysLeft}d` : urgency === "soon" ? `🟡 ${item.daysLeft}d left` : `🟢 Open`}
                        </span>
                        {item.type && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "#999" }}>
                                {item.type}
                            </span>
                        )}
                    </div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{item.provider}</div>
                </div>
                <button
                    onClick={() => onNotify(item)}
                    style={{
                        background: isNotified ? "rgba(0,201,167,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isNotified ? "rgba(0,201,167,0.3)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 10,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        color: isNotified ? "#00C9A7" : "#bbb",
                        whiteSpace: "nowrap",
                    }}
                >
                    {isNotified ? "🔔 Notified" : "🔕 Notify me"}
                </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {item.amount && (
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 12, background: "rgba(108,99,255,0.12)", color: "#9F99FF", fontWeight: 600 }}>
                        💰 {item.amount}
                    </span>
                )}
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 12, background: `${eligColor}18`, color: eligColor, fontWeight: 600 }}>
                    {eligLabel}
                </span>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: "#777", flexWrap: "wrap" }}>
                {item.openDate && <span>📅 Opens: {item.openDate}</span>}
                {item.deadline && <span>⏳ Deadline: {item.deadline}</span>}
            </div>

            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#6C63FF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                }}
            >
                {expanded ? "▲ Less" : "▼ More details"}
            </button>

            {expanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
                    {item.description && <p style={{ fontSize: 12.5, color: "#aaa", lineHeight: 1.6 }}>{item.description}</p>}
                    {item.eligibilityCriteria && (
                        <div style={{ fontSize: 12, color: "#999" }}>
                            <strong style={{ color: "#ccc" }}>Eligibility:</strong> {item.eligibilityCriteria}
                        </div>
                    )}
                    {item.salary && <div style={{ fontSize: 12, color: "#00C9A7" }}>💼 {item.salary}</div>}
                    {item.skills && (
                        <div style={{ fontSize: 12, color: "#999" }}>
                            <strong style={{ color: "#ccc" }}>Skills needed:</strong> {item.skills}
                        </div>
                    )}
                    {item.link && (
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 12, color: "#6C63FF", textDecoration: "none", fontWeight: 600 }}
                        >
                            🌐 Official Website ↗
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

function LoadingCards() {
    return (
        <div>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 12,
                        animation: "pulseSkel 1.4s ease-in-out infinite",
                    }}
                >
                    <div style={{ height: 14, width: "60%", background: "rgba(255,255,255,0.06)", borderRadius: 6, marginBottom: 10 }} />
                    <div style={{ height: 10, width: "40%", background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
                </div>
            ))}
        </div>
    );
}

function OpportunitiesModule() {
    const [phase, setPhase] = useState("stage");
    const [selectedStage, setSelectedStage] = useState(null);
    const [onboardStep, setOnboardStep] = useState(0);
    const [profile, setProfile] = useState({});
    const [activeTab, setActiveTab] = useState("scholarships");
    const [opportunities, setOpportunities] = useState({ scholarships: [], internships: [], jobs: [] });
    const [loading, setLoading] = useState(false);
    const [notifiedIds, setNotifiedIds] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [error, setError] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
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

    const stage = STAGES.find((s) => s.id === selectedStage);

    const onboardSteps = {
        after10: [
            { key: "board", label: "Which board did you study in?", type: "select", options: BOARDS },
            { key: "marks10", label: "What are your 10th marks / expected %?", type: "slider", min: 40, max: 100 },
            { key: "state", label: "Which state are you in?", type: "text", placeholder: "e.g. Andhra Pradesh" },
        ],
        after12: [
            { key: "board", label: "Board?", type: "select", options: BOARDS },
            { key: "marks10", label: "10th Marks %", type: "slider", min: 40, max: 100 },
            { key: "stream", label: "12th Stream", type: "select", options: STREAMS_12 },
            { key: "marks12", label: "12th Marks % (actual / expected)", type: "slider", min: 40, max: 100 },
            { key: "state", label: "State", type: "text", placeholder: "e.g. Telangana" },
        ],
        graduation: [
            { key: "college", label: "College / University name", type: "text", placeholder: "e.g. JNTU Hyderabad" },
            { key: "course", label: "Course you're pursuing", type: "text", placeholder: "e.g. B.Tech CSE" },
            { key: "cgpa", label: "Current CGPA", type: "slider", min: 4, max: 10, step: 0.1 },
            { key: "year", label: "Which year?", type: "select", options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"] },
            { key: "skills", label: "Your Skills (select all that apply)", type: "multiskill" },
            { key: "state", label: "State", type: "text", placeholder: "e.g. Andhra Pradesh" },
        ],
        working: [
            { key: "currentRole", label: "Current Job Title", type: "text", placeholder: "e.g. Software Engineer" },
            { key: "currentSalary", label: "Current Salary Range", type: "select", options: SALARY_RANGES },
            { key: "experience", label: "Years of Experience", type: "slider", min: 0, max: 20 },
            { key: "skills", label: "Your Skills (select all that apply)", type: "multiskill" },
            { key: "targetRole", label: "Target Role (what do you want to become?)", type: "text", placeholder: "e.g. Senior Data Scientist" },
        ],
    };

    const currentSteps = selectedStage ? onboardSteps[selectedStage] : [];
    const currentStep = currentSteps[onboardStep];

    function handleStageSelect(id) {
        setSelectedStage(id);
        setProfile({});
        setOnboardStep(0);
        setSelectedSkills([]);
        setPhase("onboard");
        setFetched(false);
        setOpportunities({ scholarships: [], internships: [], jobs: [] });
    }

    function handleNext() {
        if (onboardStep < currentSteps.length - 1) {
            setOnboardStep(onboardStep + 1);
        } else {
            const finalProfile = { ...profile, skills: selectedSkills.join(", ") };
            setProfile(finalProfile);
            setPhase("dashboard");
            fetchOpportunities(finalProfile);
        }
    }

    function handleBack() {
        if (onboardStep > 0) setOnboardStep(onboardStep - 1);
        else setPhase("stage");
    }

    function updateProfile(key, val) {
        setProfile((p) => ({ ...p, [key]: val }));
    }

    async function fetchOpportunities(prof) {
        setLoading(true);
        setFetched(false);
        setError("");

        const profileDesc = Object.entries(prof).map(([k, v]) => `${k}: ${v}`).join(", ");

        const systemPrompt = `You are a scholarship and opportunity advisor for Indian students and professionals. 
Return ONLY valid JSON. No markdown, no explanation. Return real opportunities from official Indian portals only.
Each opportunity must have: name, provider, type, amount (if any), openDate (DD Mon YYYY), deadline (DD Mon YYYY), link (official URL), eligibilityCriteria, description, skills (if applicable), salary (if job), eligibility (0-100 score based on profile).
daysLeft = integer days from today until deadline (approximate, use realistic values between 1-90).`;

        const stagePrompts = {
            after10: `Find 4 real scholarships for 10th pass/appearing Indian students matching this profile: ${profileDesc}.
Return JSON: {"scholarships": [...]}`,
            after12: `Find 5 real scholarships and 3 diploma/short course opportunities for 12th pass Indian students matching: ${profileDesc}.
Return JSON: {"scholarships": [...], "internships": [...]}`,
            graduation: `Find 4 real scholarships AND 5 real internship opportunities from official portals (internshala.com, letsintern.com, ISRO, DRDO, BARC, PSU internships, CSIR, AICTE) for college students matching: ${profileDesc}.
Return JSON: {"scholarships": [...], "internships": [...]}`,
            working: `Find 6 real job openings with BETTER salary than current (${prof.currentSalary}) and better role than current (${prof.currentRole}) from official job portals (naukri.com, linkedin.com, govt jobs from ssc.nic.in, bankersadda etc.) matching skills: ${prof.skills}. Target role: ${prof.targetRole || "senior role"}.
Return JSON: {"jobs": [...]}`,
        };

        try {
            const res = await callGroq([{ role: "user", content: stagePrompts[selectedStage] }], systemPrompt);

            let parsed = {};
            try {
                const cleaned = res.replace(/```json|```/g, "").trim();
                parsed = JSON.parse(cleaned);
            } catch {
                const jsonMatch = res.match(/\{[\s\S]*\}/);
                if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
            }

            const allItems = [...(parsed.scholarships || []), ...(parsed.internships || []), ...(parsed.jobs || [])];

            const newNotifs = [];
            allItems.forEach((item) => {
                if (item.eligibility >= 60) {
                    if (item.daysLeft <= 2) {
                        newNotifs.push({ title: item.name, message: `Closes in ${item.daysLeft} day(s)! You are eligible. Apply now.`, type: "closing", time: "Just now", read: false });
                    } else if (item.daysLeft <= 7) {
                        newNotifs.push({ title: item.name, message: `Deadline approaching in ${item.daysLeft} days. You appear eligible.`, type: "soon", time: "Just now", read: false });
                    }
                    if (item.openDate) {
                        newNotifs.push({ title: item.name, message: `This opportunity opened on ${item.openDate}. You are likely eligible!`, type: "open", time: "Just now", read: false });
                    }
                }
            });

            setNotifications(newNotifs);
            setOpportunities({
                scholarships: parsed.scholarships || [],
                internships: parsed.internships || [],
                jobs: parsed.jobs || [],
            });
            setFetched(true);

            const defaultTab = selectedStage === "working" ? "jobs" : selectedStage === "graduation" ? "internships" : "scholarships";
            setActiveTab(defaultTab);
        } catch (e) {
            setError("Could not fetch opportunities. Please check your Groq API key and try again.");
        }
        setLoading(false);
    }

    const tabConfig = {
        after10: ["scholarships"],
        after12: ["scholarships", "internships"],
        graduation: ["scholarships", "internships"],
        working: ["jobs"],
    };

    const tabs = selectedStage ? tabConfig[selectedStage] : [];
    const tabLabels = {
        scholarships: "🎓 Scholarships",
        internships: "💡 Internships",
        jobs: "💼 Better Jobs",
    };

    function handleNotify(item) {
        const id = item.name;
        if (notifiedIds.includes(id)) return;
        setNotifiedIds((prev) => [...prev, id]);
        setNotifications((prev) => [
            {
                title: `Notification set: ${item.name}`,
                message: `You'll be notified when this ${item.type || "opportunity"} opens and 2 days before it closes.`,
                type: "open",
                time: new Date().toLocaleTimeString(),
                read: false,
            },
            ...prev,
        ]);
    }

    const currentItems = opportunities[activeTab] || [];

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
                        animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}

            {/* Mesh gradient orbs */}
            <div style={{ ...styles.orb, width: 500, height: 500, top: -200, left: -150, background: "radial-gradient(circle, rgba(108,99,255,0.25), transparent 70%)" }} />
            <div style={{ ...styles.orb, width: 400, height: 400, bottom: -150, right: -100, background: "radial-gradient(circle, rgba(0,201,167,0.2), transparent 70%)" }} />
            <div style={{ ...styles.orb, width: 350, height: 350, top: "40%", right: "15%", background: "radial-gradient(circle, rgba(255,184,48,0.15), transparent 70%)" }} />

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoRow}>
                        <span style={styles.logoIcon}>🚀</span>
                        <span style={styles.logoText}>
                            Smart<span style={styles.logoAI}>Opportunities</span>
                        </span>
                    </div>
                    <div style={styles.logoSub}>Scholarships • Internships • Jobs</div>

                    {phase === "stage" && (
                        <>
                            <h1 style={styles.headline}>Where are you in your journey?</h1>
                            <p style={styles.subline}>
                                Pick your stage and we'll surface real opportunities from official Indian portals — personalized for you.
                            </p>
                        </>
                    )}
                    {phase === "onboard" && stage && (
                        <>
                            <h1 style={styles.headline}>{stage.icon} {stage.label}</h1>
                            <p style={styles.subline}>Tell us a bit about yourself so we can personalize your matches.</p>
                        </>
                    )}
                    {phase === "dashboard" && stage && (
                        <>
                            <h1 style={styles.headline}>{stage.icon} Your Opportunities</h1>
                            <p style={styles.subline}>Curated and ranked by your eligibility — verified portals only.</p>
                        </>
                    )}
                </div>

                {/* Stage selection */}
                {phase === "stage" && (
                    <div style={styles.cardsGrid}>
                        {STAGES.map((s, i) => (
                            <div
                                key={s.id}
                                onClick={() => handleStageSelect(s.id)}
                                style={{
                                    ...styles.card,
                                    borderColor: "rgba(255,255,255,0.08)",
                                    animationDelay: `${i * 0.1}s`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = `0 20px 60px ${s.glow}`;
                                    e.currentTarget.style.borderColor = s.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,0,0,0.3)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                }}
                            >
                                <div style={{ ...styles.cardIconWrap, background: `${s.color}22` }}>
                                    <span style={styles.cardIcon}>{s.icon}</span>
                                </div>
                                <div style={{ ...styles.cardTitle, color: "#fff" }}>{s.label}</div>
                                <div style={styles.cardSubtitle}>{s.desc}</div>
                                <div style={styles.cardDesc}>
                                    Real, verified opportunities matched to where you are right now.
                                </div>
                                <div style={styles.tagsRow}>
                                    {["Personalized", "Verified", "AI-Ranked"].map((t) => (
                                        <span key={t} style={{ ...styles.tag, background: `${s.color}18`, color: s.color }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Onboarding */}
                {phase === "onboard" && stage && (
                    <div style={styles.onboardWrap}>
                        <button onClick={handleBack} style={styles.backBtn}>← Back</button>

                        <StepProgress step={onboardStep} total={currentSteps.length} color={stage.color} />

                        <div style={styles.questionLabel}>{currentStep?.label}</div>

                        {currentStep?.type === "select" && (
                            <select
                                value={profile[currentStep.key] || ""}
                                onChange={(e) => updateProfile(currentStep.key, e.target.value)}
                                style={styles.input}
                            >
                                <option value="">Select...</option>
                                {currentStep.options.map((o) => (
                                    <option key={o} value={o} style={{ background: "#0F1320" }}>{o}</option>
                                ))}
                            </select>
                        )}

                        {currentStep?.type === "slider" && (
                            <div>
                                <div style={{ textAlign: "center", fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: stage.color, marginBottom: 12 }}>
                                    {profile[currentStep.key] || currentStep.min}
                                    {currentStep.key === "cgpa" ? "" : "%"}
                                </div>
                                <input
                                    type="range"
                                    min={currentStep.min}
                                    max={currentStep.max}
                                    step={currentStep.step || 1}
                                    value={profile[currentStep.key] || currentStep.min}
                                    onChange={(e) => updateProfile(currentStep.key, e.target.value)}
                                    style={{ width: "100%", accentColor: stage.color }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginTop: 6 }}>
                                    <span>{currentStep.min}{currentStep.key === "cgpa" ? "" : "%"}</span>
                                    <span>{currentStep.max}{currentStep.key === "cgpa" ? "" : "%"}</span>
                                </div>
                            </div>
                        )}

                        {currentStep?.type === "text" && (
                            <input
                                type="text"
                                value={profile[currentStep.key] || ""}
                                placeholder={currentStep.placeholder}
                                onChange={(e) => updateProfile(currentStep.key, e.target.value)}
                                style={styles.input}
                            />
                        )}

                        {currentStep?.type === "multiskill" && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {SKILLS_LIST.map((sk) => {
                                    const picked = selectedSkills.includes(sk);
                                    return (
                                        <button
                                            key={sk}
                                            onClick={() =>
                                                setSelectedSkills((prev) => (picked ? prev.filter((x) => x !== sk) : [...prev, sk]))
                                            }
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: 24,
                                                border: `1.5px solid ${picked ? stage.color : "rgba(255,255,255,0.1)"}`,
                                                background: picked ? `${stage.color}25` : "rgba(255,255,255,0.03)",
                                                color: picked ? "#fff" : "#aaa",
                                                fontSize: 12,
                                                fontWeight: picked ? 700 : 500,
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            {sk}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div style={styles.ctaWrap}>
                            <button
                                onClick={handleNext}
                                disabled={
                                    currentStep?.type === "multiskill"
                                        ? selectedSkills.length === 0
                                        : !profile[currentStep?.key]
                                }
                                style={{
                                    ...styles.ctaBtn,
                                    background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)`,
                                    boxShadow: `0 10px 40px ${stage.glow}`,
                                    opacity:
                                        (currentStep?.type === "multiskill" ? selectedSkills.length === 0 : !profile[currentStep?.key])
                                            ? 0.4
                                            : 1,
                                    cursor:
                                        (currentStep?.type === "multiskill" ? selectedSkills.length === 0 : !profile[currentStep?.key])
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                {onboardStep < currentSteps.length - 1 ? "Next →" : "Find Opportunities 🚀"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard */}
                {phase === "dashboard" && stage && (
                    <div style={styles.dashboardWrap}>
                        {showNotifPanel && (
                            <NotificationPanel
                                notifications={notifications}
                                onClose={() => setShowNotifPanel(false)}
                                onMarkRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                            />
                        )}

                        {/* Top action row */}
                        <div style={styles.dashHeader}>
                            <button
                                onClick={() => { setPhase("stage"); setSelectedStage(null); }}
                                style={styles.iconBtn}
                            >
                                ← Back
                            </button>
                            <div style={{ flex: 1 }} />
                            <button
                                onClick={() => fetchOpportunities(profile)}
                                style={{ ...styles.iconBtn, color: "#6C63FF" }}
                            >
                                🔄 Refresh
                            </button>
                            <NotificationBell notifications={notifications} onOpen={() => setShowNotifPanel(true)} />
                        </div>

                        {/* Profile summary */}
                        <div style={styles.profileCard}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                {Object.entries(profile).map(([k, v]) =>
                                    v ? (
                                        <span key={k} style={styles.profileChip}>
                                            <span style={{ color: "#666", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}: </span>
                                            <strong style={{ color: "#fff" }}>{v}</strong>
                                        </span>
                                    ) : null
                                )}
                                <button
                                    onClick={() => { setPhase("onboard"); setOnboardStep(0); }}
                                    style={{
                                        marginLeft: "auto",
                                        background: "none",
                                        border: `1px solid ${stage.color}`,
                                        color: stage.color,
                                        borderRadius: 10,
                                        padding: "5px 12px",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        {tabs.length > 1 && (
                            <div style={styles.tabBar}>
                                {tabs.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        style={{
                                            flex: 1,
                                            padding: "10px 12px",
                                            borderRadius: 12,
                                            border: "none",
                                            background: activeTab === t ? `linear-gradient(135deg, ${stage.color}, ${stage.color}aa)` : "transparent",
                                            color: activeTab === t ? "#fff" : "#888",
                                            fontWeight: activeTab === t ? 700 : 500,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            transition: "all 0.2s",
                                            boxShadow: activeTab === t ? `0 8px 24px ${stage.glow}` : "none",
                                        }}
                                    >
                                        {tabLabels[t]}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div>
                            {loading && (
                                <div>
                                    <div style={{ textAlign: "center", color: "#888", marginBottom: 16, fontSize: 13 }}>
                                        🔍 Finding real opportunities from official portals...
                                    </div>
                                    <LoadingCards />
                                </div>
                            )}

                            {error && (
                                <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B", padding: 14, borderRadius: 12, fontSize: 13 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {!loading && fetched && currentItems.length === 0 && (
                                <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                                    <p>No {activeTab} found. Try refreshing or updating your profile.</p>
                                </div>
                            )}

                            {!loading &&
                                currentItems.map((item, i) => (
                                    <OpportunityCard
                                        key={i}
                                        item={item}
                                        onNotify={handleNotify}
                                        isNotified={notifiedIds.includes(item.name)}
                                    />
                                ))}

                            {!loading && fetched && currentItems.length > 0 && (
                                <div style={{ marginTop: 20, padding: 14, background: "rgba(255,184,48,0.08)", border: "1px solid rgba(255,184,48,0.2)", borderRadius: 12, fontSize: 12, color: "#FFB830", textAlign: "center" }}>
                                    ⚠️ Always verify on official websites before applying. Dates and eligibility may vary.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
        }
        @keyframes pulseSkel {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        color: "#fff",
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
        filter: "blur(20px)",
    },
    container: {
        position: "relative",
        zIndex: 1,
        maxWidth: 1100,
        margin: "0 auto",
    },
    header: {
        textAlign: "center",
        marginBottom: 40,
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
        marginLeft: 4,
    },
    logoSub: {
        color: "#666",
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 28,
    },
    headline: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(26px, 4.5vw, 42px)",
        color: "#fff",
        lineHeight: 1.15,
        marginBottom: 12,
    },
    subline: {
        color: "#888",
        fontSize: 15,
        maxWidth: 520,
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
    onboardWrap: {
        maxWidth: 600,
        margin: "0 auto",
        background: "rgba(255,255,255,0.03)",
        border: "1.5px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: 32,
        backdropFilter: "blur(16px)",
        animation: "fadeSlideIn 0.4s both",
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "#888",
        fontSize: 13,
        cursor: "pointer",
        padding: 0,
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: 6,
    },
    questionLabel: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 18,
        color: "#fff",
        marginBottom: 18,
    },
    input: {
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        border: "1.5px solid rgba(255,255,255,0.1)",
        fontSize: 14,
        outline: "none",
        background: "rgba(255,255,255,0.04)",
        color: "#fff",
        boxSizing: "border-box",
        fontFamily: "'DM Sans', sans-serif",
    },
    ctaWrap: {
        textAlign: "center",
        marginTop: 28,
    },
    ctaBtn: {
        border: "none",
        color: "#fff",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 15,
        padding: "14px 40px",
        borderRadius: 50,
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        letterSpacing: "0.02em",
    },
    dashboardWrap: {
        maxWidth: 800,
        margin: "0 auto",
        animation: "fadeSlideIn 0.4s both",
    },
    dashHeader: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    iconBtn: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "8px 14px",
        cursor: "pointer",
        fontSize: 12,
        color: "#bbb",
        fontWeight: 600,
        backdropFilter: "blur(10px)",
    },
    profileCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        backdropFilter: "blur(10px)",
    },
    profileChip: {
        fontSize: 11,
        padding: "5px 10px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
    },
    tabBar: {
        display: "flex",
        gap: 8,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 6,
        borderRadius: 14,
        marginBottom: 18,
        backdropFilter: "blur(10px)",
    },
};


export default OpportunitiesModule;
