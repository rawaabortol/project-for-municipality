import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { TRIPOLI_DISTRICTS } from '../../utils/APIConst';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Briefcase,
  FileText,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Doctor / Medical Officer',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Inspector / Officer',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Specialist / Director',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Citizen Reporter 1',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Citizen Reporter 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Environmental Engineer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
  }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const { t, translateDistrict, translateRole, language, isRtl } = useLanguage();

  const [name, setName] = useState(currentUser.name || '');
  const [email] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [district, setDistrict] = useState(currentUser.district || 'Al-Tal');
  const [title, setTitle] = useState(currentUser.title || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[0].url);
  const [isSaving, setIsSaving] = useState(false);

  // Close modal when pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        district,
        title,
        bio,
        avatarUrl
      });
      showToast(t('profileUpdatedSuccess'));
      onClose();
    } catch (err: any) {
      showToast(err.message || (language === 'ar' ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t('userProfile')}</h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تعديل البيانات الشخصية والصورة' : 'Update personal details, avatar & contact info'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form id="profile-form" onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Avatar Section */}
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-3.5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={avatarUrl || PRESET_AVATARS[0].url}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md ring-2 ring-slate-900"
                  onError={(e: any) => {
                    e.target.src = PRESET_AVATARS[0].url;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-teal-600 rounded-lg text-white shadow">
                  <Camera className="w-3 h-3" />
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{name}</div>
                <div className="text-xs text-teal-400 font-semibold">{translateRole(currentUser.role)}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {currentUser.id} {currentUser.badgeNumber ? `• ${currentUser.badgeNumber}` : ''}
                </div>
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('profilePictureUrl')}
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Quick Avatar Presets */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                {t('selectAvatar')}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      avatarUrl === av.url ? 'border-teal-400 scale-105 shadow-md' : 'border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('fullName')} *
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('jobTitleBio')}
              </label>
              <div className="relative">
                <Briefcase className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'طبيب صحة عامة، مراقب، مواطن...' : 'Epidemiologist, Field Inspector...'}
                  className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500`}
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('emailAddress')} *
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  title={language === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email is your login and cannot be changed'}
                  className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 text-xs cursor-not-allowed focus:outline-none`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 font-mono`}
                />
              </div>
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('tripoliDistrict')}
            </label>
            <div className="relative">
              <MapPin className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500`}
              >
                {TRIPOLI_DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {translateDistrict(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('bio')}
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'معلومات إضافية عن ساعات التواجد أو التخصص الرقابي...'
                  : 'Surveillance background, sector patrol assignments, or resident notes...'
              }
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 leading-relaxed"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t('saveProfile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
