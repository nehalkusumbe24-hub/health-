import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Wind, Flame, Mountain, Check, Loader2, Sparkles } from 'lucide-react';
import type { DoshaType } from '@/types';
import RemAide from '@/components/common/RemAide';
import { cn } from '@/lib/utils';

/* ============================================================
   Types & Data
   ============================================================ */

type OptionCard = { value: string; label: string; hint?: string; icon?: string };

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: OptionCard[];
}

const STEPS: { title: string; subtitle: string; questions: Question[] }[] = [
  {
    title: 'Common Symptoms',
    subtitle: 'Select all symptoms that apply to you',
    questions: [
      {
        id: 'symptoms',
        question: 'Which of these do you experience?',
        type: 'multi',
        options: [
          { value: 'Dry skin',        label: 'Dry Skin',        icon: '💧', hint: 'Vata' },
          { value: 'Anxiety',         label: 'Anxiety',         icon: '😰', hint: 'Vata' },
          { value: 'Constipation',    label: 'Constipation',    icon: '🔒', hint: 'Vata' },
          { value: 'Joint pain',      label: 'Joint Pain',      icon: '🦴', hint: 'Vata' },
          { value: 'Insomnia',        label: 'Insomnia',        icon: '🌙', hint: 'Vata' },
          { value: 'Heartburn',       label: 'Heartburn',       icon: '🔥', hint: 'Pitta' },
          { value: 'Inflammation',    label: 'Inflammation',    icon: '🌡️', hint: 'Pitta' },
          { value: 'Excessive heat',  label: 'Excessive Heat',  icon: '☀️', hint: 'Pitta' },
          { value: 'Skin rashes',     label: 'Skin Rashes',     icon: '🔴', hint: 'Pitta' },
          { value: 'Irritability',    label: 'Irritability',    icon: '😤', hint: 'Pitta' },
          { value: 'Congestion',      label: 'Congestion',      icon: '💨', hint: 'Kapha' },
          { value: 'Weight gain',     label: 'Weight Gain',     icon: '⚖️', hint: 'Kapha' },
          { value: 'Lethargy',        label: 'Lethargy',        icon: '😴', hint: 'Kapha' },
          { value: 'Slow digestion',  label: 'Slow Digestion',  icon: '🐢', hint: 'Kapha' },
          { value: 'Water retention', label: 'Water Retention', icon: '💧', hint: 'Kapha' },
        ],
      },
    ],
  },
  {
    title: 'Daily Habits',
    subtitle: 'Tell us about your daily patterns',
    questions: [
      {
        id: 'digestion',
        question: 'How is your digestion?',
        subtitle: 'Pick the description that fits you best',
        type: 'single',
        options: [
          { value: 'irregular', label: 'Irregular / Variable',  icon: '🌪️', hint: 'Changes day to day' },
          { value: 'strong',    label: 'Strong & Fast',         icon: '⚡', hint: 'Digest quickly, feel hungry often' },
          { value: 'slow',      label: 'Slow & Steady',         icon: '🐢', hint: 'Takes time, feel full for long' },
        ],
      },
      {
        id: 'sleep',
        question: 'How do you sleep?',
        subtitle: `Your typical night's sleep pattern`,
        type: 'single',
        options: [
          { value: 'light',    label: 'Light & Easily Disturbed', icon: '🌫️', hint: 'Wake up at slightest noise' },
          { value: 'moderate', label: 'Moderate',                 icon: '🌙', hint: 'Occasional waking up' },
          { value: 'heavy',    label: 'Deep & Heavy',             icon: '😪', hint: 'Hard to wake up' },
        ],
      },
      {
        id: 'energy',
        question: 'How is your energy?',
        subtitle: 'Your typical energy levels throughout the day',
        type: 'single',
        options: [
          { value: 'variable', label: 'Variable — Comes in Bursts', icon: '🌊', hint: 'High then suddenly low' },
          { value: 'intense',  label: 'Intense & Focused',          icon: '🔥', hint: 'Driven, sometimes too much' },
          { value: 'steady',   label: 'Steady & Enduring',          icon: '🏔️', hint: 'Consistent throughout the day' },
        ],
      },
    ],
  },
  {
    title: 'Physical Traits',
    subtitle: 'Help us understand your constitution',
    questions: [
      {
        id: 'bodyType',
        question: 'What is your body type?',
        subtitle: 'Your natural build, not current weight',
        type: 'single',
        options: [
          { value: 'thin',   label: 'Thin — Hard to Gain',    icon: '🧍', hint: 'Light frame, fast metabolism' },
          { value: 'medium', label: 'Medium — Athletic Build', icon: '🏃', hint: 'Muscular, moderate build' },
          { value: 'heavy',  label: 'Heavy — Easy to Gain',   icon: '🏋️', hint: 'Larger frame, gains weight easily' },
        ],
      },
      {
        id: 'appetite',
        question: 'Describe your appetite:',
        subtitle: 'How do you typically feel about food and hunger',
        type: 'single',
        options: [
          { value: 'variable', label: 'Variable — Sometimes Hungry', icon: '🎲', hint: 'Unpredictable, can forget to eat' },
          { value: 'strong',   label: 'Strong — Irritable if Hungry', icon: '😡', hint: 'Gets angry or dizzy when hungry' },
          { value: 'steady',   label: 'Steady — Can Skip Meals',      icon: '🧘', hint: 'Not affected much by missing meals' },
        ],
      },
      {
        id: 'stress',
        question: 'Your stress level:',
        subtitle: 'How you generally experience and handle stress',
        type: 'single',
        options: [
          { value: 'low',      label: 'Low — Generally Calm',         icon: '🌿', hint: 'Rarely feel overwhelmed' },
          { value: 'moderate', label: 'Moderate — Manageable',        icon: '⚖️', hint: 'Handle stress with effort' },
          { value: 'high',     label: 'High — Often Overwhelmed',     icon: '🌩️', hint: 'Frequently stressed or anxious' },
        ],
      },
    ],
  },
];

/* ============================================================
   Dosha Score Calculator (live preview)
   ============================================================ */
function calcScores(
  symptoms: string[], digestion: string, sleep: string,
  energy: string, bodyType: string, appetite: string, stress: string
) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  if (symptoms.includes('Dry skin') || symptoms.includes('Anxiety') || symptoms.includes('Constipation') || symptoms.includes('Insomnia')) scores.vata += 2;
  if (symptoms.includes('Heartburn') || symptoms.includes('Inflammation') || symptoms.includes('Skin rashes') || symptoms.includes('Irritability')) scores.pitta += 2;
  if (symptoms.includes('Congestion') || symptoms.includes('Weight gain') || symptoms.includes('Lethargy') || symptoms.includes('Slow digestion')) scores.kapha += 2;
  if (digestion === 'irregular') scores.vata += 1; else if (digestion === 'strong') scores.pitta += 1; else if (digestion === 'slow') scores.kapha += 1;
  if (sleep === 'light') scores.vata += 1; else if (sleep === 'moderate') scores.pitta += 1; else if (sleep === 'heavy') scores.kapha += 1;
  if (energy === 'variable') scores.vata += 1; else if (energy === 'intense') scores.pitta += 1; else if (energy === 'steady') scores.kapha += 1;
  if (bodyType === 'thin') scores.vata += 1; else if (bodyType === 'medium') scores.pitta += 1; else if (bodyType === 'heavy') scores.kapha += 1;
  if (appetite === 'variable') scores.vata += 1; else if (appetite === 'strong') scores.pitta += 1; else if (appetite === 'steady') scores.kapha += 1;
  return scores;
}

/* Colors per dosha */
const DC: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  Vata:  { color: '#38bdf8', bg: '#38bdf820', border: '#38bdf840', Icon: Wind    },
  Pitta: { color: '#fb923c', bg: '#fb923c20', border: '#fb923c40', Icon: Flame   },
  Kapha: { color: '#34d399', bg: '#34d39920', border: '#34d39940', Icon: Mountain},
};

/* Symptom hint dosha colour */
const HINT_COLOR: Record<string, string> = { Vata: '#38bdf8', Pitta: '#fb923c', Kapha: '#34d399' };

/* ============================================================
   Sub-components
   ============================================================ */
function MultiCard({
  option, selected, onToggle,
}: { option: OptionCard; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn('selection-card p-3 flex items-center gap-2.5 text-left w-full', selected && 'selected')}
    >
      <span className="text-lg">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate" style={{ color: selected ? '#34d399' : undefined }}>{option.label}</p>
        {option.hint && (
          <p className="text-[10px]" style={{ color: HINT_COLOR[option.hint] ?? '#6b7280' }}>{option.hint}</p>
        )}
      </div>
      {selected && (
        <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
             style={{ background: '#34d399', color: 'hsl(220 20% 6%)' }}>
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function SingleCard({
  option, selected, onSelect,
}: { option: OptionCard; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn('selection-card p-4 flex items-start gap-3 w-full text-left', selected && 'selected')}
    >
      <span className="text-2xl mt-0.5">{option.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold mb-0.5" style={{ color: selected ? '#34d399' : undefined }}>{option.label}</p>
        {option.hint && <p className="text-xs text-muted-foreground">{option.hint}</p>}
      </div>
      {selected && (
        <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
             style={{ background: '#34d399', color: 'hsl(220 20% 6%)' }}>
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

/* Live dosha bar */
function DoshaBar({
  scores, visible,
}: { scores: { vata: number; pitta: number; kapha: number }; visible: boolean }) {
  if (!visible) return null;
  const total = Math.max(scores.vata + scores.pitta + scores.kapha, 1);
  const bars = [
    { name: 'Vata',  score: scores.vata,  ...DC.Vata },
    { name: 'Pitta', score: scores.pitta, ...DC.Pitta },
    { name: 'Kapha', score: scores.kapha, ...DC.Kapha },
  ];
  return (
    <div className="mt-6 p-4 rounded-xl space-y-3"
         style={{ background: 'hsl(220 18% 8%)', border: '1px solid hsl(220 14% 16%)' }}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Live Dosha Preview</p>
      {bars.map((b) => {
        const pct = Math.round((b.score / total) * 100);
        const Icon = b.Icon;
        return (
          <div key={b.name} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-16 flex-shrink-0">
              <Icon className="h-3 w-3" style={{ color: b.color }} />
              <span className="text-xs font-medium" style={{ color: b.color }}>{b.name}</span>
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(220 14% 14%)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%`, background: b.color, boxShadow: `0 0 8px ${b.color}80` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Main Component
   ============================================================ */
export default function AssessmentPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const [symptoms,  setSymptoms]  = useState<string[]>([]);
  const [digestion, setDigestion] = useState('');
  const [sleep,     setSleep]     = useState('');
  const [energy,    setEnergy]    = useState('');
  const [bodyType,  setBodyType]  = useState('');
  const [appetite,  setAppetite]  = useState('');
  const [stress,    setStress]    = useState('');

  const scores = calcScores(symptoms, digestion, sleep, energy, bodyType, appetite, stress);

  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];

  const getValue = (id: string) => {
    const map: Record<string, string | string[]> = { symptoms, digestion, sleep, energy, bodyType, appetite, stress };
    return map[id];
  };

  const setValue = (id: string, val: string) => {
    const setters: Record<string, (v: string) => void> = {
      digestion: setDigestion, sleep: setSleep, energy: setEnergy,
      bodyType: setBodyType, appetite: setAppetite, stress: setStress,
    };
    setters[id]?.(val);
  };

  const toggleSymptom = (val: string) =>
    setSymptoms(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);

  const canProceed = () => {
    if (step === 0) return true; // symptoms optional
    return currentStep.questions.every(q => {
      if (q.type === 'multi') return true; // always optional
      return !!getValue(q.id);
    });
  };

  const go = (dir: 1 | -1) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(s => s + dir);
      setAnimating(false);
    }, 220);
  };

  const calculateDosha = (): { primary: DoshaType; secondary: DoshaType; severity: string } => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0][0] as DoshaType;
    const secondary = sorted[1][0] as DoshaType;
    const severity = sorted[0][1] >= 6 ? 'high' : sorted[0][1] >= 4 ? 'moderate' : 'mild';
    return { primary, secondary, severity };
  };

  const handleSubmit = async () => {
    if (!profile?.id) { toast.error('Please log in to submit'); return; }
    setLoading(true);
    try {
      const doshaResults = calculateDosha();
      const assessment = await api.assessments.create({
        user_id: profile.id,
        symptoms,
        daily_habits: { digestion, sleep, energy, stress },
        physical_attributes: { skin: '', body_type: bodyType, appetite },
        mental_patterns: { stress_level: stress },
        dosha_results: doshaResults,
        primary_dosha: doshaResults.primary,
        secondary_dosha: doshaResults.secondary,
        imbalance_severity: doshaResults.severity,
        status: 'completed',
      });
      toast.success('Assessment completed!');
      navigate(`/assessment/${assessment.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = step === totalSteps - 1;
  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header Card ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, hsl(220 18% 10%), hsl(220 20% 7%))', border: '1px solid hsl(158 70% 48% / 0.18)' }}>
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'hsl(158 70% 48% / 0.12)', border: '1px solid hsl(158 70% 48% / 0.3)' }}>
              <Sparkles className="h-5 w-5" style={{ color: '#34d399' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Ayurvedic Health Assessment
              </h1>
              <p className="text-xs text-muted-foreground">Step {step + 1} of {totalSteps}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(220 14% 14%)' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out progress-glow"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #34d399, #38bdf8)' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={i} className={cn(
                'text-[10px] uppercase tracking-wider font-medium transition-colors',
                i === step ? 'text-primary' : i < step ? 'text-primary/50' : 'text-muted-foreground/40'
              )}>
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Question Card ── */}
      <div className={cn('rounded-2xl p-6 transition-all duration-220', animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0')}
           style={{ background: 'hsl(220 18% 9%)', border: '1px solid hsl(220 14% 16%)', transition: 'opacity 0.22s ease, transform 0.22s ease' }}>
        <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {currentStep.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{currentStep.subtitle}</p>

        <div className="space-y-8">
          {currentStep.questions.map((q) => (
            <div key={q.id}>
              <p className="text-sm font-semibold text-foreground mb-1">{q.question}</p>
              {q.subtitle && <p className="text-xs text-muted-foreground mb-3">{q.subtitle}</p>}

              {q.type === 'multi' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {q.options.map((opt) => (
                    <MultiCard
                      key={opt.value}
                      option={opt}
                      selected={(getValue(q.id) as string[] || []).includes(opt.value)}
                      onToggle={() => toggleSymptom(opt.value)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  {q.options.map((opt) => (
                    <SingleCard
                      key={opt.value}
                      option={opt}
                      selected={getValue(q.id) === opt.value}
                      onSelect={() => setValue(q.id, opt.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live dosha bar (show from step 1 onwards) */}
        <DoshaBar scores={scores} visible={step > 0} />
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={step === 0}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            step === 0
              ? 'opacity-0 pointer-events-none'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent border border-border'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={cn(
              'rounded-full transition-all duration-300',
              i === step ? 'w-6 h-2' : 'w-2 h-2',
              i <= step ? 'bg-primary' : 'bg-border'
            )} />
          ))}
        </div>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-40 hover-lift"
            style={{ background: '#34d399', color: 'hsl(220 20% 6%)' }}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Complete Assessment</>
            )}
          </button>
        ) : (
          <button
            onClick={() => go(1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover-lift"
            style={{ background: '#34d399', color: 'hsl(220 20% 6%)' }}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <RemAide context="assessment" />
    </div>
  );
}
