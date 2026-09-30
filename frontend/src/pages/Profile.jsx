import { useEffect, useState } from 'react';
import { Camera, Loader2, Save, Trash2, X, Plus } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function Profile() {
  const { profile, refreshProfile, firebaseUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // local preview before save
  const [pendingFile, setPendingFile] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        professionalTitle: profile.professionalTitle || '',
        bio: profile.bio || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        skills: profile.skills || [],
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        profileImage: profile.profileImage || '',
      });
    }
  }, [profile]);

  if (!form) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-96" />
      </div>
    );
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) {
      toast.warning('Skill already added.');
      return;
    }
    set('skills', [...form.skills, s].slice(0, 50));
    setSkillInput('');
  };

  const validateImage = (file) =>
    new Promise((resolve, reject) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        reject(new Error('Only JPG, PNG, or WebP images are allowed.'));
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        reject(new Error('Image must be smaller than 2MB.'));
        return;
      }
      // Verify it is a real, decodable image.
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a valid image.')); };
      img.src = url;
    });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await validateImage(file);
      setPendingFile(file);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadConfirm = async () => {
    if (!pendingFile || !firebaseUser) return;
    setUploading(true);
    try {
      const path = `profileImages/${firebaseUser.uid}/${Date.now()}-${pendingFile.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, pendingFile);
      const url = await getDownloadURL(storageRef);
      await api.post('/users/profile-image', { imageUrl: url });
      set('profileImage', url);
      await refreshProfile();
      setPreview(null);
      setPendingFile(null);
      toast.success('Profile picture updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Image upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setConfirmRemove(false);
    setUploading(true);
    try {
      // Best-effort delete from Storage (only for our own bucket paths).
      if (form.profileImage.includes('firebasestorage') || form.profileImage.includes('profileImages')) {
        try {
          // Extract storage path from download URL when possible.
          const match = form.profileImage.match(/\/o\/([^?]+)/);
          if (match) await deleteObject(ref(storage, decodeURIComponent(match[1])));
        } catch { /* file may already be gone — continue */ }
      }
      await api.put('/users/profile', { profileImage: '' });
      set('profileImage', '');
      await refreshProfile();
      toast.success('Profile picture removed.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not remove picture.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning('Name is required.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      await refreshProfile();
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This info pre-fills new resumes and appears across the app.</p>
      </div>

      <form onSubmit={handleSave} className="card space-y-5 p-6">
        {/* Picture */}
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={preview || form.profileImage} name={form.name} size={84} />
          <div>
            <div className="flex flex-wrap gap-2">
              <label className="btn-secondary cursor-pointer !py-2 text-sm">
                <Camera size={15} /> {form.profileImage || preview ? 'Change' : 'Upload'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
              </label>
              {(form.profileImage || preview) && !preview && (
                <button type="button" onClick={() => setConfirmRemove(true)} className="btn-secondary !py-2 text-sm !text-red-600" disabled={uploading}>
                  <Trash2 size={15} /> Remove
                </button>
              )}
              {preview && (
                <>
                  <button type="button" onClick={handleUploadConfirm} className="btn-primary !py-2 text-sm" disabled={uploading}>
                    {uploading && <Loader2 size={15} className="animate-spin" />} Save Picture
                  </button>
                  <button type="button" onClick={() => { setPreview(null); setPendingFile(null); }} className="btn-ghost !py-2 text-sm">
                    <X size={15} /> Cancel
                  </button>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">JPG, PNG, or WebP — max 2MB. Preview shown before saving.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={100} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-60" value={profile?.email || ''} disabled title="Email is managed by your login account" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" maxLength={30} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" maxLength={120} />
          </div>
          <div>
            <label className="label">Professional Title</label>
            <input className="input" value={form.professionalTitle} onChange={(e) => set('professionalTitle', e.target.value)} placeholder="e.g. Frontend Developer" maxLength={120} />
          </div>
          <div>
            <label className="label">Years of Experience</label>
            <input type="number" min={0} max={60} className="input" value={form.yearsOfExperience} onChange={(e) => set('yearsOfExperience', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/you" maxLength={255} />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input className="input" value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="github.com/you" maxLength={255} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Portfolio URL</label>
            <input className="input" value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://your-site.com" maxLength={255} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)} maxLength={1000} placeholder="A sentence or two about yourself…" />
          </div>
        </div>

        <div>
          <label className="label">Skills</label>
          <div className="flex gap-2">
            <input className="input" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill and press Enter" />
            <button type="button" onClick={addSkill} className="btn-secondary shrink-0"><Plus size={16} /> Add</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                {s}
                <button type="button" onClick={() => set('skills', form.skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  <X size={13} />
                </button>
              </span>
            ))}
            {form.skills.length === 0 && <span className="text-xs text-slate-400">No skills added yet.</span>}
          </div>
        </div>

        <div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemoveImage}
        loading={uploading}
        title="Remove profile picture?"
        message="Your profile picture will be removed from your account."
        confirmLabel="Remove"
      />
    </div>
  );
}
