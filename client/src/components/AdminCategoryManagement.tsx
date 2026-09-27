import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { useData } from '../../context/DataContext';
import { Category } from '../../utils/sampleData';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, Plus, Save, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Skeleton } from './common/Skeleton';

export const AdminCategoryManagement: React.FC = () => {
  const { showToast } = useNotifications();
  const {
    t,
    translateCategory,
    language,
    isRtl
  } = useLanguage();

  const { refresh: refreshSharedData } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  const [newDesc, setNewDesc] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      setCategories(await categoryService.getCategories(true));
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleRefresh = () => {
    loadCategories();
  };

  // Local edit while typing; persisted on blur
  const handleWeightChange = (catId: string, weight: number) => {
    setCategories(prev => prev.map(c => (c.id === catId ? { ...c, baseWeight: weight } : c)));
  };

  const handleWeightCommit = async (cat: Category) => {
    const weight = Math.min(25, Math.max(1, cat.baseWeight || 10));
    try {
      const updated = await categoryService.updateCategory(cat.id, { baseWeight: weight });
      setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      refreshSharedData();
      showToast(
        language === 'ar'
          ? `تم تحديث الوزن الأساسي لفئة: ${translateCategory(cat.name)}`
          : `Base weight updated for ${cat.name}`
      );
    } catch (err: any) {
      showToast(err.message);
      loadCategories();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await categoryService.createCategory({
        name: newName.trim(),
        baseWeight: Number(newWeight),
        description: newDesc,
        icon: 'AlertCircle'
      });
      await loadCategories();
      refreshSharedData();
      showToast(
        language === 'ar'
          ? `تمت إضافة الفئة الجديدة "${newName}" إلى قاعدة البيانات بنجاح!`
          : `New category "${newName}" added to database!`
      );
      setNewName('');
      setNewDesc('');
      setNewWeight(10);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('categoriesManagementTitle')}</h1>
            <p className="text-xs text-slate-400">{t('categoriesManagementDesc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title={language === 'ar' ? 'تحديث الفئات' : 'Refresh Categories'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            {language === 'ar' ? 'الفئات النشطة في المنظومة:' : 'Active Categories:'} <strong>{categories.length}</strong>
          </div>
        </div>
      </div>

      {/* Add New Category Form */}
      <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-400" />
          {t('addNewCategory')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('categoryName')}</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: تسرب إشعاعي أو كيميائي' : 'e.g., Radiation Hazard'}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('baseRiskWeight')}</label>
            <input
              type="number"
              min={1}
              max={25}
              value={newWeight}
              onChange={e => setNewWeight(parseInt(e.target.value) || 10)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">{t('description')}</label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder={language === 'ar' ? 'وصف طبيعة البلاغ وتأثيره الصحي' : 'Brief criteria for health officers...'}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCategoryBtn')}</span>
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left rtl:text-right text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">{language === 'ar' ? 'اسم الفئة والرمز' : 'Category Name & Code'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الوزن الأساسي (1-25)' : 'Base Weight (1-25)'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                <th className="py-3 px-3.5">{language === 'ar' ? 'الأثر الخوارزمي' : 'Algorithm Impact'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3.5">
                        <Skeleton className="h-4 w-28 mb-1 bg-slate-800" rounded="rounded" />
                        <Skeleton className="h-2.5 w-16 bg-slate-800/70" rounded="rounded" />
                      </td>
                      <td className="py-3 px-3.5">
                        <Skeleton className="h-7 w-20 bg-slate-800" rounded="rounded-lg" />
                      </td>
                      <td className="py-3 px-3.5">
                        <Skeleton className="h-3 w-56 bg-slate-800" rounded="rounded" />
                      </td>
                      <td className="py-3 px-3.5">
                        <Skeleton className="h-5 w-24 bg-slate-800" rounded="rounded-md" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3.5">
                    <span className="font-bold text-white block">{translateCategory(cat.name)}</span>
                    <span className="font-mono text-[10px] text-teal-400">{cat.code}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={cat.baseWeight}
                        onChange={e => handleWeightChange(cat.id, parseInt(e.target.value) || 0)}
                        onBlur={() => handleWeightCommit(cat)}
                        className="w-16 bg-slate-800 border border-slate-700 text-slate-100 px-2 py-1 rounded text-xs font-bold text-center"
                      />
                      <span className="text-slate-400 text-[10px]">{language === 'ar' ? 'نقطة' : 'pts'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 text-xs max-w-sm">
                    {cat.description}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cat.baseWeight >= 14
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : cat.baseWeight >= 10
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {cat.baseWeight >= 14 ? (language === 'ar' ? 'أولوية عاجلة' : 'High Priority Tier') : cat.baseWeight >= 10 ? (language === 'ar' ? 'أولوية قياسية' : 'Standard Tier') : (language === 'ar' ? 'أولوية عادية' : 'Normal Tier')}
                    </span>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
