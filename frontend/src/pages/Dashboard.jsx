import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem('cv_user') || 'Explorer';

  const handleLogout = () => {
    localStorage.removeItem('cv_user');
    navigate('/login');
  };

  const features = [
    { icon: '🎯', title: 'Career Explorer', desc: 'Discover paths after 10th, 12th & graduation' },
    { icon: '🧠', title: 'AI Guidance', desc: 'Get personalized advice from Claude AI' },
    { icon: '📊', title: 'Skill Roadmaps', desc: 'Step-by-step plans for your dream career' },
    { icon: '💼', title: 'Job Insights', desc: 'Trends, salaries & in-demand skills' },
  ];

  return (
    <div className="min-h-screen relative font-sans bg-[#030712]">
      <AnimatedBackground />

      <div className="relative" style={{ zIndex: 10 }}>
        {/* Navbar */}
        <nav className="glass border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold font-display bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">CareerVerse AI</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-60">Session Active</span>
                <span className="text-sm text-blue-400 font-bold">{user}</span>
              </div>
              <button onClick={handleLogout} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="text-center mb-24 animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-display mb-8 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#0ea5e9] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Empowering Your</span>
              <br />
              <span className="text-white">Future Journey</span>
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
              Personalized, AI-driven insights for students and professionals. Navigate complex career landscapes with the power of intelligence and data.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card rounded-[2.5rem] p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer group border border-white/5 hover:border-white/10 bg-[#111827]/40 backdrop-blur-2xl flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
              >
                <div className="w-16 h-16 rounded-3xl bg-[#1f2937]/50 flex items-center justify-center text-4xl mb-6 shadow-inner border border-white/5 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 font-display tracking-wide">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium group-hover:text-gray-400 transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Interactive Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            <div className="glass-card rounded-[3.5rem] p-12 lg:p-20 border border-white/5 bg-gradient-to-br from-[#111827]/80 to-[#030712]/90 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
              
              <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 text-indigo-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                </div>
                <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 font-display tracking-tight">Personal AI Career Coach</h2>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">Ready to take the next step? Get instant advice, detailed roadmaps, and personalized skill recommendations based on your unique profile.</p>
                <button className="h-16 px-12 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-[#6366f1] to-[#0ea5e9] hover:from-[#4f46e5] hover:to-[#0284c7] shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-3">
                  Start Conversation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-gray-700 tracking-[0.4em] uppercase font-black">
            &copy; {new Date().getFullYear()} CareerVerse AI
          </p>
          <div className="flex gap-8 text-[10px] text-gray-700 tracking-[0.4em] uppercase font-black">
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
