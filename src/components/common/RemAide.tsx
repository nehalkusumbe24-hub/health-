import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PageContext =
  | 'dashboard'
  | 'assessment'
  | 'diet'
  | 'exercise'
  | 'onboarding'
  | 'doctor'
  | 'admin';

interface RemAideProps {
  context: PageContext;
}

const CONTEXT_GREETINGS: Record<PageContext, string> = {
  dashboard:
    "👋 Hi! I'm remAIDE, your Ayurvedic AI assistant. Ask me anything about your health journey, doshas, or wellness tips!",
  assessment:
    "🌿 Need help understanding the health assessment questions? I can explain what each question means and how doshas affect your body!",
  diet:
    "🍃 Questions about your diet plan? I can help you understand which foods balance your dosha and why certain items are recommended!",
  exercise:
    "🧘 Need guidance on your yoga or pranayama practice? I can explain the benefits of each pose and breathing exercise!",
  onboarding:
    "✨ Welcome! I'm here to help you complete your profile. Ask me anything about what information to provide and why it matters for your wellness plan!",
  doctor:
    "⚕️ Hi Doctor! I can help with Ayurvedic clinical questions, treatment protocols, or information about patient assessments.",
  admin:
    "🔧 Hello Admin! I can assist with platform questions, user management guidance, or any Ayurvedic Health Advisor system queries.",
};

const CONTEXT_PROMPTS: Record<PageContext, string> = {
  dashboard: 'You are an Ayurvedic health assistant helping a user navigate their health dashboard. Answer questions about their health journey, dosha types, and available features.',
  assessment: 'You are an Ayurvedic health assistant helping a user understand a health assessment. Explain dosha concepts, what symptoms mean, and how the assessment works.',
  diet: 'You are an Ayurvedic nutritionist assistant. Help users understand their diet plan, food recommendations, and restrictions based on Ayurvedic principles.',
  exercise: "You are an Ayurvedic wellness assistant specializing in yoga, pranayama, and dinacharya (daily routines). Explain poses, breathing exercises, and their health benefits.",
  onboarding: 'You are an Ayurvedic health assistant helping a new user complete their health profile. Explain why each field matters for personalized wellness recommendations.',
  doctor: 'You are an advanced Ayurvedic clinical assistant for a qualified doctor. Help with treatment protocols, patient assessments, and Ayurvedic medical questions.',
  admin: 'You are a platform assistant for the Ayurvedic Health Advisor admin. Help with platform management questions and user administration guidance.',
};

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function RemAide({ context }: RemAideProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pulse, setPulse] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Stop pulsing after first open
  const handleOpen = () => {
    setOpen(true);
    setPulse(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/functions/v1/ayurvedic-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: text,
          systemPrompt: CONTEXT_PROMPTS[context],
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const reply = data?.message || "I'm sorry, I couldn't process that. Please try again!";
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: "Connection error. Please make sure the server is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {open && (
        <div
          ref={panelRef}
          className="w-[340px] max-h-[480px] flex flex-col rounded-2xl shadow-2xl border border-primary/20 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{ background: 'hsl(var(--background) / 0.96)', backdropFilter: 'blur(16px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--secondary) / 0.12))' }}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">remAIDE</p>
              <p className="text-xs text-muted-foreground">Ayurvedic AI Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[240px] max-h-[320px]">
            {/* Greeting */}
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))' }}>
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 rounded-xl rounded-tl-none px-3 py-2 text-sm" style={{ background: 'hsl(var(--accent))' }}>
                {CONTEXT_GREETINGS[context]}
              </div>
            </div>

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === 'user' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                  {msg.role === 'user' ? (
                    <span className="text-xs font-bold text-primary">U</span>
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-secondary" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-primary text-primary-foreground'
                      : 'rounded-tl-none bg-accent'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 bg-secondary/20">
                  <Bot className="h-3.5 w-3.5 text-secondary" />
                </div>
                <div className="flex-1 rounded-xl rounded-tl-none px-3 py-2 bg-accent">
                  <div className="flex gap-1 items-center h-4">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask remAIDE anything..."
                className="text-sm h-9"
                disabled={loading}
              />
              <Button type="submit" size="sm" className="h-9 w-9 p-0 flex-shrink-0" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="group relative h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
          title="Open remAIDE"
        >
          {pulse && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }} />
          )}
          <Sparkles className="h-6 w-6 text-white drop-shadow" />
          <span className="absolute -top-10 right-0 bg-foreground text-background text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            remAIDE ✨
          </span>
        </button>
      )}
    </div>
  );
}
