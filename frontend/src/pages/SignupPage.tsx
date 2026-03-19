import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, User } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email.trim().toLowerCase(), password, fullName.trim());
    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created! Please sign in. 🙏');
      navigate('/login');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'hsl(220 18% 12%)',
    border: '1px solid hsl(220 14% 20%)',
    color: 'hsl(210 20% 92%)',
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = 'hsl(158 70% 48% / 0.6)');
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = 'hsl(220 14% 20%)');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'hsl(220 20% 5%)' }}>
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, hsl(265 60% 65% / 0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, hsl(158 70% 48% / 0.07) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse"
               style={{ background: 'hsl(158 70% 48% / 0.12)', border: '1px solid hsl(158 70% 48% / 0.35)' }}>
            <Leaf className="h-8 w-8" style={{ color: '#34d399' }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ayur<span style={{ color: '#34d399' }}>veda</span>
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Health Advisor</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{ background: 'hsl(220 18% 9%)', border: '1px solid hsl(220 14% 16%)' }}>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Create account</h2>
          <p className="text-sm text-muted-foreground mb-6">Begin your Ayurvedic wellness journey today</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80" htmlFor="fullName">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80" htmlFor="confirmPassword">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== password
                      ? 'hsl(0 72% 55% / 0.6)'
                      : 'hsl(220 14% 20%)',
                  }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs" style={{ color: 'hsl(0 72% 55%)' }}>Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 hover-lift mt-2"
              style={{ background: '#34d399', color: 'hsl(220 20% 6%)', border: 'none' }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                : <><UserPlus className="h-4 w-4" /> Create Account</>
              }
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium transition-colors hover:opacity-80" style={{ color: '#34d399' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your health data is encrypted and never shared.
        </p>
      </div>
    </div>
  );
}
