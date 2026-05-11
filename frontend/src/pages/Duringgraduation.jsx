import { useState, useEffect, useRef } from "react";

const COURSES = [
    { id: 1, name: "Internships & Live Projects", category: "Experience", emoji: "💼", tags: ["internship", "project", "industry", "work", "experience"] },
    { id: 2, name: "Google / Microsoft Certifications", category: "Tech", emoji: "🏅", tags: ["google", "microsoft", "cloud", "azure", "gcp", "certification"] },
    { id: 3, name: "DSA & Competitive Coding", category: "Tech", emoji: "💻", tags: ["dsa", "leetcode", "coding", "algorithm", "data structures", "cp"] },
    { id: 4, name: "Web Development (Full Stack)", category: "Tech", emoji: "🌐", tags: ["web", "react", "node", "html", "css", "javascript", "fullstack"] },
    { id: 5, name: "Data Science & ML", category: "Tech", emoji: "🤖", tags: ["data science", "machine learning", "ai", "python", "ml", "deep learning"] },
    { id: 6, name: "CA Inter / CMA Inter", category: "Commerce", emoji: "📊", tags: ["ca", "cma", "chartered", "accountant", "inter", "finance"] },
    { id: 7, name: "Stock Market & Finance", category: "Commerce", emoji: "📈", tags: ["stock", "trading", "finance", "investment", "nism", "sebi"] },
    { id: 8, name: "UPSC / State PSC Prep", category: "Govt", emoji: "🏛️", tags: ["upsc", "ias", "ips", "psc", "civil services", "govt"] },
    { id: 9, name: "Banking Exams (IBPS/SBI)", category: "Govt", emoji: "🏦", tags: ["banking", "ibps", "sbi", "po", "clerk", "rbi"] },
    { id: 10, name: "GRE / GMAT Prep", category: "Higher Studies", emoji: "✈️", tags: ["gre", "gmat", "ms", "mba", "abroad", "usa"] },
    { id: 11, name: "GATE Preparation", category: "Higher Studies", emoji: "🎯", tags: ["gate", "m.tech", "psu", "iit", "post graduation", "gate exam"] },
    { id: 12, name: "Digital Marketing", category: "Creative", emoji: "📱", tags: ["digital marketing", "seo", "social media", "content", "ads", "marketing"] },
    { id: 13, name: "Graphic Design / UI UX", category: "Creative", emoji: "🎨", tags: ["design", "ui", "ux", "figma", "canva", "graphic", "creative"] },
    { id: 14, name: "Freelancing Skills", category: "Freelance", emoji: "🧑‍💻", tags: ["freelance", "fiverr", "upwork", "remote", "self-employed"] },
    { id: 15, name: "Language Courses (IELTS/French)", category: "Language", emoji: "🗣️", tags: ["ielts", "toefl", "french", "german", "language", "english"] },
    { id: 16, name: "Entrepreneurship / Startup", category: "Business", emoji: "🚀", tags: ["startup", "entrepreneur", "business", "founder", "idea", "venture"] },
];

const CATEGORIES = ["All", "Tech", "Commerce", "Govt", "Higher Studies", "Creative", "Experience", "Freelance", "Language", "Business"];

const BUDGET_LABELS = {
    low: "Under ₹50,000/yr",
    medium: "₹50K–₹2L/yr",
    high: "₹2L–₹5L/yr",
    premium: "Above ₹5L/yr",
};

async function askGemini(systemPrompt, userPrompt) {
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
                max_tokens: 2000,
            }),
        });
        const data = await res.json();
        if (data.error) { console.error(data.error); return null; }
        const text = data.choices?.[0]?.message?.content || "{}";
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) {
        console.error(err);
        return null;
    }
}

export default function DuringGraduation() {
    const profile = JSON.parse(localStorage.getItem("student_profile") || "{}");
    const studentName = profile.name || "Student";
    const studentBudget = profile.budget || "medium";
    const studentState = profile.state || "India";
    const studentCity = profile.city || "";

    const budgetLabel = BUDGET_LABELS[studentBudget] || "any budget";
    const locationLabel = studentCity ? `${studentCity}, ${studentState}` : studentState;

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [filtered, setFiltered] = useState(COURSES);
    const [aiCard, setAiCard] = useState(null);
    const [searching, setSearching] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetail, setCourseDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "ai",
            text: `Hi ${studentName}! 👋 Still in college? Great time to skill up! Based on your budget (${budgetLabel}) and location (${locationLabel}), I'll suggest the best things to do DURING your graduation. What's your current stream or goal?`,
        },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);
    const searchTimer = useRef(null);

    useEffect(() => {
        let f = COURSES;
        if (category !== "All") f = f.filter((c) => c.category === category);
        if (query.trim()) {
            const q = query.toLowerCase();
            f = f.filter((c) => c.name.toLowerCase().includes(q) || c.tags?.some((t) => t.includes(q)));
        }
        setFiltered(f);
        setAiCard(null);
        if (query.trim().length >= 2 && f.length === 0) {
            clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => fetchAISearch(query), 700);
        }
    }, [query, category]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    async function fetchAISearch(q) {
        setSearching(true);
        try {
            const result = await askGemini(
                `You are an AI education and career assistant for Indian college students.
Rules:
- Respond ONLY with valid JSON.
- No markdown. No extra explanation.
- Suggest realistic skill courses, certifications, or activities to do DURING graduation.`,
                `Indian college student searched for: "${q}"

Return JSON:
{
  "name": "course/skill name",
  "emoji": "one emoji",
  "category": "Tech/Commerce/Govt/Higher Studies/Creative/Experience/Freelance/Language/Business",
  "description": "2-3 sentence overview of why to learn this during college",
  "duration": "X weeks/months",
  "fees": "free / ₹X–₹Y (platform or institute)",
  "eligibility": "any graduation student / specific stream",
  "topPlatforms": ["Platform 1", "Platform 2", "Platform 3"],
  "careers": ["Career 1", "Career 2", "Career 3"],
  "averageSalary": "₹X–₹Y LPA entry level",
  "pros": ["Pro 1", "Pro 2"],
  "cons": ["Con 1", "Con 2"]
}`
            );
            if (result?.name) setAiCard(result);
            else setAiCard(null);
        } catch (err) {
            console.error("AI Search Error:", err);
            setAiCard(null);
        }
        setSearching(false);
    }

    async function openCourse(course) {
        setSelectedCourse({ name: course.name, emoji: course.emoji || "📚" });
        setCourseDetail(null);
        setDetailLoading(true);

        const detail = await askGemini(
            "You are an Indian education expert. Respond ONLY with valid JSON, no markdown, no extra text.",
            `Give complete details for "${course.name}" for a college student in India.

Student profile:
- Budget: ${budgetLabel}
- Location: ${locationLabel} (${studentState})
- Name: ${studentName}

IMPORTANT:
- This is about what to do DURING graduation (not after)
- Suggest free and paid platforms/institutes within the student's budget
- Prioritize platforms/institutes available in or near ${studentState}
- If budget is low, highlight free resources and govt schemes

Return ONLY this JSON:
{
  "description": "3-sentence overview of this skill/course and why to learn it during college",
  "duration": "X weeks / months",
  "eligibility": "who can do this during graduation",
  "fees": {
    "free": "free options (YouTube, NPTEL, etc.)",
    "paid": "₹X–₹Y (paid platforms)",
    "total_approx": "₹X–₹Y total investment",
    "budget_note": "whether this fits the student's budget of ${budgetLabel}"
  },
  "topPlatforms": [
    {"name": "Platform/Institute", "city": "Online / City", "state": "${studentState}", "type": "Free", "fees_per_year": "Free"},
    {"name": "Platform/Institute", "city": "Online / City", "state": "Online", "type": "Paid", "fees_per_year": "₹X"},
    {"name": "Platform/Institute", "city": "Online / City", "state": "Online", "type": "Free", "fees_per_year": "Free"},
    {"name": "Platform/Institute", "city": "Online / City", "state": "Online", "type": "Paid", "fees_per_year": "₹X"},
    {"name": "Platform/Institute", "city": "Online / City", "state": "Online", "type": "Free", "fees_per_year": "Free"}
  ],
  "careers": ["Career 1", "Career 2", "Career 3", "Career 4"],
  "averageSalary": "₹X–₹Y LPA entry level",
  "certifications": ["Certification 1 - issuing body", "Certification 2 - issuing body"],
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "nextSteps": "Specific action plan for ${studentName} in ${locationLabel} with budget ${budgetLabel} to get started today"
}`
        );

        setCourseDetail(detail);
        setDetailLoading(false);
    }

    function openAiCard(card) {
        setSelectedCourse({ name: card.name, emoji: card.emoji });
        setCourseDetail({
            description: card.description,
            duration: card.duration,
            eligibility: card.eligibility,
            fees: { free: card.fees, paid: "", total_approx: "", budget_note: "" },
            topPlatforms: card.topPlatforms?.map((p) => ({ name: p, city: "", state: "", type: "", fees_per_year: "" })) || [],
            careers: card.careers || [],
            averageSalary: card.averageSalary,
            certifications: [],
            pros: card.pros || [],
            cons: card.cons || [],
            nextSteps: "",
        });
    }

    async function sendChat() {
        const msg = chatInput.trim();
        if (!msg) return;
        setChatInput("");
        setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
        setChatLoading(true);
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
                        {
                            role: "system",
                            content: `You are an expert Indian education and career counselor for college students (during graduation).

STRICT RULES:
1. NEVER forget the user's previously stated preferences (location, stream, budget, goals).
2. ALWAYS answer EXACTLY what the user asked — nothing more, nothing less.
3. NEVER switch topics or ask the user to "start fresh."
4. If you don't have exact data, say "I'm not sure about exact details, please verify on the platform website" — do NOT hallucinate.

RESPONSE FORMAT:
- Use SHORT bullet points, one fact per line.
- No long paragraphs.
- Use this structure for each skill/course:

📍 **[Skill / Course Name]**
- Platform: Coursera / NPTEL / Udemy / etc.
- Duration: X weeks / months
- Cost: Free / ₹X,XXX
- Certification: Yes / No
- Best for: [stream or goal]
- Link: [if known]

CONTEXT TRACKING:
- Always remember: Location = ${locationLabel}, Budget = ${budgetLabel}, Student = ${studentName}
- If the user says "tell me more," expand on the SAME skills/courses already listed.
- If the user corrects you, apologize briefly and give the corrected answer immediately.
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
SCOPE:
- Focus ONLY on things to do DURING graduation — certifications, internships, freelancing, competitive exam prep, skill courses.
- Do NOT suggest full degree programs.

When the user selects multiple interests, acknowledge EACH separately in bullet points, then suggest skills that match ALL or MOST combined.

Examples:
- Coding + earn fast → Learn DSA + Full Stack → Freelance on Upwork
- Finance + govt job → CA Inter + IBPS Banking Prep simultaneously
- Design + freelance → Learn Figma/Canva → Start on Fiverr

Do not respond unnecessarily. Answer only what is asked.`,
                        },
                        {
                            role: "user",
                            content: `Student Name: ${studentName}
Budget: ${budgetLabel}
Location: ${locationLabel}

Message:
${msg}`,
                        },
                    ],
                    temperature: 0.8,
                    max_tokens: 700,
                }),
            });
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";
            setChatMessages((prev) => [...prev, { role: "ai", text: reply }]);
        } catch (err) {
            console.error(err);
            setChatMessages((prev) => [...prev, { role: "ai", text: "⚠️ AI is currently unavailable." }]);
        }
        setChatLoading(false);
    }

    const QUICK = ["I'm in B.Tech", "I'm in B.Com", "I want to freelance", "I want a govt job", "I want to go abroad", "I love coding"];

    const s = {
        page: { minHeight: "100vh", background: "linear-gradient(135deg, #0d1b0d 0%, #0a2a1a 50%, #0d1a2a 100%)", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
        header: { padding: "28px 32px 0" },
        profileBadge: { display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(66,211,146,0.12)", border: "1px solid rgba(66,211,146,0.3)", borderRadius: 24, padding: "8px 16px", marginTop: 12 },
        searchWrap: { padding: "20px 32px 0", maxWidth: 640 },
        searchInput: { width: "100%", padding: "14px 16px 14px 46px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" },
        layout: { display: "flex", gap: 24, padding: "24px 32px", alignItems: "flex-start" },
        grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 },
        card: { background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 18px", cursor: "pointer", transition: "all 0.2s" },
        sidebar: { width: 310, flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 20 },
        overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
        modal: { background: "#0d1a0d", borderRadius: 24, padding: 32, maxWidth: 700, width: "100%", maxHeight: "88vh", overflowY: "auto", border: "1.5px solid rgba(66,211,146,0.4)", position: "relative" },
    };

    const accent = "#42d392";
    const accentBg = "rgba(66,211,146,0.2)";
    const accentBorder = "rgba(66,211,146,0.4)";

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🎓 During Graduation</h1>
                <p style={{ color: "#a9a9c8", marginTop: 4, marginBottom: 0 }}>Skills, certifications & internships to do while in college</p>
                <div style={s.profileBadge}>
                    <span>👤</span>
                    <span style={{ fontSize: 13, color: "#42d392" }}>{studentName}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ fontSize: 13, color: "#ffc800" }}>💰 {budgetLabel}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ fontSize: 13, color: "#60a5fa" }}>📍 {locationLabel}</span>
                </div>
            </div>

            {/* Search */}
            <div style={s.searchWrap}>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any skill, certification, or exam..." style={s.searchInput} />
                    {searching && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#a9a9c8", fontSize: 12 }}>AI searching…</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 16px", borderRadius: 20, background: category === cat ? accent : "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{cat}</button>
                    ))}
                </div>
            </div>

            {/* Main */}
            <div style={s.layout}>
                <div style={{ flex: 1 }}>
                    {aiCard && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ color: "#a9a9c8", fontSize: 12, marginBottom: 10 }}>✨ AI found this for "{query}":</p>
                            <div onClick={() => openAiCard(aiCard)} style={{ background: `linear-gradient(135deg, ${accentBg}, rgba(96,165,250,0.1))`, border: `1.5px solid ${accent}`, borderRadius: 16, padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: 40 }}>{aiCard.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>{aiCard.name}</div>
                                    <div style={{ color: "#c4c4d4", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{aiCard.description}</div>
                                    <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>Click to see full details →</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div style={s.grid}>
                        {filtered.map((course) => (
                            <div key={course.id} onClick={() => openCourse(course)} style={s.card}
                                onMouseEnter={(e) => { e.currentTarget.style.background = accentBg; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                <div style={{ fontSize: 38 }}>{course.emoji}</div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10 }}>{course.name}</div>
                                <div style={{ display: "inline-block", marginTop: 8, padding: "2px 10px", background: accentBg, borderRadius: 10, fontSize: 11, color: accent }}>{course.category}</div>
                                <div style={{ color: "#a9a9c8", fontSize: 12, marginTop: 10 }}>Click for full details →</div>
                            </div>
                        ))}
                    </div>
                    {filtered.length === 0 && !aiCard && !searching && query && (
                        <div style={{ color: "#a9a9c8", textAlign: "center", padding: "40px 0", fontSize: 15 }}>🤖 Asking AI about "<b>{query}</b>"…</div>
                    )}
                </div>

                {/* Chatbot sidebar */}
                <div style={s.sidebar}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Career Guide</div>
                    <div style={{ fontSize: 12, color: "#a9a9c8" }}>Personalized for your budget & location</div>
                    <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: 320 }}>
                        {chatMessages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? accent : "rgba(255,255,255,0.09)", color: m.role === "user" ? "#000" : "#fff", padding: "10px 14px", borderRadius: 14, fontSize: 13, maxWidth: "90%", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
                        ))}
                        {chatLoading && <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.09)", padding: "10px 14px", borderRadius: 14, fontSize: 13, color: "#a9a9c8" }}>Thinking…</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {QUICK.map((q) => (
                            <button key={q} onClick={() => setChatInput(q)} style={{ padding: "4px 10px", borderRadius: 12, background: accentBg, border: `1px solid ${accentBorder}`, color: accent, fontSize: 11, cursor: "pointer" }}>{q}</button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Ask anything…" style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none" }} />
                        <button onClick={sendChat} style={{ padding: "10px 16px", borderRadius: 12, background: accent, border: "none", color: "#000", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>➤</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedCourse && (
                <div style={s.overlay} onClick={() => { setSelectedCourse(null); setCourseDetail(null); }}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelectedCourse(null); setCourseDetail(null); }} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>×</button>
                        <div style={{ fontSize: 42 }}>{selectedCourse.emoji}</div>
                        <h2 style={{ margin: "10px 0 4px", fontSize: 26 }}>{selectedCourse.name}</h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8, background: "rgba(66,211,146,0.1)", border: "1px solid rgba(66,211,146,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: accent }}>
                            ✨ Results filtered for {studentName} • {budgetLabel} • {locationLabel}
                        </div>

                        {detailLoading ? (
                            <div style={{ textAlign: "center", color: "#a9a9c8", padding: "48px 0" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                                <div>AI is fetching details for your budget & location…</div>
                                <div style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Finding resources near {locationLabel} within {budgetLabel}</div>
                            </div>
                        ) : courseDetail ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 16 }}>
                                <p style={{ color: "#c4c4d4", lineHeight: 1.7, margin: 0 }}>{courseDetail.description}</p>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                                    {[["⏱ Duration", courseDetail.duration], ["📋 Eligibility", courseDetail.eligibility], ["💼 Avg Salary", courseDetail.averageSalary]].map(([label, val]) => val && (
                                        <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                                            <div style={{ color: "#a9a9c8", fontSize: 11 }}>{label}</div>
                                            <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13 }}>{val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Fees */}
                                <div style={{ background: "rgba(66,211,146,0.08)", borderRadius: 14, padding: "16px 20px", border: `1px solid ${accentBorder}` }}>
                                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>💸 Cost Breakdown</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                                        {courseDetail.fees?.free && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a9a9c8" }}>🆓 Free options</span><b style={{ color: accent }}>{courseDetail.fees.free}</b></div>}
                                        {courseDetail.fees?.paid && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a9a9c8" }}>💳 Paid platforms</span><b>{courseDetail.fees.paid}</b></div>}
                                        {courseDetail.fees?.total_approx && <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}><span style={{ color: accent }}>📌 Total investment</span><b style={{ color: accent }}>{courseDetail.fees.total_approx}</b></div>}
                                        {courseDetail.fees?.budget_note && <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(66,211,146,0.08)", borderRadius: 8, fontSize: 12, color: accent }}>💡 {courseDetail.fees.budget_note}</div>}
                                        {typeof courseDetail.fees === "string" && <div>{courseDetail.fees}</div>}
                                    </div>
                                </div>

                                {/* Platforms */}
                                {courseDetail.topPlatforms?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>🖥️ Top Platforms / Institutes <span style={{ fontSize: 12, color: "#a9a9c8", fontWeight: 400 }}>(near {locationLabel})</span></div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {courseDetail.topPlatforms.map((p, i) => (
                                                <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <div style={{ fontSize: 14 }}>{p.name}{p.city ? `, ${p.city}` : ""}</div>
                                                        {p.fees_per_year && <div style={{ fontSize: 11, color: "#a9a9c8", marginTop: 2 }}>{p.fees_per_year}</div>}
                                                    </div>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        {p.state && p.state.toLowerCase().includes(studentState.toLowerCase()) && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}>📍 Near you</span>}
                                                        {p.type && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: p.type === "Free" ? "rgba(66,211,146,0.15)" : "rgba(255,165,0,0.15)", color: p.type === "Free" ? accent : "#ffa500" }}>{p.type}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Careers */}
                                {courseDetail.careers?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>🚀 Career Options</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {courseDetail.careers.map((c, i) => <span key={i} style={{ padding: "6px 16px", borderRadius: 20, background: accentBg, fontSize: 13, color: accent }}>{c}</span>)}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {courseDetail.certifications?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🏅 Certifications You Can Earn</div>
                                        {courseDetail.certifications.map((c, i) => <div key={i} style={{ color: "#a9a9c8", fontSize: 13, marginBottom: 5 }}>• {c}</div>)}
                                    </div>
                                )}

                                {/* Pros & Cons */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div style={{ background: "rgba(66,211,146,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, color: accent, marginBottom: 8 }}>✅ Pros</div>
                                        {courseDetail.pros?.map((p, i) => <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 5 }}>• {p}</div>)}
                                    </div>
                                    <div style={{ background: "rgba(255,100,100,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, color: "#ff7070", marginBottom: 8 }}>⚠️ Cons</div>
                                        {courseDetail.cons?.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 5 }}>• {c}</div>)}
                                    </div>
                                </div>

                                {/* Next Steps */}
                                {courseDetail.nextSteps && (
                                    <div style={{ background: "rgba(255,200,0,0.08)", borderRadius: 12, padding: "16px 20px", border: "1px solid rgba(255,200,0,0.2)" }}>
                                        <div style={{ fontWeight: 700, color: "#ffc800", marginBottom: 8 }}>📌 What to do now</div>
                                        <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.6 }}>{courseDetail.nextSteps}</div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
