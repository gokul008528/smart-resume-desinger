import { useEffect, useState } from 'react';
import { History, Plus, RotateCcw, Trash2, Pencil, Loader2, Check, X } from 'lucide-react';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/resume';

export default function VersionsManager({ open, onClose, resumeId, onRestored }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/resumes/${resumeId}/versions`);
      setVersions(data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not load versions.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && resumeId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeId]);

  const create = async () => {
    if (!newName.trim()) {
      toast.warning('Give the version a name.');
      return;
    }
    setCreating(true);
    try {
      await api.post(`/resumes/${resumeId}/versions`, { versionName: newName.trim() });
      toast.success('Version saved.');
      setNewName('');
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save version.'));
    } finally {
      setCreating(false);
    }
  };

  const restore = async (v) => {
    setRestoringId(v._id);
    try {
      const { data } = await api.post(`/resumes/${resumeId}/versions/${v._id}/restore`);
      toast.success(`Restored "${v.versionName}". A backup of your previous state was saved automatically.`);
      onRestored?.(data.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not restore version.'));
    } finally {
      setRestoringId(null);
    }
  };

  const rename = async (v) => {
    if (!renameValue.trim()) {
      toast.warning('Version name cannot be empty.');
      return;
    }
    try {
      await api.patch(`/resumes/${resumeId}/versions/${v._id}`, { versionName: renameValue.trim() });
      toast.success('Version renamed.');
      setRenamingId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not rename version.'));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/resumes/${resumeId}/versions/${deleteTarget._id}`);
      toast.success('Version deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete version.'));
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Resume Versions" wide>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Snapshot your resume before big changes. Restoring always keeps an automatic backup.
          </p>
          <button onClick={() => setShowCreate((s) => !s)} className="btn-primary shrink-0 !py-2 text-sm">
            <Plus size={15} /> New Version
          </button>
        </div>

        {showCreate && (
          <div className="mb-4 flex gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <input
              className="input"
              placeholder="e.g. Frontend Job Version"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={120}
            />
            <button onClick={create} className="btn-primary shrink-0" disabled={creating}>
              {creating && <Loader2 size={15} className="animate-spin" />} Save
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : versions.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center dark:bg-slate-800/60">
            <History size={28} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm font-semibold">No versions yet</p>
            <p className="text-xs text-slate-500">Save a version to capture the current state of your resume.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v._id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                {renamingId === v._id ? (
                  <>
                    <input className="input !py-1.5 text-sm" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={120} />
                    <button onClick={() => rename(v)} className="btn-ghost !p-2 text-green-600" aria-label="Save name"><Check size={16} /></button>
                    <button onClick={() => setRenamingId(null)} className="btn-ghost !p-2" aria-label="Cancel"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{v.versionName}</p>
                      <p className="text-xs text-slate-400">{formatDate(v.createdAt)}</p>
                    </div>
                    <button onClick={() => restore(v)} className="btn-secondary !px-2.5 !py-1.5 !text-xs" disabled={restoringId === v._id} title="Restore this version">
                      {restoringId === v._id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Restore
                    </button>
                    <button onClick={() => { setRenamingId(v._id); setRenameValue(v.versionName); }} className="btn-ghost !p-2" title="Rename">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(v)} className="btn-ghost !p-2 !text-red-500" title="Delete version">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete version?"
        message={`"${deleteTarget?.versionName}" will be permanently deleted.`}
      />
    </>
  );
}
