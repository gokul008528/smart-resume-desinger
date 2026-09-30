import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function firebaseErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
    case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
    default: return 'Login failed. Please try again.';
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, loginWithGoogle, resetPassword, sessionExpired, clearSessionExpired } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.warning('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      clearSessionExpired();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(firebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      clearSessionExpired();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(firebaseErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.warning('Enter your email address first.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      toast.success('Password reset email sent. Check your inbox.');
      setResetOpen(false);
    } catch {
      toast.error('Could not send reset email. Check the address and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="card w-full max-w-md animate-fade-up p-8 shadow-lg">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-center text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">Log in to continue building your resume.</p>

        {sessionExpired && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            Your session expired. Please log in again.
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="email" type="email" className="input !pl-10" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="password" type={showPassword ? 'text' : 'password'} className="input !pl-10 !pr-11" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => { setResetEmail(email); setResetOpen(true); }} className="text-sm font-medium text-primary-500 hover:underline">
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn-primary w-full !py-3" disabled={loading}>
            {loading && <Loader2 size={17} className="animate-spin" />} Login
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> OR <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <button onClick={handleGoogle} className="btn-secondary w-full !py-3" disabled={googleLoading}>
          {googleLoading ? <Loader2 size={17} className="animate-spin" /> : (
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.5-2.7-.1.1C.5 8.9 0 10.4 0 12s.5 3.1 1.5 4.6l3.7-2.2z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.5 6.6l3.7 2.9c1-3 3.7-4.8 6.8-4.8z"/></svg>
          )}
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account? <Link to="/signup" className="font-semibold text-primary-500 hover:underline">Sign up</Link>
        </p>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset your password">
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter your account email and we&apos;ll send you a reset link.</p>
          <div>
            <label className="label" htmlFor="reset-email">Email</label>
            <input id="reset-email" type="email" className="input" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={resetLoading}>
            {resetLoading && <Loader2 size={16} className="animate-spin" />} Send Reset Link
          </button>
        </form>
      </Modal>
    </div>
  );
}
