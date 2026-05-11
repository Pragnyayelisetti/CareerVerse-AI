import { useState, useEffect, useRef } from "react";

const TOPICS = [
    { id: 1, name: "Upskilling & Online Certifications", category: "Skills", emoji: "📜", tags: ["upskill", "certification", "course", "learn", "online", "aws", "google"] },
    { id: 2, name: "Salary Negotiation & Hike", category: "Salary", emoji: "💰", tags: ["salary", "hike", "negotiation", "appraisal", "increment", "raise", "package"] },
    { id: 3, name: "Career Switch Guide", category: "Career", emoji: "🔀", tags: ["career switch", "change job", "domain change", "new field", "transition"] },
    { id: 4, name: "MBA While Working (Executive MBA)", category: "Education", emoji: "🎓", tags: ["mba", "executive mba", "emba", "part time", "weekend", "distance", "cat", "gmat"] },
    { id: 5, name: "Government Job from Private Sector", category: "Govt", emoji: "🏛️", tags: ["govt job", "upsc", "ssc", "banking", "government", "psu", "gate", "ibps"] },
    { id: 6, name: "Freelancing as Side Income", category: "Income", emoji: "💻", tags: ["freelance", "side income", "fiverr", "upwork", "moonlighting", "extra money"] },
    { id: 7, name: "Performance Review Preparation", category: "Career", emoji: "📊", tags: ["performance", "review", "appraisal", "kpi", "goals", "feedback", "promotion"] },
    { id: 8, name: "LinkedIn & Personal Branding", category: "Skills", emoji: "🌐", tags: ["linkedin", "personal brand", "profile", "networking", "visibility", "social media"] },
    { id: 9, name: "How to Get Promoted Faster", category: "Career", emoji: "🚀", tags: ["promotion", "growth", "senior", "lead", "manager", "faster", "advance"] },
    { id: 10, name: "Starting a Business While Employed", category: "Business", emoji: "🏢", tags: ["startup", "business", "entrepreneur", "side business", "moonlighting", "venture"] },
    { id: 11, name: "International Job Opportunities", category: "Abroad", emoji: "✈️", tags: ["abroad", "international", "usa", "uk", "canada", "germany", "job", "visa", "work permit"] },
    { id: 12, name: "Resume & Interview Preparation", category: "Skills", emoji: "📝", tags: ["resume", "cv", "interview", "job hunt", "job search", "hr", "preparation"] },
    { id: 13, name: "Tax Saving for Salaried Employees", category: "Finance", emoji: "🧾", tags: ["tax", "itr", "80c", "saving", "deduction", "salary", "income tax", "pf"] },
    { id: 14, name: "Investments & Wealth Building", category: "Finance", emoji: "📈", tags: ["investment", "mutual fund", "sip", "stocks", "wealth", "savings", "fd", "ppf"] },
    { id: 15, name: "Work-Life Balance & Burnout", category: "Wellbeing", emoji: "🧘", tags: ["burnout", "stress", "work life", "balance", "mental health", "wellbeing", "toxic"] },
    { id: 16, name: "Remote Work & Global Jobs", category: "Abroad", emoji: "🌍", tags: ["remote", "work from home", "wfh", "global", "digital nomad", "remote job"] },
];

const CATEGORIES = ["All", "Skills", "Salary", "Career", "Education", "Govt", "Income", "Business", "Abroad", "Finance", "Wellbeing"];

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

export default function EmployeeGuide() {
    const profile = JSON.parse(localStorage.getItem("student_profile") || "{}");
    const userName = profile.name || "Professional";
    const userBudget = profile.budget || "medium";
    const userState = profile.state || "India";
    const userCity = profile.city || "";

    const budgetLabel = BUDGET_LABELS[userBudget] || "any budget";
    const locationLabel = userCity ? `${userCity}, ${userState}` : userState;

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [filtered, setFiltered] = useState(TOPICS);
    const [aiCard, setAiCard] = useState(null);
    const [searching, setSearching] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicDetail, setTopicDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "ai",
            text: `Hi ${userName}! 👋 Welcome to your Career Growth Hub.\n\nWhether you want a salary hike, career switch, side income, or to upskill — I've got you covered.\n\nBudget: ${budgetLabel} | Location: ${locationLabel}\n\nWhat's your current goal?`,
        },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);
    const searchTimer = useRef(null);

    useEffect(() => {
        let f = TOPICS;
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
                `You are an AI career advisor for Indian working professionals.
Rules:
- Respond ONLY with valid JSON. No markdown. No extra explanation.
- Give practical, actionable advice relevant to salaried employees in India.`,
                `An Indian working professional searched for: "${q}"

Return JSON:
{
  "name": "topic/skill/path name",
  "emoji": "one relevant emoji",
  "category": "Skills/Salary/Career/Education/Govt/Income/Business/Abroad/Finance/Wellbeing",
  "description": "2-3 sentences explaining this clearly for a working professional",
  "timeToAchieve": "X weeks / months",
  "investmentNeeded": "Free / ₹X–₹Y",
  "potentialGain": "salary hike % or income potential",
  "topResources": ["Resource/Platform 1", "Resource/Platform 2", "Resource/Platform 3"],
  "careers": ["Outcome 1", "Outcome 2", "Outcome 3"],
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

    async function openTopic(topic) {
        setSelectedTopic({ name: topic.name, emoji: topic.emoji || "💼" });
        setTopicDetail(null);
        setDetailLoading(true);

        const detail = await askGemini(
            "You are an Indian career growth expert for working professionals. Respond ONLY with valid JSON, no markdown, no extra text.",
            `Give complete career guidance on "${topic.name}" for a working professional in India.

Profile:
- Name: ${userName}
- Budget: ${budgetLabel}
- Location: ${locationLabel} (${userState})

IMPORTANT:
- Speak directly to the employee/professional
- Be realistic about timelines, salary hikes, and effort required
- Suggest resources and platforms available in India
- Prioritize options near ${userState} where relevant
- If budget is low, highlight free resources first

Return ONLY this JSON:
{
  "description": "3-sentence practical overview of this topic for a working professional",
  "timeToAchieve": "realistic time to see results",
  "currentMarketDemand": "High / Medium / Low — with one-line reason",
  "investment": {
    "free": "free ways to do this",
    "paid": "₹X–₹Y paid options",
    "total_approx": "₹X–₹Y total realistic cost",
    "budget_note": "honest note for someone with budget ${budgetLabel}"
  },
  "potentialGain": {
    "salaryHike": "X–Y% typical hike or ₹X LPA increase",
    "newRoles": ["Role 1", "Role 2", "Role 3"],
    "timeToHike": "X months typically"
  },
  "topResources": [
    {"name": "Platform/Course/Institute", "city": "Online / City", "state": "${userState}", "type": "Free / Paid", "cost": "Free / ₹X", "note": "why this is recommended"},
    {"name": "Platform/Course/Institute", "city": "Online / City", "state": "Online", "type": "Free / Paid", "cost": "Free / ₹X", "note": "why this is recommended"},
    {"name": "Platform/Course/Institute", "city": "Online / City", "state": "Online", "type": "Free / Paid", "cost": "Free / ₹X", "note": "why this is recommended"},
    {"name": "Platform/Course/Institute", "city": "Online / City", "state": "Online", "type": "Free / Paid", "cost": "Free / ₹X", "note": "why this is recommended"},
    {"name": "Platform/Course/Institute", "city": "Online / City", "state": "Online", "type": "Free / Paid", "cost": "Free / ₹X", "note": "why this is recommended"}
  ],
  "actionPlan": [
    "Week 1–2: specific first action",
    "Month 1: specific milestone",
    "Month 3: specific milestone",
    "Month 6: expected outcome"
  ],
  "commonMistakes": [
    "Mistake 1 most employees make",
    "Mistake 2 most employees make"
  ],
  "proTips": [
    "Expert tip 1 for faster results",
    "Expert tip 2 for faster results",
    "Expert tip 3 for faster results"
  ],
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "nextSteps": "Exact first step ${userName} should take today in ${locationLabel} with budget ${budgetLabel}"
}`
        );

        setTopicDetail(detail);
        setDetailLoading(false);
    }

    function openAiCard(card) {
        setSelectedTopic({ name: card.name, emoji: card.emoji });
        setTopicDetail({
            description: card.description,
            timeToAchieve: card.timeToAchieve,
            currentMarketDemand: "",
            investment: { free: card.investmentNeeded, paid: "", total_approx: "", budget_note: "" },
            potentialGain: { salaryHike: card.potentialGain, newRoles: card.careers || [], timeToHike: "" },
            topResources: card.topResources?.map((r) => ({ name: r, city: "", state: "", type: "", cost: "", note: "" })) || [],
            actionPlan: [],
            commonMistakes: [],
            proTips: [],
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
                            content: `You are a senior career coach and professional development advisor for Indian working employees.

STRICT RULES:
1. NEVER forget the user's location, budget, or previously stated goals.
2. ALWAYS answer EXACTLY what was asked — concise, no fluff.
3. NEVER switch topics unless the user asks.
4. If you don't have exact data, say "Please verify on the official website" — do NOT make up numbers.
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
TONE:
- Direct, confident, like a mentor who has seen it all.
- Motivating but realistic — no false promises.
- Use Indian context (rupees, Indian companies, Indian platforms).

RESPONSE FORMAT:
- SHORT bullet points, one fact per line. No long paragraphs.
- For resources/platforms, use:

📍 **[Platform / Course / Strategy]**
- Cost: Free / ₹X,XXX
- Time: X weeks/months
- Expected outcome: [specific result]
- Best for: [type of employee]

CONTEXT (always remember):
- Name: ${userName}
- Budget: ${budgetLabel}
- Location: ${locationLabel}

COMMON QUESTIONS — handle precisely:
- "How to get a hike?" → Negotiation script + timing + market data
- "Should I switch jobs?" → Ask years of experience, current salary range, target role
- "Which certification is worth it?" → Give ROI — cost vs salary increase
- "How to do MBA while working?" → Executive MBA options, distance, weekend programs
- "How to start freelancing?" → Platform + skill + first client strategy
- "Best investments for salaried person?" → SIP, PPF, NPS, 80C deductions
- "How to handle toxic workplace?" → Practical steps, not just "leave"

When user mentions multiple goals, handle EACH separately in bullet points then suggest a combined action plan.

Do not respond unnecessarily. Be precise.`,
                        },
                        {
                            role: "user",
                            content: `Name: ${userName}
Budget: ${budgetLabel}
Location: ${locationLabel}

Question:
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

    const QUICK = [
        "How to get a salary hike?",
        "Best certifications for my field",
        "Should I switch jobs?",
        "How to start freelancing?",
        "MBA while working — worth it?",
        "Best investments for salaried person",
    ];

    const accent = "#38bdf8";
    const accentBg = "rgba(56,189,248,0.15)";
    const accentBorder = "rgba(56,189,248,0.35)";
    const accentDark = "#0369a1";

    const s = {
        page: { minHeight: "100vh", background: "linear-gradient(135deg, #020c1a 0%, #041a2e 50%, #020c1a 100%)", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
        header: { padding: "28px 32px 0" },
        profileBadge: { display: "inline-flex", alignItems: "center", gap: 10, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 24, padding: "8px 16px", marginTop: 12 },
        searchWrap: { padding: "20px 32px 0", maxWidth: 640 },
        searchInput: { width: "100%", padding: "14px 16px 14px 46px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" },
        layout: { display: "flex", gap: 24, padding: "24px 32px", alignItems: "flex-start" },
        grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
        card: { background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 18px", cursor: "pointer", transition: "all 0.2s" },
        sidebar: { width: 310, flexShrink: 0, background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 20 },
        overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
        modal: { background: "#020c1a", borderRadius: 24, padding: 32, maxWidth: 720, width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1.5px solid ${accentBorder}`, position: "relative" },
    };

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>💼 Employee Career Hub</h1>
                <p style={{ color: "#94a3b8", marginTop: 4, marginBottom: 0 }}>
                    Grow faster — salary hikes, upskilling, career switch, side income & more
                </p>
                <div style={s.profileBadge}>
                    <span>👔</span>
                    <span style={{ fontSize: 13, color: accent }}>{userName}</span>
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
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search salary hike, certifications, career switch, investments..." style={s.searchInput} />
                    {searching && <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }}>AI searching…</span>}
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
                            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>✨ AI found this for "{query}":</p>
                            <div onClick={() => openAiCard(aiCard)} style={{ background: `linear-gradient(135deg, ${accentBg}, rgba(66,211,146,0.08))`, border: `1.5px solid ${accent}`, borderRadius: 16, padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: 40 }}>{aiCard.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>{aiCard.name}</div>
                                    <div style={{ color: "#c4c4d4", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{aiCard.description}</div>
                                    <div style={{ color: accent, fontSize: 12, marginTop: 8, fontWeight: 600 }}>Click to see full roadmap →</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={s.grid}>
                        {filtered.map((topic) => (
                            <div key={topic.id} onClick={() => openTopic(topic)} style={s.card}
                                onMouseEnter={(e) => { e.currentTarget.style.background = accentBg; e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-4px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                <div style={{ fontSize: 38 }}>{topic.emoji}</div>
                                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 10, lineHeight: 1.4 }}>{topic.name}</div>
                                <div style={{ display: "inline-block", marginTop: 8, padding: "2px 10px", background: accentBg, borderRadius: 10, fontSize: 11, color: accent }}>{topic.category}</div>
                                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 10 }}>Click for full roadmap →</div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && !aiCard && !searching && query && (
                        <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0", fontSize: 15 }}>🤖 Asking AI about "<b>{query}</b>"…</div>
                    )}
                </div>

                {/* Chatbot sidebar */}
                <div style={s.sidebar}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>🤖 AI Career Coach</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Personalized for your goals & location</div>

                    <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: 320 }}>
                        {chatMessages.map((m, i) => (
                            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? accent : "rgba(255,255,255,0.08)", color: m.role === "user" ? "#000" : "#fff", padding: "10px 14px", borderRadius: 14, fontSize: 13, maxWidth: "90%", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
                        ))}
                        {chatLoading && <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 14, fontSize: 13, color: "#94a3b8" }}>Thinking…</div>}
                        <div ref={chatEndRef} />
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {QUICK.map((q) => (
                            <button key={q} onClick={() => setChatInput(q)} style={{ padding: "4px 10px", borderRadius: 12, background: accentBg, border: `1px solid ${accentBorder}`, color: accent, fontSize: 11, cursor: "pointer" }}>{q}</button>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Ask your career question…" style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none" }} />
                        <button onClick={sendChat} style={{ padding: "10px 16px", borderRadius: 12, background: accent, border: "none", color: "#000", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>➤</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTopic && (
                <div style={s.overlay} onClick={() => { setSelectedTopic(null); setTopicDetail(null); }}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelectedTopic(null); setTopicDetail(null); }} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 18 }}>×</button>

                        <div style={{ fontSize: 42 }}>{selectedTopic.emoji}</div>
                        <h2 style={{ margin: "10px 0 4px", fontSize: 24, lineHeight: 1.3 }}>{selectedTopic.name}</h2>

                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, color: accent }}>
                            ✨ Roadmap for {userName} • {budgetLabel} • {locationLabel}
                        </div>

                        {detailLoading ? (
                            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                                <div>AI is building your personalized roadmap…</div>
                                <div style={{ fontSize: 12, marginTop: 8, color: "#555" }}>Tailored for {locationLabel} • {budgetLabel}</div>
                            </div>
                        ) : topicDetail ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 16 }}>

                                <p style={{ color: "#c4c4d4", lineHeight: 1.7, margin: 0 }}>{topicDetail.description}</p>

                                {/* Quick stats */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                                    {[
                                        ["⏱ Time to Result", topicDetail.timeToAchieve],
                                        ["📊 Market Demand", topicDetail.currentMarketDemand],
                                        ["💹 Potential Gain", topicDetail.potentialGain?.salaryHike],
                                    ].map(([label, val]) => val && (
                                        <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                                            <div style={{ color: "#94a3b8", fontSize: 11 }}>{label}</div>
                                            <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13 }}>{val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* New Roles */}
                                {topicDetail.potentialGain?.newRoles?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>🚀 Roles You Can Target</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {topicDetail.potentialGain.newRoles.map((r, i) => (
                                                <span key={i} style={{ padding: "6px 16px", borderRadius: 20, background: accentBg, fontSize: 13, color: accent }}>{r}</span>
                                            ))}
                                        </div>
                                        {topicDetail.potentialGain.timeToHike && (
                                            <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>⏳ Typical time to land these roles: <b style={{ color: "#fff" }}>{topicDetail.potentialGain.timeToHike}</b></div>
                                        )}
                                    </div>
                                )}

                                {/* Investment */}
                                {topicDetail.investment && (
                                    <div style={{ background: accentBg, borderRadius: 14, padding: "16px 20px", border: `1px solid ${accentBorder}` }}>
                                        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>💸 Investment Needed</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                                            {topicDetail.investment.free && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#94a3b8" }}>🆓 Free options</span><b style={{ color: "#42d392" }}>{topicDetail.investment.free}</b></div>}
                                            {topicDetail.investment.paid && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#94a3b8" }}>💳 Paid options</span><b>{topicDetail.investment.paid}</b></div>}
                                            {topicDetail.investment.total_approx && <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}><span style={{ color: accent }}>📌 Total investment</span><b style={{ color: accent }}>{topicDetail.investment.total_approx}</b></div>}
                                            {topicDetail.investment.budget_note && <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(56,189,248,0.08)", borderRadius: 8, fontSize: 12, color: accent }}>💡 {topicDetail.investment.budget_note}</div>}
                                        </div>
                                    </div>
                                )}

                                {/* Top Resources */}
                                {topicDetail.topResources?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>🖥️ Top Resources & Platforms <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>(near {locationLabel})</span></div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {topicDetail.topResources.map((r, i) => (
                                                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}{r.city ? `, ${r.city}` : ""}</div>
                                                            {r.note && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>💬 {r.note}</div>}
                                                            {r.cost && <div style={{ fontSize: 11, color: "#42d392", marginTop: 3 }}>💰 {r.cost}</div>}
                                                        </div>
                                                        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                                                            {r.state && r.state.toLowerCase().includes(userState.toLowerCase()) && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}>📍 Near you</span>}
                                                            {r.type && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: r.type === "Free" ? "rgba(66,211,146,0.15)" : "rgba(255,165,0,0.15)", color: r.type === "Free" ? "#42d392" : "#ffa500" }}>{r.type}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Plan */}
                                {topicDetail.actionPlan?.length > 0 && (
                                    <div style={{ background: "rgba(66,211,146,0.07)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(66,211,146,0.2)" }}>
                                        <div style={{ fontWeight: 700, color: "#42d392", marginBottom: 12, fontSize: 15 }}>🗓️ Your Action Plan</div>
                                        {topicDetail.actionPlan.map((step, i) => (
                                            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                                                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(66,211,146,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#42d392", flexShrink: 0 }}>{i + 1}</div>
                                                <span style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.5 }}>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pro Tips */}
                                {topicDetail.proTips?.length > 0 && (
                                    <div style={{ background: "rgba(56,189,248,0.07)", borderRadius: 14, padding: "16px 20px", border: `1px solid ${accentBorder}` }}>
                                        <div style={{ fontWeight: 700, color: accent, marginBottom: 10, fontSize: 15 }}>⚡ Pro Tips</div>
                                        {topicDetail.proTips.map((t, i) => (
                                            <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 8, display: "flex", gap: 8 }}>
                                                <span style={{ color: accent, flexShrink: 0 }}>✦</span> {t}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Common Mistakes */}
                                {topicDetail.commonMistakes?.length > 0 && (
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15, color: "#ff7070" }}>🚩 Common Mistakes to Avoid</div>
                                        {topicDetail.commonMistakes.map((m, i) => (
                                            <div key={i} style={{ color: "#c4c4d4", fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}>
                                                <span style={{ color: "#ff7070" }}>✗</span> {m}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pros & Cons */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div style={{ background: "rgba(66,211,146,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, color: "#42d392", marginBottom: 8 }}>✅ Pros</div>
                                        {topicDetail.pros?.map((p, i) => <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 5 }}>• {p}</div>)}
                                    </div>
                                    <div style={{ background: "rgba(255,100,100,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, color: "#ff7070", marginBottom: 8 }}>⚠️ Cons</div>
                                        {topicDetail.cons?.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#c4c4d4", marginBottom: 5 }}>• {c}</div>)}
                                    </div>
                                </div>

                                {/* Next Steps */}
                                {topicDetail.nextSteps && (
                                    <div style={{ background: "rgba(255,200,0,0.08)", borderRadius: 12, padding: "16px 20px", border: "1px solid rgba(255,200,0,0.2)" }}>
                                        <div style={{ fontWeight: 700, color: "#ffc800", marginBottom: 8 }}>📌 Your First Step Today</div>
                                        <div style={{ fontSize: 13, color: "#c4c4d4", lineHeight: 1.6 }}>{topicDetail.nextSteps}</div>
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
