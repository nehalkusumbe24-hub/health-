import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Coffee } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!password)     { toast.error('Please enter your password'); return; }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim().toLowerCase(), password);
    if (error) {
      toast.error(error.message || 'Login failed. Check your credentials.');
    } else {
      toast.success('Welcome back! 🙏');
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'hsl(22 22% 9%)',
    border: '1px solid hsl(32 20% 18%)',
    color: 'hsl(38 25% 88%)',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'hsl(32 60% 38%)';
    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(32 50% 28% / 0.25), 0 0 12px hsl(32 60% 30% / 0.15)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'hsl(32 20% 18%)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="orb orb-1" style={{ opacity: 0.5 }} />
      <div className="orb orb-2" style={{ opacity: 0.4 }} />
      <div className="dot-grid" />
      <div className="scanlines" />

      <div className="content-layer w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse"
               style={{ background: 'hsl(32 40% 16%)', border: '1.5px solid hsl(32 50% 28% / 0.5)' }}>
            <Leaf className="h-8 w-8" style={{ color: 'hsl(32 85% 58%)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ayur<span style={{ color: 'hsl(32 85% 58%)' }}>veda</span>
          </h1>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'hsl(38 12% 48%)' }}>Health Advisor</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{ background: 'hsl(22 22% 9%)', border: '1px solid hsl(32 20% 15%)', boxShadow: '0 8px 48px hsl(20 40% 4% / 0.9), inset 0 1px 0 hsl(38 25% 20% / 0.06)' }}>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(38 25% 88%)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(38 12% 48%)' }}>Sign in to continue your wellness journey</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'hsl(38 15% 68%)' }} htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'hsl(38 12% 42%)' }} />
                <input id="email" type="email" placeholder="you@example.com"
                       value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'hsl(38 15% 68%)' }} htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'hsl(38 12% 42%)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                       value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                       className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                       style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'hsl(38 12% 42%)' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-amber w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover-lift mt-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <><ArrowRight className="h-4 w-4" /> Sign In</>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'hsl(32 18% 14%)' }} />
            <span className="text-xs" style={{ color: 'hsl(38 12% 40%)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(32 18% 14%)' }} />
          </div>

          <div className="space-y-2 text-center text-sm">
            <p style={{ color: 'hsl(38 12% 48%)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium transition-opacity hover:opacity-75" style={{ color: 'hsl(32 75% 55%)' }}>Create one</Link>
            </p>
            <p style={{ color: 'hsl(38 12% 48%)' }}>
              Are you a doctor?{' '}
              <Link to="/doctor-register" className="font-medium transition-opacity hover:opacity-75" style={{ color: 'hsl(38 65% 55%)' }}>Register here</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'hsl(38 10% 38%)' }}>
          Your health data is encrypted and never shared.
        </p>
      </div>
    </div>
  );
}
