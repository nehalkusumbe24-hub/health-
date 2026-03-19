import { Link } from 'react-router-dom';
import {
  Leaf, Activity, BookOpen, Dumbbell, MessageSquare,
  UserCheck, ArrowRight, Sparkles, Wind, Flame, Mountain,
  CheckCircle, Star, Zap,
} from 'lucide-react';

const FEATURES = [
  { icon: Activity,      title: 'Dosha Assessment',     color: '#d4853a', border: '#d4853a35', desc: 'Identify your unique Vata–Pitta–Kapha constitution and imbalances through deep AI analysis.' },
  { icon: BookOpen,      title: 'Personalized Diet',    color: '#c8922f', border: '#c8922f35', desc: 'Custom seasonal meal plans, food lists, and recipes tailored to your dosha and health goals.' },
  { icon: Dumbbell,      title: 'Daily Dinacharya',     color: '#b87d3a', border: '#b87d3a35', desc: 'Structured daily routines with yoga, pranayama, and Ayurvedic self-care for holistic wellness.' },
  { icon: MessageSquare, title: 'AI Health Assistant',  color: '#d4853a', border: '#d4853a35', desc: 'Ask about herbs, remedies, symptoms — get Ayurvedic wisdom instantly, 24/7.' },
  { icon: UserCheck,     title: 'Expert Consultation',  color: '#c89540', border: '#c8954035', desc: 'Connect with verified Ayurvedic doctors for professional guidance and prescriptions.' },
  { icon: Zap,           title: 'AI Recommendations',   color: '#d4853a', border: '#d4853a35', desc: 'Intelligent health scoring, progress tracking, and adaptive wellness recommendations.' },
];

const DOSHAS = [
  { name: 'Vata',  icon: Wind,     color: '#6ab4d4', grad: 'from-sky-900/40 to-sky-950/40',    desc: 'Air & Space · Creativity · Movement' },
  { name: 'Pitta', icon: Flame,    color: '#d47a3a', grad: 'from-orange-900/40 to-orange-950/40', desc: 'Fire & Water · Intelligence · Transform' },
  { name: 'Kapha', icon: Mountain, color: '#6b8f6e', grad: 'from-green-900/40 to-green-950/40', desc: 'Earth & Water · Stability · Structure' },
];

const STEPS = [
  { num: '01', title: 'Complete Assessment',  desc: 'Answer questions about your body, habits, and lifestyle patterns' },
  { num: '02', title: 'Receive Your Plan',    desc: 'Get custom diet, yoga, and daily routine recommendations' },
  { num: '03', title: 'Track & Grow',         desc: 'Monitor progress, consult doctors, and deepen your wellness practice' },
];

const STATS = [
  { value: '5000+', label: 'Years of Ayurvedic Wisdom' },
  { value: '3',     label: 'Doshas Analyzed' },
  { value: '30+',   label: 'Herbal Remedies' },
  { value: '100%',  label: 'Personalized' },
];

// Ember particle positions (static — no randomness for SSR safety)
const EMBERS = [
  { x: '15%', delay: '0s',   size: 3, tx: -20, ty: -140, d: '5s' },
  { x: '30%', delay: '1.2s', size: 2, tx: 15,  ty: -100, d: '4s' },
  { x: '50%', delay: '2.4s', size: 4, tx: -10, ty: -120, d: '6s' },
  { x: '70%', delay: '0.8s', size: 2, tx: 20,  ty: -90,  d: '4.5s' },
  { x: '85%', delay: '1.6s', size: 3, tx: -15, ty: -130, d: '5.5s' },
  { x: '22%', delay: '3.1s', size: 2, tx: 8,   ty: -110, d: '4.2s' },
  { x: '60%', delay: '0.4s', size: 3, tx: -22, ty: -150, d: '5.8s' },
  { x: '42%', delay: '2.9s', size: 2, tx: 12,  ty: -95,  d: '3.9s' },
];

export default function LandingPage() {
  return (
    <div className="aurora-bg min-h-screen overflow-x-hidden" style={{ color: 'hsl(38 25% 90%)' }}>
      {/* Animated layers */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="dot-grid" />
      <div className="scanlines" />

      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 w-full content-layer"
              style={{ background: 'hsl(20 22% 7% / 0.85)', borderBottom: '1px solid hsl(32 25% 16% / 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center animate-glow-pulse"
                 style={{ background: 'hsl(32 50% 20%)', border: '1px solid hsl(32 60% 30% / 0.5)' }}>
              <Leaf className="h-5 w-5" style={{ color: 'hsl(32 85% 60%)' }} />
            </div>
            <span className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ayur<span style={{ color: 'hsl(32 85% 58%)' }}>veda</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all"
                      style={{ color: 'hsl(38 20% 68%)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'hsl(38 25% 88%)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'hsl(38 20% 68%)')}>
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="btn-amber px-5 py-2 text-sm rounded-xl">Get Started</button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="content-layer relative pt-24 pb-32 px-4 text-center overflow-hidden">
        {/* Mandala rings */}
        <div className="absolute top-12 right-16 w-48 h-48 mandala-ring float-animate pointer-events-none" />
        <div className="absolute top-24 right-24 w-32 h-32 mandala-ring-fast pointer-events-none" />
        <div className="absolute bottom-16 left-12 w-36 h-36 mandala-ring float-animate pointer-events-none"
             style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-24 left-20 w-20 h-20 mandala-ring-fast pointer-events-none" />

        {/* Ember particles */}
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none">
          {EMBERS.map((e, i) => (
            <div key={i} className="ember absolute bottom-0"
                 style={{
                   left: e.x,
                   width: e.size, height: e.size,
                   '--d': e.d, '--tx': `${e.tx}px`, '--ty': `${e.ty}px`,
                   animationDelay: e.delay,
                   boxShadow: '0 0 4px hsl(32 85% 55% / 0.8)',
                 } as React.CSSProperties} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 badge-amber mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Ancient Wisdom · Modern Intelligence · AI Powered
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Personal{' '}
            <span className="gradient-text neon-amber-text">Ayurvedic</span>
            <br />
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: 'hsl(32 55% 62%)' }}>
              Health Journey
            </span>
          </h1>

          <p className="text-base md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
             style={{ color: 'hsl(38 15% 58%)' }}>
            Discover balance and wellness through personalized Ayurvedic guidance, expert consultations,
            and AI‑powered health insights rooted in 5,000 years of ancient healing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <button className="btn-amber flex items-center gap-2 px-8 py-3.5 text-base rounded-2xl hover-lift">
                Begin Your Journey <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link to="/doctor-register">
              <button className="btn-outline-amber flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-2xl hover-lift">
                Join as Doctor
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['5,000+ years of Ayurvedic wisdom', 'AI-powered recommendations', 'Verified Ayurvedic doctors'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(38 15% 52%)' }}>
                <CheckCircle className="h-3.5 w-3.5" style={{ color: 'hsl(32 70% 50%)' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="content-layer py-12 px-4"
               style={{ borderTop: '1px solid hsl(32 20% 14%)', borderBottom: '1px solid hsl(32 20% 14%)', background: 'hsl(20 22% 7% / 0.5)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold gradient-text neon-amber-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                {s.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'hsl(38 15% 52%)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Doshas ── */}
      <section className="content-layer py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 badge-coffee mb-4">🌿 The Three Doshas</div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Understand Your <span className="gradient-text">Constitution</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: 'hsl(38 15% 52%)' }}>
              Every person has a unique blend of the three doshas — the key to lasting wellness.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {DOSHAS.map(d => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="coffee-card rounded-2xl p-7 text-center shine-effect hover-lift">
                  <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center float-animate"
                       style={{ background: `${d.color}18`, border: `1.5px solid ${d.color}40` }}>
                    <Icon className="h-8 w-8" style={{ color: d.color }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: d.color }}>
                    {d.name}
                  </h3>
                  <p className="text-xs tracking-wider mb-3" style={{ color: 'hsl(38 15% 48%)' }}>{d.desc}</p>
                  <div className="h-0.5 rounded-full w-12 mx-auto" style={{ background: `${d.color}50` }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="content-layer py-20 px-4"
               style={{ background: 'hsl(20 22% 7% / 0.4)', borderTop: '1px solid hsl(32 20% 13%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 badge-amber mb-4">⚡ Platform Features</div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Comprehensive <span className="gradient-text">Ayurvedic Care</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-6 shine-effect">
                  <div className="h-11 w-11 rounded-xl mb-4 flex items-center justify-center"
                       style={{ background: `${f.color}18`, border: `1px solid ${f.border}` }}>
                    <Icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'hsl(38 15% 52%)' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="content-layer py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 badge-coffee mb-4">🔥 Simple Process</div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-px"
                 style={{ background: 'linear-gradient(90deg, hsl(32 60% 30% / 0.4), hsl(38 70% 40% / 0.4))' }} />
            {STEPS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 rounded-2xl mx-auto mb-5 flex items-center justify-center font-bold text-xl neon-amber"
                     style={{
                       background: 'linear-gradient(135deg, hsl(32 55% 22%), hsl(25 45% 14%))',
                       color: 'hsl(32 85% 62%)',
                       fontFamily: 'Playfair Display, serif',
                       border: '1px solid hsl(32 50% 30% / 0.5)',
                     }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: 'hsl(38 15% 52%)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="content-layer py-28 px-4 relative overflow-hidden">
        {/* Inner glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, hsl(32 40% 16% / 0.4), transparent)' }} />
        <div className="absolute inset-0 pattern-mandala pointer-events-none opacity-60" />
        {/* Big mandala rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 mandala-ring pointer-events-none opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 mandala-ring-fast pointer-events-none opacity-20" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 badge-amber mb-6">✨ Start Today</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Transform<br />
            <span className="gradient-text neon-amber-text">Your Health?</span>
          </h2>
          <p className="mb-8" style={{ color: 'hsl(38 15% 52%)' }}>
            Join thousands discovering the power of Ayurvedic wellness,<br />guided by ancient wisdom and modern AI.
          </p>
          <Link to="/signup">
            <button className="btn-amber flex items-center gap-2 px-10 py-4 text-base rounded-2xl hover-lift mx-auto">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="content-layer py-8 px-4 text-center text-sm"
              style={{ background: 'hsl(20 20% 6%)', borderTop: '1px solid hsl(32 20% 13%)', color: 'hsl(38 15% 42%)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="h-4 w-4" style={{ color: 'hsl(32 60% 45%)' }} />
          <span className="font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(38 25% 68%)' }}>Ayurveda Health Advisor</span>
        </div>
        <p>© 2026 · Bridging ancient Ayurvedic wisdom with modern technology.</p>
      </footer>
    </div>
  );
}
