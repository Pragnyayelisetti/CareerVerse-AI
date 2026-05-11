import { useState, useEffect, useRef } from "react";

const COURSES = [
    { id: 1, name: "MBA / PGDM", category: "Management", emoji: "📈", tags: ["mba", "pgdm", "cat", "management", "business", "iim"] },
    { id: 2, name: "M.Tech / M.E.", category: "Engineering", emoji: "⚙️", tags: ["mtech", "gate", "post graduation", "engineering", "iit"] },
    { id: 3, name: "M.Sc", category: "Science", emoji: "🔬", tags: ["msc", "physics", "chemistry", "maths", "biology", "science"] },
    { id: 4, name: "MS Abroad (USA/Canada/UK)", category: "Abroad", emoji: "✈️", tags: ["ms", "abroad", "usa", "gre", "canada", "uk", "germany"] },
    { id: 5, name: "UPSC Civil Services", category: "Govt", emoji: "🏛️", tags: ["upsc", "ias", "ips", "ifs", "civil services", "government"] },
    { id: 6, name: "SSC / Railway / Banking", category: "Govt", emoji: "🏦", tags: ["ssc", "railway", "banking", "ibps", "sbi", "clerk", "po"] },
    { id: 7, name: "CA Final / CMA Final", category: "Commerce", emoji: "💼", tags: ["ca", "cma", "chartered", "final", "finance", "accountant"] },
    { id: 8, name: "LLB / LLM (Law)", category: "Law", emoji: "⚖️", tags: ["law", "llb", "llm", "lawyer", "advocate", "clat", "judiciary"] },
    { id: 9, name: "PhD / Research", category: "Research", emoji: "🎓", tags: ["phd", "research", "doctorate", "ugc", "net", "professor"] },
    { id: 10, name: "MCA (Computer Applications)", category: "Tech", emoji: "💻", tags: ["mca", "computer", "software", "it", "coding", "programming"] },
    { id: 11, name: "Data Science / AI Bootcamp", category: "Tech", emoji: "🤖", tags: ["data science", "machine learning", "ai", "python", "analytics"] },
    { id: 12, name: "Product Management", category: "Tech", emoji: "📦", tags: ["product manager", "pm", "product management", "agile"] },
    { id: 13, name: "Startup / Entrepreneurship", category: "Business", emoji: "🚀", tags: ["startup", "entrepreneur", "business", "founder", "venture", "funding"] },
    { id: 14, name: "Teaching / B.Ed", category: "Education", emoji: "📚", tags: ["teaching", "bed", "teacher", "school", "ctet", "tet", "education"] },
    { id: 15, name: "Defence (NDA / CDS / AFCAT)", category: "Govt", emoji: "🪖", tags: ["defence", "army", "navy", "airforce", "nda", "cds", "afcat", "military"] },
    { id: 16, name: "Public Health / MPH", category: "Medical", emoji: "🏥", tags: ["public health", "mph", "health", "hospital", "community medicine"] },
];

const CATEGORIES = ["All", "Management", "Engineering", "Science", "Abroad", "Govt", "Commerce", "Law", "Research", "Tech", "Business", "Education", "Medical"];

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

export default function AfterGraduation() {
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
            text: `Hi ${studentName}! 👋 Congratulations on completing graduation! Based on your budget (${budgetLabel}) and location (${locationLabel}), I'll guide you on the best paths ahead. What's your graduation stream or goal?`,
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
                `You are an AI education and career assistant for Indian graduates.
Rules:
- Respond ONLY with valid JSON.
- No markdown. No extra explanation.
- Suggest realistic post-graduation paths, courses, or exams in India.`,
                `Indian graduation student searched for: "${q}"

Return JSON:
{
  "name": "course/path name",
  "emoji": "one emoji",
  "category": "Management/Engineering/Science/Abroad/Govt/Commerce/Law/Research/Tech/Business/Education/Medical",
  "description": "2-3 sentence overview of this path after graduation",
  "duration": "X years / months",
  "fees": "₹X–₹Y per year (govt) and ₹A–₹B (private)",
  "eligibility": "graduation stream + marks + entrance exam",
  "entranceExams": ["Exam 1", "Exam 2"],
  "topColleges": ["College 1 - City", "College 2 - City", "College 3 - City"],
  "careers": ["Career 1", "Career 2", "Career 3"],
  "averageSalary": "₹X–₹Y LPA",
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
            `Give complete details for "${course.name}" for a student who has completed graduation in India.

Student profile:
- Budget: ${budgetLabel}
- Location: ${locationLabel} (${studentState})
- Name: ${studentName}

IMPORTANT:
- This is about paths AFTER graduation
- Recommend colleges/institutes within the student's budget (${budgetLabel})
- Prioritize options in or near ${studentState} first, then other states
- If budget is low, highlight government colleges, scholarships, and free exam prep resources

Return ONLY this JSON:
{
  "description": "3-sentence clear overview of this post-graduation path",
  "duration": "X years",
  "eligibility": "graduation stream + percentage + entrance exam",
  "entranceExams": ["CAT", "GATE", "UPSC", "GRE", "etc"],
  "fees": {
    "government": "₹X–₹Y per year",
    "private": "₹A–₹B per year",
    "total_approx": "₹X–₹Y for full course",
    "budget_note": "whether this fits the student's budget of ${budgetLabel}"
  },
  "topColleges": [
    {"name": "College Name", "city": "City", "state": "${studentState}", "type": "Govt", "fees_per_year": "₹X"},
    {"name": "College Name", "city": "City", "state": "${studentState}", "type": "Private", "fees_per_year": "₹X"},
    {"name": "College Name", "city": "City", "state": "Other State", "type": "Govt", "fees_per_year": "₹X"},
    {"name": "College Name", "city": "City", "state": "Other State", "type": "Private", "fees_per_year": "₹X"},
    {"name": "College Name", "city": "City", "state": "Other State", "type": "Govt", "fees_per_year": "₹X"}
  ],
  "careers": ["Career 1", "Career 2", "Career 3", "Career 4"],
  "averageSalary": "₹X–₹Y LPA starting",
  "scholarships": ["Scholarship name 1 - eligibility", "Scholarship name 2 - eligibility"],
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "nextSteps": "Specific advice for ${studentName} in ${locationLabel} with budget ${budgetLabel} to get into this path"
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
            entranceExams: card.entranceExams || [],
            fees: { government: card.fees, private: "", total_approx: "", budget_note: "" },
            topColleges: card.topColleges?.map((c) => ({ name: c, city: "", state: "", type: "", fees_per_year: "" })) || [],
            careers: card.careers || [],
            averageSalary: card.averageSalary,
            pros: card.pros || [],
            cons: card.cons || [],
            scholarships: [],
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
                            content: `You are an expert Indian education and career counselor for students who have completed graduation.

STRICT RULES:
1. NEVER forget the user's previously stated preferences (location, stream, budget, goals).
2. ALWAYS answer EXACTLY what the user asked — nothing more, nothing less.
3. NEVER suggest colleges outside the user's stated location unless asked.
4. NEVER switch topics or ask the user to "start fresh."
5. If you don't have exact data, say "I'm not sure about exact details, please verify on the college website" — do NOT hallucinate.
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
RESPONSE FORMAT:
- Use SHORT bullet points, one fact per line.
- No long paragraphs.
- Use this structure for each option:

📍 **[Course / Path Name]**
- Type: Government / Private / Online
- Entrance Exam: CAT / GATE / UPSC / GRE / etc.
- Duration: X years
- Approx. Fees: ₹XX,XXX/year
- Hostel: Available / Not Available
- Website: [if known]

CONTEXT TRACKING:
- Always remember: Location = ${locationLabel}, Budget = ${budgetLabel}, Student = ${studentName}
- If the user says "tell me more," expand on the SAME options already listed.
- If the user corrects you, apologize briefly and give the corrected answer immediately.

SCOPE:
- Focus ONLY on paths AFTER graduation — PG degrees, govt exams, abroad studies, professional certifications, jobs, entrepreneurship.
- Do NOT suggest UG-level courses.

When the user selects multiple interests, acknowledge EACH separately in bullet points, then suggest paths that match ALL or MOST combined.

Examples:
- B.Tech + high salary → M.Tech (GATE) at IIT / MS Abroad (GRE)
- B.Com + govt job → CA Final + UPSC / Banking PO (IBPS)
- BA + teaching → B.Ed → CTET → Govt school teacher
- Any stream + startup → Build product + apply to incubators (NASSCOM, T-Hub)

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

    const QUICK = ["I did B.Tech", "I did B.Com", "I did BA / BSc", "I want govt job", "I want to go abroad", "I want to do MBA"];

    const accent = "#f59e0b";
    const accentBg = "rgba(245,158,11,0.18)";
    const accentBorder = "rgba(245,158,11,0.4)";

    const s = {
        page: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1200 0%, #2a1800 50%, #1a0d00 100%)", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
        header: { padding: "28px 32px 0" },
        profileBadge: { display: "inline-flex", alignItems: "center", gap: 10, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 24, padding: "8px 16px", marginTop: 12 },
        searchWrap: { padding: "20px 32px 0", maxWidth: 640 },
        searchInput: { width: "100%", padding: "14px 16px 14px 46px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" },
        layout: { display: "flex", gap: 24, padding: "24px 32px", alignItems: "flex-start" },
        grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 },
        card: { background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 18px", cursor: "pointer", transition: "all 0.2s" },
        sidebar: { width: 310, flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 20 },
        overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
        modal: { background: "#1a1200", borderRadius: 24, padding: 32, maxWidth: 700, width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1.5px solid ${accentBorder}`, position: "relative" },
    };

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🏆 After Graduation</h1>
                <p style={{ color: "#a9a9c8", marginTop: 4, marginBottom: 0 }}>PG courses, govt exams, abroad studies & career paths after degree</p>
                <div style={s.profileBadge}>
                    <span>👤</span>
                    <span style={{ fontSize: 13, color: accent }}>{studentName}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ fontSize: 13, color: "#42d392" }}>💰 {budgetLabel}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ fontSize: 13, color: "#60a5fa" }}>📍 {locationLabel}</span>
                </div>
            </div>

            {/* Search */}
            <div style={s.searchWrap}>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search MBA, GATE, UPSC, MS Abroad, PhD..." style={s.searchInput} />
                    {searching && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#a9a9c8", fontSize: 12 }}>AI searching…</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    {CATEGORIES.map((cat) => (
                        <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 16px", borderRadius: 20, background: category === cat ? accent : "rgba(255,255,255,0.08)", border: "none", color: category === cat ? "#000" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{cat}</button>
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
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, color: accent }}>
                            ✨ Results filtered for {studentName} • {budgetLabel} • {locationLabel}
                        </div>

                        {detailLoading ? (
                            <div style={{ textAlign: "center", color: "#a9a9c8", padding: "48px 0" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                                <div>AI is fetching details for your budget & location…</div>
                                <div style={{ fontSize: 12, marginTop: 8, color: "#666" }}>Finding colleges near {locationLabel} within {budgetLabel}</div>
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

                                {/* Entrance Exams */}
                                {courseDetail.entranceExams?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>📝 Entrance Exams</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {courseDetail.entranceExams.map((e, i) => (
                                                <span key={i} style={{ padding: "6px 16px", borderRadius: 20, background: "rgba(255,165,0,0.15)", fontSize: 13, color: "#ffa500", border: "1px solid rgba(255,165,0,0.3)" }}>{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fees */}
                                <div style={{ background: accentBg, borderRadius: 14, padding: "16px 20px", border: `1px solid ${accentBorder}` }}>
                                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>💸 Fees Breakdown</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                                        {courseDetail.fees?.government && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a9a9c8" }}>🏛 Government colleges</span><b>{courseDetail.fees.government}</b></div>}
                                        {courseDetail.fees?.private && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a9a9c8" }}>🏫 Private colleges</span><b>{courseDetail.fees.private}</b></div>}
                                        {courseDetail.fees?.total_approx && <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}><span style={{ color: accent }}>📌 Total (full course)</span><b style={{ color: accent }}>{courseDetail.fees.total_approx}</b></div>}
                                        {courseDetail.fees?.budget_note && <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, fontSize: 12, color: accent }}>💡 {courseDetail.fees.budget_note}</div>}
                                        {typeof courseDetail.fees === "string" && <div>{courseDetail.fees}</div>}
                                    </div>
                                </div>

                                {/* Colleges */}
                                {courseDetail.topColleges?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>🏛 Top Colleges <span style={{ fontSize: 12, color: "#a9a9c8", fontWeight: 400 }}>(prioritized near {locationLabel})</span></div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {courseDetail.topColleges.map((col, i) => (
                                                <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <div style={{ fontSize: 14 }}>{col.name}{col.city ? `, ${col.city}` : ""}</div>
                                                        {col.fees_per_year && <div style={{ fontSize: 11, color: "#a9a9c8", marginTop: 2 }}>{col.fees_per_year}/yr</div>}
                                                    </div>
                                                    <div style={{ display: "flex", gap: 6 }}>
                                                        {col.state && col.state.toLowerCase().includes(studentState.toLowerCase()) && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}>📍 Near you</span>}
                                                        {col.type && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: col.type === "Govt" ? "rgba(66,211,146,0.15)" : "rgba(255,165,0,0.15)", color: col.type === "Govt" ? "#42d392" : "#ffa500" }}>{col.type}</span>}
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

                                {/* Scholarships */}
                                {courseDetail.scholarships?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>🎓 Scholarships</div>
                                        {courseDetail.scholarships.map((sc, i) => <div key={i} style={{ color: "#a9a9c8", fontSize: 13, marginBottom: 5 }}>• {sc}</div>)}
                                    </div>
                                )}

                                {/* Pros & Cons */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div style={{ background: "rgba(66,211,146,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, color: "#42d392", marginBottom: 8 }}>✅ Pros</div>
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
