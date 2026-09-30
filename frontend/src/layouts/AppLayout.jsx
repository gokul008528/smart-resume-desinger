import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, LayoutTemplate, User, Settings, LogOut,
  Menu, X, ScanSearch, Briefcase, ChevronDown,
} from 'lucide-react';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AppFooter from '../components/AppFooter';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resumes', label: 'My Resumes', icon: FileText },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/ats-analysis', label: 'ATS Analysis', icon: ScanSearch },
  { to: '/job-analysis', label: 'Job Analysis', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { profile, firebaseUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const displayName = profile?.name || firebaseUser?.displayName || 'User';
  const photo = profile?.profileImage || firebaseUser?.photoURL || '';

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <Logo />
        <button onClick={() => setSidebarOpen(false)} className="btn-ghost !p-2 lg:hidden" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={19} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 animate-fade-in bg-white shadow-xl dark:bg-slate-950">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost !p-2 lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-100">{displayName.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Avatar src={photo} name={displayName} size={32} />
                <ChevronDown size={15} className="text-slate-400" />
              </button>
              {menuOpen && (
                <div className="card absolute right-0 top-full z-50 mt-2 w-52 animate-fade-in p-1.5 shadow-lg">
                  <div className="border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{profile?.email || firebaseUser?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
