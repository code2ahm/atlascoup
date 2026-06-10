import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Trash2, Info, Camera, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { changePassword, deleteAccount, linkPassword } from '../../services/auth';
import { uploadProfilePicture } from '../../services/upload';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Key },
  { id: 'about', label: 'About', icon: Info },
  { id: 'danger', label: 'Danger Zone', icon: Trash2, danger: true },
];

function SettingsModal({ open, onClose }) {
  const { user, updateProfileAction } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setPhotoUploading(true);
    try {
      const url = await uploadProfilePicture(user.uid, file);
      await updateProfileAction({ photoURL: url });
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload profile picture');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPassLoading(true);
    try {
      if (hasPassword) {
        await changePassword(currentPassword, newPassword);
      } else {
        await linkPassword(user.email, newPassword);
      }
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect'
        : err.code === 'auth/requires-recent-login' ? 'Please log out and log back in before changing your password'
        : 'Failed to update password';
      toast.error(msg);
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted');
      onClose();
      navigate('/login');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Password is incorrect'
        : err.code === 'auth/requires-recent-login' ? 'Please log out and log back in before deleting your account'
        : 'Failed to delete account';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';
  const hasPassword = user?.providerData?.some(p => p.providerId === 'password');

  return (
    <Modal open={open} onClose={onClose} title="Settings" size="xl" scrollable>
      <div className="flex flex-col md:flex-row gap-0 -m-6">

        <div className="md:w-44 shrink-0 md:border-r border-surface-700/50 p-1.5 md:p-2 flex md:flex-col gap-0.5 md:gap-1 overflow-x-auto md:overflow-x-visible border-b md:border-b-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowDeleteConfirm(false); }}
                className={`flex items-center gap-1.5 md:gap-2.5 px-2 md:px-3 py-1.5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0
                  ${isActive
                    ? tab.danger ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'
                    : tab.danger ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
                  }`}>
                <Icon className="h-3.5 md:h-4 w-3.5 md:w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>


        <div className="flex-1 p-6 h-[460px] overflow-y-auto custom-scroll">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center hover:bg-surface-600 transition-colors"
                      disabled={photoUploading}>
                      <Camera className="h-3.5 w-3.5 text-gray-300" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                    {photoUploading && <p className="text-xs text-primary-400 mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>
              <div className="h-px bg-surface-700/50" />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Account Details</h3>
                <div className="bg-surface-900/50 rounded-lg p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Email</span>
                    <span className="text-sm text-white">{user?.email || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">User ID</span>
                    <span className="text-sm text-gray-500 font-mono text-xs">{user?.uid?.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Auth Provider</span>
                    <span className="text-sm text-white">{isGoogle ? 'Google' : 'Email'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Member Since</span>
                    <span className="text-sm text-gray-300">
                      {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              {isGoogle && !hasPassword ? (
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Set Password</h3>
                  <p className="text-xs text-gray-500 mb-4">You signed in with Google. Set a password to enable email sign-in as well.</p>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input label="New Password" type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} required />
                    <Input label="Confirm New Password" type="password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required />
                    <div className="flex justify-end pt-2">
                      <Button type="submit" loading={passLoading} disabled={!newPassword || !confirmPassword}>
                        Set Password
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-white mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {hasPassword && (
                      <Input label="Current Password" type="password" value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)} required />
                    )}
                    <Input label="New Password" type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} required />
                    <Input label="Confirm New Password" type="password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required />
                    <div className="flex justify-end pt-2">
                      <Button type="submit" loading={passLoading}
                        disabled={hasPassword ? (!currentPassword || !newPassword || !confirmPassword) : (!newPassword || !confirmPassword)}>
                        {hasPassword ? 'Update Password' : 'Set Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="bg-surface-900/50 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/favicon.svg" alt="Atlas Coup" className="w-9 h-9 object-contain" />
                  <div>
                    <p className="text-sm font-medium text-white">Atlas Coup</p>
                    <p className="text-[10px] text-gray-500">Version 2.0.0</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A self-improvement tracker built to help you build habits, track tasks, achieve goals,
                  and reflect through journaling — all in one place.
                </p>
              </div>
              <div className="bg-surface-900/50 rounded-lg p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Framework</span>
                  <span className="text-sm text-gray-300">React + Vite</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Backend</span>
                  <span className="text-sm text-gray-300">Firebase</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Styling</span>
                  <span className="text-sm text-gray-300">Tailwind CSS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Animations</span>
                  <span className="text-sm text-gray-300">Framer Motion</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-5">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Delete Account</p>
                    <p className="text-xs text-gray-400">Permanently remove your account and all data</p>
                  </div>
                </div>
                {!showDeleteConfirm ? (
                  <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4" /> Delete My Account
                  </Button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-3 mt-2">
                    <p className="text-sm text-red-300 font-medium">This action cannot be undone.</p>
                    <p className="text-xs text-gray-400">All your habits, tasks, goals, journal entries, and account data will be permanently deleted.</p>
                    <Input type="password" value={deletePassword} placeholder="Enter your password to confirm"
                      onChange={e => setDeletePassword(e.target.value)} />
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                        Cancel
                      </Button>
                      <Button variant="danger" loading={deleteLoading} disabled={!deletePassword} onClick={handleDeleteAccount}>
                        Permanently Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;
