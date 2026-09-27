import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../utils/sampleData';
import { TRIPOLI_DISTRICTS } from '../../utils/APIConst';
import {
  Users,
  Shield,
  UserCheck,
  Search,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Lock,
  X,
  Award,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { SkeletonUserRow } from './common/Skeleton';

export const AdminUsersManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();
  const {
    t,
    translateRole,
    translateDistrict,
    language,
    isRtl
  } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const { refresh: refreshSharedData } = useData();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Register New Citizen modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+961 ');
  const [newDistrict, setNewDistrict] = useState('Al-Tal');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Role Assignment modal state
  const [assignmentUser, setAssignmentUser] = useState<User | null>(null);
  const [assignRole, setAssignRole] = useState<'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR'>('HEALTH_OFFICER');
  const [assignBadge, setAssignBadge] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      setUsers(await userService.getUsers());
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    loadUsers();
  };

  // Open Role Assignment Modal
  const openRoleAssignModal = (user: User, targetRole: 'CITIZEN' | 'HEALTH_OFFICER' | 'ADMINISTRATOR') => {
    setAssignmentUser(user);
    setAssignRole(targetRole);

    if (targetRole === 'HEALTH_OFFICER') {
      setAssignBadge(user.badgeNumber || `TRP-OFF-${Math.floor(Math.random() * 80 + 10)}`);
      setAssignTitle(user.title && user.title !== 'Resident Reporter' ? user.title : (language === 'ar' ? 'مفتش كشف ومختبر ميداني' : 'Municipal Field Inspector'));
    } else if (targetRole === 'ADMINISTRATOR') {
      setAssignBadge(user.badgeNumber || `TRP-ADM-${Math.floor(Math.random() * 80 + 10)}`);
      setAssignTitle(language === 'ar' ? 'مدير إدارة الترصد الصحي البلدي' : 'Health Directorate Administrator');
    } else {
      setAssignBadge('');
      setAssignTitle(language === 'ar' ? 'راصد مجتمعي' : 'Resident Reporter');
    }
  };

  const handleConfirmRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentUser) return;

    setIsAssigning(true);
    try {
      const updated = await userService.updateRole(assignmentUser.id, assignRole, assignBadge, assignTitle);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      refreshSharedData();
      showToast(
        language === 'ar'
          ? `تم تحديث صلاحيات ${assignmentUser.name} بنجاح إلى: ${translateRole(assignRole)}.`
          : `Role assigned successfully: ${assignmentUser.name} is now ${translateRole(assignRole)}.`
      );
      setAssignmentUser(null);
    } catch (err: any) {
      showToast(err.message || 'Role update failed');
    } finally {
      setIsAssigning(false);
    }
  };

  // Register New Citizen (server always creates CITIZEN accounts; roles are assigned afterwards)
  const handleCreateCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast(language === 'ar' ? 'يرجى إدخال الاسم والبريد الإلكتروني.' : 'Please enter name and email.');
      return;
    }
    if (newPassword.length < 6) {
      showToast(language === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }

    setIsCreating(true);
    try {
      const newCitizen = await userService.createCitizen({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() === '+961 ' ? '' : newPhone.trim(),
        district: newDistrict,
        password: newPassword
      });
      setUsers(prev => [newCitizen, ...prev]);
      setShowCreateModal(false);

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('+961 ');
      setNewDistrict('Al-Tal');
      setNewPassword('');

      showToast(
        language === 'ar'
          ? `تم تسجيل المواطن "${newCitizen.name}" بنجاح! يمكنك الآن تعيين دور أو شارة له من الجدول.`
          : `Citizen "${newCitizen.name}" registered! You can now assign them a role or badge from the directory.`
      );
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Restrict access if not administrator
  if (currentUser.role !== 'ADMINISTRATOR') {
    return (
      <div className="bg-slate-900 border border-rose-800/50 p-8 rounded-3xl text-center max-w-xl mx-auto space-y-4 my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {language === 'ar' ? 'صلاحيات وصول مقيدة' : 'Access Restricted'}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {language === 'ar'
            ? 'تعديل الصلاحيات وتعيين الأدوار والرتب للمواطنين مقتصر حصرياً على مديري النظام (الإدارة البلدية).'
            : 'Role assignment and permission modification is strictly restricted to Municipal System Administrators.'}
        </p>
      </div>
    );
  }

  const filtered = users.filter(u => {
    if (selectedRoleFilter !== 'ALL' && u.role !== selectedRoleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q) ||
        translateDistrict(u.district).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">{t('usersDirectoryTitle')}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {language === 'ar' ? 'إدارة الأدوار حصرياً' : 'Admin Role Assignment Only'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('usersDirectoryDesc')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل مواطن جديد' : 'Register New Citizen'}</span>
          </button>

          <button
            onClick={handleRefresh}
            title={language === 'ar' ? 'تحديث قائمة المستخدمين' : 'Refresh Users Directory'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <div className="text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
            {t('totalRegisteredUsers')} <strong>{users.length}</strong>
          </div>
        </div>
      </div>

      {/* Security Rule Notice Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-slate-300">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0 border border-teal-500/30">
          <Shield className="w-4 h-4" />
        </div>
        <p className="leading-relaxed text-[11px]">
          <strong className="text-teal-300">
            {language === 'ar' ? 'قاعدة النظام الإلزامية: ' : 'System RBAC Rule: '}
          </strong>
          {language === 'ar'
            ? 'تُنشأ كافة الحسابات الجديدة برتبة "مواطن" فقط ولا يمكن لأي مستخدم التسجيل المباشر كموظف. بصفتك مديراً للنظام، أنت فقط المخول بتعيين رتب المراقبين الصحيين وتوزيع الشارات الرسمية.'
            : 'All new users are registered strictly as Citizens and cannot self-enroll as employees. As an Administrator, you are exclusively authorized to assign roles, officer designations, and field badges.'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، البريد أو الحي...' : 'Search by name, email, or district...'}
            className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedRoleFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'} ({users.length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('HEALTH_OFFICER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedRoleFilter === 'HEALTH_OFFICER' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'المراقبون الصحيون' : 'Health Officers'} ({users.filter(u => u.role === 'HEALTH_OFFICER').length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('CITIZEN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedRoleFilter === 'CITIZEN' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'المواطنون' : 'Citizens'} ({users.filter(u => u.role === 'CITIZEN').length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('ADMINISTRATOR')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedRoleFilter === 'ADMINISTRATOR' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'الإداريون' : 'Administrators'} ({users.filter(u => u.role === 'ADMINISTRATOR').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[660px] text-left rtl:text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الاسم وبيانات الاتصال' : 'Name & Contact'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الدور الحالي' : 'Current Role'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الحي / النطاق' : 'District / Area'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'رقم الشارة' : 'Badge Number'}</th>
                <th className="py-3 px-3.5 text-right rtl:text-left">{language === 'ar' ? 'إجراء تعيين الدور (للإدارة فقط)' : 'Assign Role (Admin Only)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <>
                  <SkeletonUserRow />
                  <SkeletonUserRow />
                  <SkeletonUserRow />
                  <SkeletonUserRow />
                  <SkeletonUserRow />
                </>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                            {language === 'ar' ? 'حسابك' : 'You'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">{user.email} • {user.phone}</div>
                      {user.title && (
                        <div className="text-[10px] text-teal-400/90 mt-0.5">{user.title}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'ADMINISTRATOR'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : user.role === 'HEALTH_OFFICER'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {translateRole(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      📍 {translateDistrict(user.district)}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-teal-300 text-xs">
                      {user.badgeNumber ? (
                        <span className="px-2 py-0.5 bg-slate-800 rounded border border-teal-500/30 text-[11px]">
                          {user.badgeNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right rtl:text-left">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={user.role}
                          onChange={e => openRoleAssignModal(user, e.target.value as any)}
                          className="bg-slate-800 border border-slate-700 hover:border-purple-500 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-teal-500 transition-colors font-semibold cursor-pointer"
                        >
                          <option value="CITIZEN">{translateRole('CITIZEN')}</option>
                          <option value="HEALTH_OFFICER">{translateRole('HEALTH_OFFICER')}</option>
                          <option value="ADMINISTRATOR">{translateRole('ADMINISTRATOR')}</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {assignmentUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'تعيين دور وصلاحيات للمواطن' : 'Assign Role & Credentials'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{assignmentUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignmentUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRoleAssignment} className="p-6 space-y-4">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400">{language === 'ar' ? 'المستخدم المستهدف:' : 'Target Citizen:'} <strong className="text-white">{assignmentUser.name}</strong></div>
                <div className="text-slate-400">{language === 'ar' ? 'الدور الحالي:' : 'Current Role:'} <span className="text-teal-300 font-semibold">{translateRole(assignmentUser.role)}</span></div>
                <div className="text-slate-400">{language === 'ar' ? 'الحي:' : 'District:'} {translateDistrict(assignmentUser.district)}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {language === 'ar' ? 'الدور الجديد المراد تعيينه *' : 'New Role to Assign *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignRole('CITIZEN');
                      setAssignBadge('');
                      setAssignTitle(language === 'ar' ? 'راصد مجتمعي' : 'Resident Reporter');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      assignRole === 'CITIZEN'
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {translateRole('CITIZEN')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignRole('HEALTH_OFFICER');
                      setAssignBadge(assignmentUser.badgeNumber || `TRP-OFF-${Math.floor(Math.random() * 80 + 10)}`);
                      setAssignTitle(language === 'ar' ? 'مفتش كشف ومختبر ميداني' : 'Municipal Field Inspector');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      assignRole === 'HEALTH_OFFICER'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {translateRole('HEALTH_OFFICER')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignRole('ADMINISTRATOR');
                      setAssignBadge(assignmentUser.badgeNumber || `TRP-ADM-${Math.floor(Math.random() * 80 + 10)}`);
                      setAssignTitle(language === 'ar' ? 'مدير إدارة الترصد الصحي البلدي' : 'Health Directorate Administrator');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      assignRole === 'ADMINISTRATOR'
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {translateRole('ADMINISTRATOR')}
                  </button>
                </div>
              </div>

              {assignRole === 'HEALTH_OFFICER' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-teal-400" />
                    <span>{language === 'ar' ? 'بيانات الاعتماد الميداني للمراقب الصحي' : 'Municipal Field Officer Credentials'}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {language === 'ar' ? 'رقم الشارة الرسمية (Badge Number)' : 'Official Badge Number'}
                    </label>
                    <input
                      type="text"
                      value={assignBadge}
                      onChange={e => setAssignBadge(e.target.value)}
                      placeholder="TRP-OFF-18"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-teal-300 font-mono text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {language === 'ar' ? 'المسمى الوظيفي المعتمد' : 'Official Designation Title'}
                    </label>
                    <input
                      type="text"
                      value={assignTitle}
                      onChange={e => setAssignTitle(e.target.value)}
                      placeholder={language === 'ar' ? 'مفتش كشف ومختبر ميداني' : 'Municipal Field Inspector'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              {assignRole === 'ADMINISTRATOR' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>{language === 'ar' ? 'صلاحيات إدارة المنظومة الكاملة' : 'System Administrator Privileges'}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {language === 'ar' ? 'رقم شارة الإدارة' : 'Admin Identifier Badge'}
                    </label>
                    <input
                      type="text"
                      value={assignBadge}
                      onChange={e => setAssignBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {assignRole === 'CITIZEN' && assignmentUser.role !== 'CITIZEN' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {language === 'ar'
                      ? 'تنبيه: سيتم إلغاء شارة المراقب الميدانية وإعادة المستخدم إلى صلاحيات مواطن عادي.'
                      : 'Notice: Field badge and inspection privileges will be revoked, returning user to standard Citizen role.'}
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssignmentUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all"
                >
                  {isAssigning
                    ? (language === 'ar' ? 'جاري الاعتماد...' : 'Assigning...')
                    : (language === 'ar' ? 'اعتماد الدور وتحديث الصلاحيات' : 'Confirm Role Assignment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Citizen Modal (Strictly Citizen Only) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'تسجيل مواطن جديد في المنظومة' : 'Register New Citizen'}
                  </h3>
                  <p className="text-[11px] text-teal-400">
                    {language === 'ar' ? 'الصلاحية الافتراضية: مواطن فقط' : 'Strict Role: Citizen Only'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCitizen} className="p-6 space-y-3.5">
              {/* Notice Card */}
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'ar' ? 'سياسة إنشاء الحسابات' : 'Account Creation Policy'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? 'يتم إنشاء كافة الحسابات الجديدة كـ "مواطن" حصراً. بعد التسجيل يمكنك كمدير ترقية الحساب إلى مراقب صحي ومنحه الشارة الميدانية.'
                    : 'All new accounts are strictly created as Citizens. Once created, you as Administrator can assign an employee or health officer role.'}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: سامر كبارة' : 'e.g., Samer Kabbara'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="citizen@tripoli.lb"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'الحي / المنطقة' : 'Tripoli District'}
                  </label>
                  <select
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                  >
                    {TRIPOLI_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {translateDistrict(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {language === 'ar' ? 'كلمة المرور' : 'Initial Password'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-bold shadow-lg transition-all"
                >
                  {isCreating
                    ? (language === 'ar' ? 'جاري التسجيل...' : 'Registering...')
                    : (language === 'ar' ? 'تسجيل المواطن' : 'Register Citizen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
