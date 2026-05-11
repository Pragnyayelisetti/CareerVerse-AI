import { useState, useEffect, useRef } from "react";

// ── Constants ────────────────────────────────────────────────────
const BUDGET_OPTIONS = [
    { key: "very_low", label: "Under ₹30,000/yr", icon: "🏠", desc: "Government colleges, scholarships priority" },
    { key: "low", label: "₹30K–₹75,000/yr", icon: "💵", desc: "Affordable private + government colleges" },
    { key: "medium", label: "₹75K–₹2L/yr", icon: "💰", desc: "Mid-range private colleges" },
    { key: "high", label: "₹2L–₹5L/yr", icon: "💎", desc: "Good private colleges & deemed universities" },
    { key: "premium", label: "Above ₹5L/yr", icon: "🏆", desc: "Top private & national institutes" },
];

const STAGE_OPTIONS = [
    { key: "after10", label: "After 10th", icon: "📗", desc: "Child just finished 10th grade (SSC/CBSE/ICSE)" },
    { key: "after12", label: "After 12th", icon: "📘", desc: "Child just finished 12th / Intermediate" },
    { key: "graduation", label: "During / After Graduation", icon: "🎓", desc: "Child is in college or just graduated" },
];

const STAGE_LABELS = {
    after10: "After 10th",
    after12: "After 12th",
    graduation: "During/After Graduation",
};

const PARENT_TOPICS = [
    { id: 1, emoji: "📚", title: "Best Courses for My Child", desc: "Right courses based on stage & interests", tag: "courses" },
    { id: 2, emoji: "💸", title: "Fee & Budget Planning", desc: "How much will education cost?", tag: "fees" },
    { id: 3, emoji: "🎓", title: "Scholarships & Financial Aid", desc: "Government & private scholarships", tag: "scholarships" },
    { id: 4, emoji: "🏛️", title: "Govt vs Private Colleges", desc: "Which is better for your child?", tag: "colleges" },
    { id: 5, emoji: "🚀", title: "Career Scope & Job Market", desc: "Best careers with future growth", tag: "careers" },
    { id: 6, emoji: "📍", title: "Colleges Near Your Location", desc: "Good colleges in your area", tag: "nearby" },
    { id: 7, emoji: "🏦", title: "Education Loan Guide", desc: "Banks & loan options explained", tag: "loans" },
    { id: 8, emoji: "🎯", title: "Entrance Exams Guide", desc: "Exams your child needs to prepare for", tag: "exams" },
];

const QUICK_QUESTIONS = [
    "What courses suit my child?",
    "How to get a scholarship?",
    "Govt or Private college?",
    "How to apply for education loan?",
    "What if my child scored low marks?",
    "Best career options in 2025?",
];

// ── Groq API ─────────────────────────────────────────────────────
async function askGroq(systemPrompt, userPrompt, maxTokens = 900) {
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: maxTokens,
            }),
        });
        const data = await res.json();
        if (data.error) { console.error(data.error); return null; }
        return data.choices?.[0]?.message?.content || null;
    } catch (err) { console.error(err); return null; }
}

async function askGroqJSON(systemPrompt, userPrompt, maxTokens = 1500) {
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: maxTokens,
            }),
        });
        const data = await res.json();
        if (data.error) { console.error(data.error); return null; }
        const text = data.choices?.[0]?.message?.content || "{}";
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) { console.error(err); return null; }
}

// ── Main Component ───────────────────────────────────────────────
export default function ParentDashboard() {
    // Read base profile from localStorage (set during signup)
    const profile = JSON.parse(localStorage.getItem("student_profile") || "{}");
    const baseStudentName = profile.name || "Your Child";
    const baseState = profile.state || "India";
    const baseCity = profile.city || "";

    // ── Onboarding state (parent picks budget + child stage) ─────
    const parentSetupKey = "parent_setup";
    const savedSetup = JSON.parse(localStorage.getItem(parentSetupKey) || "null");

    const [onboarded, setOnboarded] = useState(!!savedSetup);
    const [setup, setSetup] = useState(savedSetup || {
        parentName: profile.parentName || "",
        studentName: baseStudentName,
        budget: "",
        stage: "",
        state: baseState,
        city: baseCity,
    });
    const [onboardStep, setOnboardStep] = useState(0); // 0=name, 1=stage, 2=budget

    // ── Dashboard state ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("home");
    const [activeTopic, setActiveTopic] = useState(null);
    const [topicContent, setTopicContent] = useState(null);
    const [topicLoading, setTopicLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    const [scholarships, setScholarships] = useState([]);
    const [scholarshipsLoading, setScholarshipsLoading] = useState(false);
    const [scholarshipsLoaded, setScholarshipsLoaded] = useState(false);

    // Derived values from setup
    const parentName = setup.parentName || "Parent";
    const studentName = setup.studentName || "Your Child";
    const budgetObj = BUDGET_OPTIONS.find(b => b.key === setup.budget) || BUDGET_OPTIONS[2];
    const budgetLabel = budgetObj.label;
    const stageLabel = STAGE_LABELS[setup.stage] || "School Level";
    const locationLabel = setup.city ? `${setup.city}, ${setup.state}` : setup.state;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    useEffect(() => {
        if (onboarded && chatMessages.length === 0) {
            setChatMessages([{
                role: "ai",
                text: `Namaste ${parentName}! 🙏 I'm here to help guide ${studentName}'s education.\n\n📋 Your Profile:\n• 📚 Stage: ${stageLabel}\n• 💰 Budget: ${budgetLabel}\n• 📍 Location: ${locationLabel}\n\nAsk me anything — courses, fees, scholarships, colleges. I'll give honest, practical advice!`,
            }]);
        }
    }, [onboarded]);

    // ── Save setup and complete onboarding ───────────────────────
    function completeOnboarding() {
        localStorage.setItem(parentSetupKey, JSON.stringify(setup));
        setOnboarded(true);
    }

    function resetSetup() {
        localStorage.removeItem(parentSetupKey);
        setOnboarded(false);
        setOnboardStep(0);
        setSetup({ parentName: profile.parentName || "", studentName: baseStudentName, budget: "", stage: "", state: baseState, city: baseCity });
        setChatMessages([]);
        setScholarships([]);
        setScholarshipsLoaded(false);
    }

    // ── Load topic ───────────────────────────────────────────────
    async function openTopic(topic) {
        setActiveTopic(topic);
        setActiveTab("topic");
        setTopicContent(null);
        setTopicLoading(true);
        const result = await askGroqJSON(
            "You are an Indian education expert advising parents. Respond ONLY with valid JSON, no markdown, no extra text.",
            `Parent asking about: "${topic.title}"

Profile:
- Child: ${studentName}
- Stage: ${stageLabel}
- Budget: ${budgetLabel}
- Location: ${locationLabel}

Return JSON:
{
  "summary": "2-3 sentence explanation for a parent",
  "keyPoints": [
    {"icon": "emoji", "title": "Point title", "detail": "1-2 sentence detail"}
  ],
  "budgetAdvice": "Specific advice for budget: ${budgetLabel}",
  "locationAdvice": "Specific advice for ${locationLabel}",
  "stageAdvice": "Specific advice for student at stage: ${stageLabel}",
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "warnings": ["Mistake 1", "Mistake 2"]
}`
        );
        setTopicContent(result);
        setTopicLoading(false);
    }

    // ── Load scholarships ────────────────────────────────────────
    async function loadScholarships() {
        setScholarshipsLoading(true);
        const result = await askGroqJSON(
            "You are an Indian education expert. Respond ONLY with valid JSON, no markdown, no extra text. Always include real official government scholarship websites.",
            `List scholarships for Indian student:
- Stage: ${stageLabel}
- State: ${setup.state}
- Budget/Family income level: ${budgetLabel}

Return JSON with at least 7 scholarships:
{
  "scholarships": [
    {
      "name": "Full Official Scholarship Name",
      "by": "Ministry/Organization name",
      "type": "Central Govt / State Govt / Private",
      "amount": "₹X per year or total amount",
      "eligibility": "Who qualifies — marks, income, caste, stage",
      "applicationStart": "Month YYYY or 'Check official website'",
      "deadline": "Month YYYY or 'Typically Month every year'",
      "officialWebsite": "https://actual-official-website.gov.in or real URL",
      "howToApply": "Step-by-step in 1-2 sentences",
      "forStage": "${stageLabel}"
    }
  ]
}

Include:
- NSP (National Scholarship Portal) based scholarships
- ${setup.state} state government scholarships
- At least 1 private scholarship
- Include real URLs like scholarships.gov.in, pfms.nic.in, etc.`
        );
        setScholarships(result?.scholarships || []);
        setScholarshipsLoaded(true);
        setScholarshipsLoading(false);
    }

    // ── Chat ─────────────────────────────────────────────────────
    async function sendChat() {
        const msg = chatInput.trim();
        if (!msg) return;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", text: msg }]);
        setChatLoading(true);
        const reply = await askGroq(
            `You are a trusted Indian education advisor talking to a parent.
STRICT RULES:

• ONLY answer questions related to:
  - education
  - careers
  - colleges
  - courses
  - streams
  - skills
  - jobs
  - scholarships
  - after 10th guidance
  - after 12th guidance

• If the user asks unrelated questions like:
  - movies
  - actors
  - politics
  - sports
  - entertainment
  - personal questions

then politely respond:

"I am designed specifically for education and career guidance. Please ask questions related to studies, careers, colleges, or courses."

• Never answer unrelated topics.
RULES:
1. SHORT, CLEAR answers — use bullet points.
2. Always consider budget (${budgetLabel}) and location (${locationLabel}).
3. Child ${studentName} is at stage: ${stageLabel}.
4. Give fees in Indian Rupees with realistic ranges.
5. Mention colleges near ${locationLabel} when relevant.
6. Be warm, respectful, simple language.
7. Don't suggest things outside their budget unless asked.
Format: 📌 key points, 💰 fees, 📍 location advice, 🎓 next step`,
            `Parent: ${parentName} | Child: ${studentName}
Budget: ${budgetLabel} | Location: ${locationLabel} | Stage: ${stageLabel}

Question: ${msg}`
        );
        setChatMessages(prev => [...prev, { role: "ai", text: reply || "Sorry, I couldn't respond right now." }]);
        setChatLoading(false);
    }

    // ── Colors ───────────────────────────────────────────────────
    const accent = "#f59e0b";
    const accentBg = "rgba(245,158,11,0.15)";
    const accentBorder = "rgba(245,158,11,0.3)";

    // ════════════════════════════════════════════════════════════
    // ONBOARDING SCREENS
    // ════════════════════════════════════════════════════════════
    if (!onboarded) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0f0900, #1a1000, #0a0f1a)",
                fontFamily: "'Segoe UI', sans-serif", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            }}>
                <div style={{ width: "100%", maxWidth: 560 }}>

                    {/* Progress dots */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: i === onboardStep ? 28 : 10, height: 10, borderRadius: 5,
                                background: i <= onboardStep ? accent : "rgba(255,255,255,0.15)",
                                transition: "all 0.3s",
                            }} />
                        ))}
                    </div>

                    {/* ── Step 0: Names ── */}
                    {onboardStep === 0 && (
                        <div style={{ animation: "fadeIn 0.3s ease" }}>
                            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>👨‍👩‍👧</div>
                            <h2 style={{ textAlign: "center", fontSize: 26, margin: "0 0 8px" }}>Welcome, Parent!</h2>
                            <p style={{ textAlign: "center", color: "#a9a9c8", marginBottom: 32, fontSize: 14 }}>
                                Let's set up your profile to give you the best guidance for your child's future.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, color: "#a9a9c8", display: "block", marginBottom: 6 }}>Your Name (Parent)</label>
                                    <input
                                        value={setup.parentName}
                                        onChange={e => setSetup(s => ({ ...s, parentName: e.target.value }))}
                                        placeholder="e.g. Ramesh Kumar"
                                        style={{
                                            width: "100%", padding: "13px 16px", borderRadius: 12,
                                            border: `1.5px solid ${setup.parentName ? accent : "rgba(255,255,255,0.15)"}`,
                                            background: "rgba(255,255,255,0.07)", color: "#fff",
                                            fontSize: 15, outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, color: "#a9a9c8", display: "block", marginBottom: 6 }}>Child's Name</label>
                                    <input
                                        value={setup.studentName}
                                        onChange={e => setSetup(s => ({ ...s, studentName: e.target.value }))}
                                        placeholder="e.g. Priya"
                                        style={{
                                            width: "100%", padding: "13px 16px", borderRadius: 12,
                                            border: `1.5px solid ${setup.studentName ? accent : "rgba(255,255,255,0.15)"}`,
                                            background: "rgba(255,255,255,0.07)", color: "#fff",
                                            fontSize: 15, outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 13, color: "#a9a9c8", display: "block", marginBottom: 6 }}>State</label>
                                        <input
                                            value={setup.state}
                                            onChange={e => setSetup(s => ({ ...s, state: e.target.value }))}
                                            placeholder="e.g. Andhra Pradesh"
                                            style={{
                                                width: "100%", padding: "13px 16px", borderRadius: 12,
                                                border: "1.5px solid rgba(255,255,255,0.15)",
                                                background: "rgba(255,255,255,0.07)", color: "#fff",
                                                fontSize: 14, outline: "none", boxSizing: "border-box",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, color: "#a9a9c8", display: "block", marginBottom: 6 }}>City</label>
                                        <input
                                            value={setup.city}
                                            onChange={e => setSetup(s => ({ ...s, city: e.target.value }))}
                                            placeholder="e.g. Vijayawada"
                                            style={{
                                                width: "100%", padding: "13px 16px", borderRadius: 12,
                                                border: "1.5px solid rgba(255,255,255,0.15)",
                                                background: "rgba(255,255,255,0.07)", color: "#fff",
                                                fontSize: 14, outline: "none", boxSizing: "border-box",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setup.parentName && setup.studentName && setOnboardStep(1)}
                                style={{
                                    width: "100%", marginTop: 28, padding: "15px",
                                    borderRadius: 14, border: "none",
                                    background: setup.parentName && setup.studentName ? accent : "rgba(255,255,255,0.1)",
                                    color: setup.parentName && setup.studentName ? "#000" : "#666",
                                    fontSize: 15, fontWeight: 700, cursor: setup.parentName && setup.studentName ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                }}
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* ── Step 1: Child's Stage ── */}
                    {onboardStep === 1 && (
                        <div>
                            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>📚</div>
                            <h2 style={{ textAlign: "center", fontSize: 24, margin: "0 0 6px" }}>What stage is {setup.studentName || "your child"} at?</h2>
                            <p style={{ textAlign: "center", color: "#a9a9c8", marginBottom: 28, fontSize: 13 }}>
                                This helps us show the right courses, colleges and scholarships
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {STAGE_OPTIONS.map(opt => (
                                    <div
                                        key={opt.key}
                                        onClick={() => setSetup(s => ({ ...s, stage: opt.key }))}
                                        style={{
                                            padding: "18px 20px", borderRadius: 14, cursor: "pointer",
                                            border: `2px solid ${setup.stage === opt.key ? accent : "rgba(255,255,255,0.1)"}`,
                                            background: setup.stage === opt.key ? accentBg : "rgba(255,255,255,0.04)",
                                            display: "flex", alignItems: "center", gap: 16,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <span style={{ fontSize: 32 }}>{opt.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: setup.stage === opt.key ? accent : "#fff" }}>{opt.label}</div>
                                            <div style={{ color: "#a9a9c8", fontSize: 13, marginTop: 3 }}>{opt.desc}</div>
                                        </div>
                                        {setup.stage === opt.key && (
                                            <div style={{
                                                width: 22, height: 22, borderRadius: "50%",
                                                background: accent, display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#000", fontSize: 13, fontWeight: 700, flexShrink: 0,
                                            }}>✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                                <button onClick={() => setOnboardStep(0)} style={{
                                    flex: 1, padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)",
                                    background: "transparent", color: "#fff", fontSize: 14, cursor: "pointer",
                                }}>← Back</button>
                                <button
                                    onClick={() => setup.stage && setOnboardStep(2)}
                                    style={{
                                        flex: 2, padding: "14px", borderRadius: 14, border: "none",
                                        background: setup.stage ? accent : "rgba(255,255,255,0.1)",
                                        color: setup.stage ? "#000" : "#666",
                                        fontSize: 15, fontWeight: 700, cursor: setup.stage ? "pointer" : "not-allowed",
                                    }}
                                >Continue →</button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Budget ── */}
                    {onboardStep === 2 && (
                        <div>
                            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>💰</div>
                            <h2 style={{ textAlign: "center", fontSize: 24, margin: "0 0 6px" }}>What is your annual education budget?</h2>
                            <p style={{ textAlign: "center", color: "#a9a9c8", marginBottom: 28, fontSize: 13 }}>
                                We'll recommend colleges, courses & scholarships that fit this budget
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {BUDGET_OPTIONS.map(opt => (
                                    <div
                                        key={opt.key}
                                        onClick={() => setSetup(s => ({ ...s, budget: opt.key }))}
                                        style={{
                                            padding: "16px 20px", borderRadius: 14, cursor: "pointer",
                                            border: `2px solid ${setup.budget === opt.key ? accent : "rgba(255,255,255,0.1)"}`,
                                            background: setup.budget === opt.key ? accentBg : "rgba(255,255,255,0.04)",
                                            display: "flex", alignItems: "center", gap: 14,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <span style={{ fontSize: 28 }}>{opt.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: setup.budget === opt.key ? accent : "#fff" }}>{opt.label}</div>
                                            <div style={{ color: "#a9a9c8", fontSize: 12, marginTop: 2 }}>{opt.desc}</div>
                                        </div>
                                        {setup.budget === opt.key && (
                                            <div style={{
                                                width: 22, height: 22, borderRadius: "50%",
                                                background: accent, display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#000", fontSize: 13, fontWeight: 700, flexShrink: 0,
                                            }}>✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                                <button onClick={() => setOnboardStep(1)} style={{
                                    flex: 1, padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)",
                                    background: "transparent", color: "#fff", fontSize: 14, cursor: "pointer",
                                }}>← Back</button>
                                <button
                                    onClick={() => setup.budget && completeOnboarding()}
                                    style={{
                                        flex: 2, padding: "14px", borderRadius: 14, border: "none",
                                        background: setup.budget ? accent : "rgba(255,255,255,0.1)",
                                        color: setup.budget ? "#000" : "#666",
                                        fontSize: 15, fontWeight: 700, cursor: setup.budget ? "pointer" : "not-allowed",
                                    }}
                                >🚀 Get Started</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    // MAIN DASHBOARD
    // ════════════════════════════════════════════════════════════

    function renderHome() {
        return (
            <div style={{ padding: "24px 28px" }}>
                {/* Welcome card */}
                <div style={{
                    background: `linear-gradient(135deg, ${accentBg}, rgba(0,0,0,0.2))`,
                    border: `1.5px solid ${accentBorder}`, borderRadius: 20, padding: "22px 26px", marginBottom: 28,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🙏 Namaste, {parentName}!</div>
                            <div style={{ color: "#c4c4d4", fontSize: 13, lineHeight: 1.6 }}>
                                Guiding <b style={{ color: accent }}>{studentName}</b> — {stageLabel}
                            </div>
                        </div>
                        <button onClick={resetSetup} style={{
                            padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.12)", color: "#a9a9c8",
                            fontSize: 11, cursor: "pointer",
                        }}>✏️ Edit Profile</button>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                        {[
                            ["📚", stageLabel, "#c4b8ff"],
                            ["💰", budgetLabel, "#42d392"],
                            ["📍", locationLabel, "#60a5fa"],
                        ].map(([icon, val, color]) => (
                            <div key={val} style={{
                                background: "rgba(0,0,0,0.3)", borderRadius: 10,
                                padding: "8px 14px", fontSize: 12,
                            }}>
                                <span style={{ color }}>{icon} </span>
                                <span style={{ fontWeight: 600 }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topics */}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📋 What do you want to know?</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14, marginBottom: 32 }}>
                    {PARENT_TOPICS.map(topic => (
                        <div key={topic.id} onClick={() => openTopic(topic)}
                            style={{
                                background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)",
                                borderRadius: 16, padding: "18px", cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = accentBg; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ fontSize: 30, marginBottom: 10 }}>{topic.emoji}</div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{topic.title}</div>
                            <div style={{ color: "#a9a9c8", fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>{topic.desc}</div>
                            <div style={{ color: accent, fontSize: 11, marginTop: 10, fontWeight: 600 }}>Tap to learn →</div>
                        </div>
                    ))}
                </div>

                {/* Scholarships */}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🎓 Scholarships for {studentName} ({stageLabel})</div>
                {!scholarshipsLoaded ? (
                    <button onClick={loadScholarships} disabled={scholarshipsLoading} style={{
                        padding: "14px 28px", borderRadius: 14, background: scholarshipsLoading ? "rgba(255,255,255,0.1)" : accent,
                        border: "none", color: scholarshipsLoading ? "#666" : "#000",
                        cursor: scholarshipsLoading ? "wait" : "pointer", fontSize: 14, fontWeight: 700,
                    }}>
                        {scholarshipsLoading ? "🤖 Finding scholarships…" : `🔍 Find Scholarships for ${stageLabel}`}
                    </button>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {scholarships.map((sch, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 16, padding: "18px 20px",
                            }}>
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{sch.name}</div>
                                        <div style={{ color: "#a9a9c8", fontSize: 12, marginTop: 2 }}>By: {sch.by}</div>
                                    </div>
                                    <span style={{
                                        fontSize: 10, padding: "3px 10px", borderRadius: 8, flexShrink: 0,
                                        background: sch.type === "Central Govt" ? "rgba(66,211,146,0.15)" : sch.type === "State Govt" ? "rgba(96,165,250,0.15)" : "rgba(255,165,0,0.15)",
                                        color: sch.type === "Central Govt" ? "#42d392" : sch.type === "State Govt" ? "#60a5fa" : "#ffa500",
                                    }}>{sch.type}</span>
                                </div>

                                {/* Amount + Dates grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                                    {[
                                        ["💰 Amount", sch.amount, "#42d392"],
                                        ["🟢 Opens", sch.applicationStart, "#60a5fa"],
                                        ["⏰ Deadline", sch.deadline, "#ff7070"],
                                    ].map(([label, val, color]) => (
                                        <div key={label} style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "10px 12px" }}>
                                            <div style={{ fontSize: 10, color: "#a9a9c8" }}>{label}</div>
                                            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 3, color }}>{val || "Check website"}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Eligibility */}
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 11, color: "#a9a9c8", marginBottom: 4 }}>✅ Who Can Apply</div>
                                    <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{sch.eligibility}</div>
                                </div>

                                {/* How to Apply */}
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontSize: 11, color: "#a9a9c8", marginBottom: 4 }}>📋 How to Apply</div>
                                    <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{sch.howToApply}</div>
                                </div>

                                {/* Official Website */}
                                {sch.officialWebsite && (
                                    <a
                                        href={sch.officialWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                                            padding: "8px 14px", borderRadius: 10,
                                            background: accentBg, border: `1px solid ${accentBorder}`,
                                            color: accent, fontSize: 12, fontWeight: 600,
                                            textDecoration: "none",
                                        }}
                                    >
                                        🌐 Visit Official Website →
                                    </a>
                                )}
                            </div>
                        ))}
                        <button onClick={() => { setScholarshipsLoaded(false); setScholarships([]); }} style={{
                            padding: "10px", borderRadius: 12, background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)", color: "#a9a9c8",
                            fontSize: 12, cursor: "pointer",
                        }}>🔄 Refresh Scholarships</button>
                    </div>
                )}
            </div>
        );
    }

    function renderChat() {
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {chatMessages.map((m, i) => (
                        <div key={i} style={{
                            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                            background: m.role === "user" ? accent : "rgba(255,255,255,0.08)",
                            color: m.role === "user" ? "#000" : "#fff",
                            padding: "12px 16px", borderRadius: 16,
                            fontSize: 14, maxWidth: "78%", lineHeight: 1.6, whiteSpace: "pre-wrap",
                        }}>{m.text}</div>
                    ))}
                    {chatLoading && (
                        <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: 16, fontSize: 14, color: "#a9a9c8" }}>Thinking…</div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div style={{ padding: "8px 28px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {QUICK_QUESTIONS.map(q => (
                        <button key={q} onClick={() => setChatInput(q)} style={{
                            padding: "5px 12px", borderRadius: 12, background: accentBg,
                            border: `1px solid ${accentBorder}`, color: accent, fontSize: 11, cursor: "pointer",
                        }}>{q}</button>
                    ))}
                </div>
                <div style={{ padding: "12px 28px 20px", display: "flex", gap: 10 }}>
                    <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendChat()}
                        placeholder="Ask anything about your child's education…"
                        style={{
                            flex: 1, padding: "12px 18px", borderRadius: 14,
                            border: `1px solid ${accentBorder}`,
                            background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, outline: "none",
                        }}
                    />
                    <button onClick={sendChat} style={{
                        padding: "12px 20px", borderRadius: 14, background: accent,
                        border: "none", color: "#000", cursor: "pointer", fontSize: 18, fontWeight: 700,
                    }}>➤</button>
                </div>
            </div>
        );
    }

    function renderTopic() {
        return (
            <div style={{ padding: "24px 28px" }}>
                <button onClick={() => { setActiveTab("home"); setActiveTopic(null); setTopicContent(null); }} style={{
                    background: "rgba(255,255,255,0.08)", border: "none", color: "#fff",
                    padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, marginBottom: 20,
                }}>← Back</button>

                {activeTopic && (
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>{activeTopic.emoji}</div>
                        <h2 style={{ margin: "0 0 4px", fontSize: 24 }}>{activeTopic.title}</h2>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
                            background: accentBg, border: `1px solid ${accentBorder}`,
                            borderRadius: 20, padding: "4px 14px", fontSize: 12, color: accent,
                        }}>✨ For {studentName} • {stageLabel} • {budgetLabel} • {locationLabel}</div>

                        {topicLoading ? (
                            <div style={{ textAlign: "center", color: "#a9a9c8", padding: "60px 0" }}>
                                <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
                                <div>Fetching personalised advice…</div>
                            </div>
                        ) : topicContent ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 20px", fontSize: 14, color: "#c4c4d4", lineHeight: 1.7 }}>
                                    {topicContent.summary}
                                </div>

                                {topicContent.keyPoints?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📌 Key Points</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                                            {topicContent.keyPoints.map((kp, i) => (
                                                <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
                                                    <div style={{ fontSize: 22, marginBottom: 6 }}>{kp.icon}</div>
                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{kp.title}</div>
                                                    <div style={{ color: "#a9a9c8", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{kp.detail}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                                    {topicContent.budgetAdvice && (
                                        <div style={{ background: "rgba(245,158,11,0.08)", border: `1px solid ${accentBorder}`, borderRadius: 13, padding: "14px 16px" }}>
                                            <div style={{ fontWeight: 700, color: accent, marginBottom: 6, fontSize: 13 }}>💰 For Your Budget</div>
                                            <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{topicContent.budgetAdvice}</div>
                                        </div>
                                    )}
                                    {topicContent.locationAdvice && (
                                        <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 13, padding: "14px 16px" }}>
                                            <div style={{ fontWeight: 700, color: "#60a5fa", marginBottom: 6, fontSize: 13 }}>📍 Near {locationLabel}</div>
                                            <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{topicContent.locationAdvice}</div>
                                        </div>
                                    )}
                                    {topicContent.stageAdvice && (
                                        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 13, padding: "14px 16px" }}>
                                            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 6, fontSize: 13 }}>📚 For {stageLabel}</div>
                                            <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{topicContent.stageAdvice}</div>
                                        </div>
                                    )}
                                </div>

                                {topicContent.actionSteps?.length > 0 && (
                                    <div style={{ background: "rgba(66,211,146,0.06)", borderRadius: 13, padding: "16px 20px" }}>
                                        <div style={{ fontWeight: 700, color: "#42d392", marginBottom: 12 }}>✅ What to Do Now</div>
                                        {topicContent.actionSteps.map((step, i) => (
                                            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                                <div style={{
                                                    width: 22, height: 22, borderRadius: "50%",
                                                    background: "rgba(66,211,146,0.2)", color: "#42d392",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                                                }}>{i + 1}</div>
                                                <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.6 }}>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {topicContent.warnings?.length > 0 && (
                                    <div style={{ background: "rgba(255,100,100,0.06)", borderRadius: 13, padding: "16px 20px" }}>
                                        <div style={{ fontWeight: 700, color: "#ff7070", marginBottom: 10 }}>⚠️ Mistakes to Avoid</div>
                                        {topicContent.warnings.map((w, i) => (
                                            <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 6 }}>• {w}</div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                                    <span style={{ fontSize: 28 }}>💬</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>Have more questions about this?</div>
                                        <div style={{ fontSize: 13, color: "#a9a9c8", marginTop: 2 }}>Talk to the AI advisor for personalised answers</div>
                                    </div>
                                    <button onClick={() => setActiveTab("chat")} style={{
                                        padding: "10px 18px", borderRadius: 12, background: accent,
                                        border: "none", color: "#000", cursor: "pointer", fontSize: 13, fontWeight: 700,
                                    }}>Ask AI →</button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f0900, #1a1000, #0a0f1a)",
            fontFamily: "'Segoe UI', sans-serif", color: "#fff",
        }}>
            {/* Header */}
            <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 32 }}>👨‍👩‍👧</div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Parent's Guidance Center</h1>
                        <p style={{ color: "#a9a9c8", margin: "2px 0 0", fontSize: 12 }}>
                            Guiding {studentName} • {stageLabel} • {budgetLabel}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 28px" }}>
                {[{ key: "home", label: "🏠 Home" }, { key: "chat", label: "💬 Ask AI" }, ...(activeTopic ? [{ key: "topic", label: `📋 ${activeTopic.title.slice(0, 18)}…` }] : [])].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        padding: "14px 18px", fontSize: 13, fontWeight: 600, border: "none", background: "transparent",
                        color: activeTab === tab.key ? accent : "#a9a9c8",
                        borderBottom: activeTab === tab.key ? `2px solid ${accent}` : "2px solid transparent",
                        cursor: "pointer", transition: "all 0.2s",
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Content */}
            <div style={{ overflowY: "auto" }}>
                {activeTab === "home" && renderHome()}
                {activeTab === "chat" && renderChat()}
                {activeTab === "topic" && renderTopic()}
            </div>
        </div>
    );
}
