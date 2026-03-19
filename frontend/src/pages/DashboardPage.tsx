import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight, Activity, BookOpen, Dumbbell, MessageSquare,
  Wind, Flame, Mountain, Sun, Leaf, Droplets, Star,
  TrendingUp, Heart, Coffee,
} from 'lucide-react';

const AMBER = 'hsl(32 85% 55%)';
const AMBER_DIM = 'hsl(32 60% 42%)';
const GOLD = 'hsl(42 75% 55%)';
const TERRA = 'hsl(20 55% 42%)';
const CARD_BG = 'hsl(22 22% 9%)';
const BORDER = 'hsl(32 20% 14%)';
const TEXT = 'hsl(38 20% 80%)';
const TEXT_MUTED = 'hsl(38 12% 48%)';
const BARK = 'hsl(38 25% 90%)';

const DOSHA_INFO = {
  vata:  { icon: Wind,     color: '#6ab4d4', bg: '#6ab4d41a', label: 'Vata',  trait: 'Creative & Airy',  element: 'Air + Space' },
  pitta: { icon: Flame,    color: '#d47a3a', bg: '#d47a3a1a', label: 'Pitta', trait: 'Sharp & Dynamic',  element: 'Fire + Water' },
  kapha: { icon: Mountain, color: '#6b8f6e', bg: '#6b8f6e1a', label: 'Kapha', trait: 'Calm & Stable',    element: 'Earth + Water' },
};

const QUICK_ACTIONS = [
  { icon: Activity,      title: 'Health Assessment', desc: 'Discover your dosha balance',    url: '/assessment',  color: AMBER,     border: 'hsl(32 50% 28%)' },
  { icon: BookOpen,      title: 'Diet Plan',          desc: 'Seasonal nutrition guidance',    url: '/diet',        color: GOLD,      border: 'hsl(38 45% 28%)' },
  { icon: Dumbbell,      title: 'Dinacharya',         desc: 'Daily Ayurvedic routines',       url: '/exercise',    color: TERRA,     border: 'hsl(20 40% 26%)' },
  { icon: MessageSquare, title: 'AI Assistant',       desc: 'Ask about herbs & remedies',     url: '/chat',        color: '#6ab4d4', border: 'hsl(200 40% 28%)' },
];

const WELLNESS_TIPS = [
  { icon: Coffee,   tip: 'Start with warm water + 1 tsp ghee on an empty stomach — Agni igniter for your day.',      time: 'Morning',    color: AMBER },
  { icon: Leaf,     tip: 'Sip CCF tea (Cumin, Coriander, Fennel) after meals to support Agni naturally.',             time: 'After meals', color: '#6b8f6e' },
  { icon: Droplets, tip: 'Abhyanga — warm sesame oil self-massage calms Vata and nourishes every tissue.',             time: 'Morning',    color: TERRA },
  { icon: Heart,    tip: 'Practice Nadi Shodhana (alternate nostril breathing) for 10 min — resets your nervous system.', time: 'Dawn',   color: GOLD },
  { icon: Star,     tip: 'Walk 100 steps (Shatapavali) after lunch — ignites digestive fire and clears ama.',           time: 'Afternoon', color: AMBER },
];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: `${color}0d`, border: `1.5px solid ${color}25` }}>
      <p className="text-xs font-medium mb-1" style={{ color: `${color}bb` }}>{label}</p>
      <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tipIdx, setTipIdx] = useState(0);
  const [greeting, setGreeting] = useState('Namaste');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const t = setInterval(() => setTipIdx(i => (i + 1) % WELLNESS_TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';
  const userDosha = (profile?.lifestyle_info?.dosha || profile?.lifestyle_info?.primary_dosha) as keyof typeof DOSHA_INFO | undefined;
  const doshaInfo = userDosha ? DOSHA_INFO[userDosha] : null;
  const tip = WELLNESS_TIPS[tipIdx];
  const TipIcon = tip.icon;
  const DoshaIcon = doshaInfo?.icon;

  return (
    <div className="min-h-screen space-y-5 animate-fade-slide-up" style={{ color: TEXT }}>

      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8"
           style={{
             background: 'linear-gradient(135deg, hsl(22 28% 10%), hsl(25 35% 12%), hsl(32 30% 10%))',
             border: `1px solid ${BORDER}`,
             boxShadow: '0 8px 40px hsl(20 40% 4% / 0.8), inset 0 1px 0 hsl(38 30% 22% / 0.08)',
           }}>
        {/* Glow pulse blob */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
             style={{ background: 'radial-gradient(circle, hsl(32 60% 25% / 0.4), transparent)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
        {/* Mandala rings */}
        <div className="absolute top-4 right-8 w-28 h-28 mandala-ring opacity-30 pointer-events-none" />
        <div className="absolute bottom-2 right-32 w-16 h-16 mandala-ring-fast opacity-20 float-animate pointer-events-none" />
        <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 badge-amber mb-3">
              <Leaf className="h-3 w-3" /> Ayurvedic Wellness Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>
              {greeting}, <span className="gradient-text neon-amber-text">{firstName}</span> 🙏
            </h1>
            <p className="text-sm" style={{ color: TEXT_MUTED }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {doshaInfo && DoshaIcon ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                 style={{ background: doshaInfo.bg, border: `1.5px solid ${doshaInfo.color}35` }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center float-animate"
                   style={{ background: `${doshaInfo.color}20`, border: `1px solid ${doshaInfo.color}40` }}>
                <DoshaIcon className="h-5 w-5" style={{ color: doshaInfo.color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>Your Dosha</p>
                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: doshaInfo.color }}>{doshaInfo.label}</p>
                <p className="text-xs" style={{ color: TEXT_MUTED }}>{doshaInfo.element}</p>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('/assessment')}
                    className="btn-amber flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl hover-lift">
              <Activity className="h-4 w-4" /> Take Assessment
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Wellness Score" value="72%" sub="Keep improving 📈" color={AMBER} />
        <StatCard label="Days Active"    value="12"  sub="Great consistency!"  color={GOLD} />
        <StatCard label="Assessments"    value="1"   sub="Last: this week"     color={TERRA} />
        <StatCard label="Tips Followed"  value="8"   sub="Out of 10 today"     color="#6ab4d4" />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Quick actions */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>Quick Actions</h2>
            <div className="flex-1 mx-4 h-px" style={{ background: BORDER }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <button key={i} onClick={() => navigate(a.url)}
                        className="glass-card rounded-2xl p-5 text-left flex items-start gap-4 hover-lift shine-effect">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: `${a.color}18`, border: `1.5px solid ${a.border}` }}>
                    <Icon className="h-5 w-5" style={{ color: a.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>{a.title}</p>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>{a.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto mt-0.5 opacity-30 flex-shrink-0" style={{ color: a.color }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Rotating tip */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>Daily Wisdom</h2>
            <div className="flex-1 mx-4 h-px" style={{ background: BORDER }} />
          </div>
          <div className="coffee-card rounded-2xl p-5 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 badge-amber mb-4">
                <TipIcon className="h-3 w-3" style={{ color: tip.color }} /> {tip.time}
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: TEXT, fontFamily: 'Georgia, serif' }}>
                "{tip.tip}"
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {WELLNESS_TIPS.map((_, i) => (
                <button key={i} onClick={() => setTipIdx(i)}
                        className="rounded-full transition-all duration-300"
                        style={{ width: i === tipIdx ? 18 : 5, height: 5, background: i === tipIdx ? AMBER : `${AMBER}35` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Dosha overview + seasonal ── */}
      <div className="grid md:grid-cols-5 gap-5">
        <div className="md:col-span-2 amber-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'hsl(32 40% 18%)', border: '1px solid hsl(32 40% 28% / 0.5)' }}>
              <Sun className="h-4 w-4" style={{ color: AMBER }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: AMBER_DIM }}>Seasonal Guide</p>
              <p className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>Vasanta (Spring)</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: TEXT_MUTED }}>
            Kapha detox season — light, bitter foods and vigorous exercise to shed winter accumulation.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Bitter gourd', 'Barley', 'Millet', 'Ginger tea', 'Greens'].map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'hsl(32 30% 18%)', color: AMBER_DIM, border: '1px solid hsl(32 35% 22%)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>The Three Doshas</h3>
            <button onClick={() => navigate('/assessment')}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: AMBER }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Take assessment <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {Object.entries(DOSHA_INFO).map(([key, d]) => {
              const Icon = d.icon;
              const isUser = userDosha === key;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                     style={{
                       background: isUser ? d.bg : CARD_BG,
                       border: `1.5px solid ${isUser ? d.color + '40' : BORDER}`,
                       boxShadow: isUser ? `0 0 12px ${d.color}18` : 'none',
                     }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}>
                    <Icon className="h-4 w-4" style={{ color: d.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: isUser ? d.color : TEXT }}>
                      {d.label} {isUser && '✓'}
                    </p>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>{d.element}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: d.color }}>{d.trait}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif', color: BARK }}>
            <TrendingUp className="inline h-4 w-4 mr-1.5" style={{ color: AMBER }} />
            Wellness Progress
          </h3>
          <span className="badge-amber">This Week</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { label: 'Diet adherence',   val: 78, color: AMBER },
            { label: 'Exercise routine', val: 60, color: GOLD },
            { label: 'Sleep quality',    val: 85, color: '#6ab4d4' },
          ].map(p => (
            <div key={p.label}>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: TEXT_MUTED }}>{p.label}</span>
                <span className="font-bold" style={{ color: p.color }}>{p.val}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(22 18% 12%)' }}>
                <div className="h-full rounded-full transition-all duration-700 progress-glow"
                     style={{ width: `${p.val}%`, background: `linear-gradient(90deg, ${p.color}88, ${p.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
