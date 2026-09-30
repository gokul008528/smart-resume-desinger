import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Loader2, Share2, Sun, Moon, Monitor } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';

export default function Settings() {
  const { profile, firebaseUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [publicResumes, setPublicResumes] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const displayName = profile?.name || firebaseUser?.displayName || 'User';
  const photo = profile?.profileImage || firebaseUser?.photoURL || '';

  useEffect(() => {
    api.get('/resumes').then(({ data }) => {
      setPublicResumes((data.data || []).filter((r) => r.isPublic));
    }).catch(() => {});
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.warning('Type DELETE to confirm account deletion.');
      return;
    }
    setDeletingAccount(true);
    try {
      await api.delete('/users/account');
      await logout();
      toast.success('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete account.'));
    } finally {
      setDeletingAccount(false);
    }
  };

  const lastSignIn = firebaseUser?.metadata?.lastSignInTime
    ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleString()
    : '—';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account, appearance, and privacy.</p>
      </div>

      {/* Account */}
      <section className="card p-6">
        <h2 className="font-bold">Account</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar src={photo} name={displayName} size={56} />
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email || firebaseUser?.email}</p>
          </div>
          <Link to="/profile" className="btn-secondary ml-auto !py-2 text-sm">Edit Profile</Link>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-6">
        <h2 className="font-bold">Appearance</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose how Smart Resume Designer looks.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); toast.success(`${label} theme applied.`); }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                theme === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <Icon size={22} className={theme === value ? 'text-primary-500' : 'text-slate-400'} />
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="card p-6">
        <h2 className="font-bold">Security</h2>
        <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <p><span className="text-slate-500">Signed in as:</span> <span className="font-medium">{profile?.email || firebaseUser?.email}</span></p>
          <p className="mt-1"><span className="text-slate-500">Last sign-in:</span> <span className="font-medium">{lastSignIn}</span></p>
          <p className="mt-1"><span className="text-slate-500">Auth provider:</span> <span className="font-medium">{firebaseUser?.providerData?.[0]?.providerId || 'password'}</span></p>
        </div>
        <button onClick={handleLogout} className="btn-secondary mt-4"><LogOut size={16} /> Logout</button>
      </section>

      {/* Privacy / sharing */}
      <section className="card p-6">
        <h2 className="font-bold">Public Sharing</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resumes currently visible to anyone with the link.</p>
        {publicResumes.length === 0 ? (
          <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60">No resumes are publicly shared. Enable sharing from any resume&apos;s preview page.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {publicResumes.map((r) => (
              <li key={r._id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                <Share2 size={15} className="text-green-500" />
                <span className="font-medium">{r.title}</span>
                <Link to={`/resumes/${r._id}/preview`} className="ml-auto font-semibold text-primary-500 hover:underline">Manage</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Danger zone */}
      <section className="card !border-red-200 p-6 dark:!border-red-900/50">
        <h2 className="font-bold text-red-600 dark:text-red-400">Delete Account</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Permanently delete your account, profile, all resumes, and all versions. This cannot be undone.
        </p>
        <button onClick={() => { setDeleteConfirmText(''); setConfirmDelete(true); }} className="btn-danger mt-4">
          <Trash2 size={16} /> Delete My Account
        </button>
      </section>

      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmDelete(false)}>
          <div className="card w-full max-w-md animate-fade-up p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600">Delete account permanently?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This will permanently remove your account, profile, all resumes, and all version history. Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              className="input mt-4"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteAccount} disabled={deletingAccount}>
                {deletingAccount && <Loader2 size={16} className="animate-spin" />} Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
