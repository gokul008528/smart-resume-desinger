import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Github, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AppFooter from '../components/AppFooter';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const { isAuthenticated, profile, firebaseUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = profile?.name || firebaseUser?.displayName || 'User';
  const photo = profile?.profileImage || firebaseUser?.photoURL || '';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-all ${scrolled ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90' : 'border-transparent bg-white dark:bg-slate-950'}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 pr-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <Avatar src={photo} name={displayName} size={30} />
                <span className="max-w-28 truncate text-sm font-medium">{displayName}</span>
                <ChevronDown size={15} className="text-slate-400" />
              </button>
              {menuOpen && (
                <div className="card absolute right-0 top-full z-50 mt-2 w-48 animate-fade-in p-1.5 shadow-lg">
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button onClick={() => setMobileOpen((o) => !o)} className="btn-ghost !px-2.5" aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pb-5 pt-2 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Dashboard</Link>
                <button onClick={handleLogout} className="btn-secondary flex-1">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
