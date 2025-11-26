import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_ICONS } from "../../constants/category-icons";
import { useCreateEntity } from "../../hooks/entity/useCreateEntity";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const CreateCategoryModal = ({ 
  isOpen, 
  onClose, 
  novelId, 
  // Edit mode props
  editMode = false,
  sectionData = null // { id, name, icon } - the section to edit
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("users");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const createEntityMutation = useCreateEntity();
  const queryClient = useQueryClient();

  // Initialize form with edit data when in edit mode
  useEffect(() => {
    if (editMode && sectionData) {
      setCategoryName(sectionData.name || "");
      setSelectedIcon(sectionData.icon || "users");
    } else {
      setCategoryName("");
      setSelectedIcon("users");
    }
    setShowDeleteConfirm(false);
  }, [editMode, sectionData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (editMode && sectionData?.id) {
        // PATCH to update existing section
        const token = Cookies.get(TOKEN_KEY);
        const formData = new FormData();
        formData.append('Section', categoryName);
        formData.append('Icon', selectedIcon);
        // Keep the name pattern for section entities
        formData.append('Name', `_section_${categoryName}`);

        const response = await fetch(
          `${BASE_URL}/api/novels/${novelId}/entities/${sectionData.id}`,
          {
            method: 'PATCH',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update section');
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries(['sections', novelId]);
        queryClient.invalidateQueries(['entities', novelId]);
        
        toast.success("تم تحديث الفئة بنجاح");
      } else {
        // Create new section (existing logic)
        const formData = new FormData();
        formData.append('Name', `_section_${categoryName}`);
        formData.append('Section', categoryName);
        formData.append('Icon', selectedIcon);
        
        await createEntityMutation.mutateAsync({
          novelId,
          data: formData
        });
        
        toast.success("تم إنشاء الفئة بنجاح");
      }
      
      onClose();
      setCategoryName("");
      setSelectedIcon("users");
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(error.message || 'فشل حفظ الفئة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sectionData?.id) {
      toast.error('لا يمكن حذف هذه الفئة');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = Cookies.get(TOKEN_KEY);
      
      const response = await fetch(
        `${BASE_URL}/api/novels/${novelId}/entities/${sectionData.id}`,
        {
          method: 'DELETE',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete section');
        } else {
          throw new Error(`Failed to delete section: ${response.status}`);
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['sections', novelId]);
      queryClient.invalidateQueries(['entities', novelId]);
      
      toast.success("تم حذف الفئة بنجاح");
      onClose();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.message || 'فشل حذف الفئة');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#3C3C3C] rounded-xl border border-[#5A5A5A] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#5A5A5A]">
          <div className="flex flex-col gap-1">
            <p className="text-white text-2xl font-bold leading-tight noto-sans-arabic-extrabold">
              {editMode ? 'تعديل الفئة' : 'إنشاء فئة جديدة'}
            </p>
            <p className="text-[#B8B8B8] text-base font-normal leading-normal noto-sans-arabic-regular">
              {editMode ? 'قم بتعديل اسم الفئة أو الأيقونة' : 'أضف فئة جديدة لتنظيم كياناتك'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B8B8B8] transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6 p-6">
          {/* Category Name Input */}
          <label className="flex flex-col">
            <p className="text-white text-base font-medium leading-normal pb-2 noto-sans-arabic-bold">
              اسم الفئة
            </p>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#5A5A5A] bg-[#2C2C2C] p-[15px] text-base font-normal leading-normal text-white placeholder:text-[#797979] focus:border-[#0077FF] focus:outline-0 focus:ring-2 focus:ring-[#0077FF]/40 h-14 noto-sans-arabic-regular"
              placeholder="مثال: شخصيات، أماكن، تعويذات"
            />
          </label>

          {/* Icon Picker */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white text-base font-medium leading-tight noto-sans-arabic-bold">
              اختر أيقونة
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVAILABLE_ICONS.map(({ id, component: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all ${
                    selectedIcon === id
                      ? "bg-[#0077FF] text-white ring-2 ring-[#0077FF] ring-offset-2 ring-offset-[#3C3C3C]"
                      : "bg-[#2C2C2C] text-white hover:bg-[#4A4A4A]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Delete Confirmation */}
          {editMode && showDeleteConfirm && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
              <p className="text-red-400 text-sm noto-sans-arabic-bold mb-3">
                هل أنت متأكد من حذف هذه الفئة؟
              </p>
              <p className="text-[#B8B8B8] text-xs noto-sans-arabic-regular mb-4">
                سيتم حذف الفئة وجميع الكيانات المرتبطة بها. هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 noto-sans-arabic-bold"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#4A4A4A] text-white text-sm font-bold hover:bg-[#5A5A5A] transition-colors disabled:opacity-50 noto-sans-arabic-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between p-6 border-t border-[#5A5A5A]">
          {/* Delete Button (only in edit mode) */}
          <div>
            {editMode && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 noto-sans-arabic-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الفئة</span>
              </button>
            )}
          </div>
          
          {/* Save/Cancel Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#4A4A4A] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-[#5A5A5A] disabled:opacity-50 disabled:cursor-not-allowed noto-sans-arabic-bold"
            >
              <span className="truncate">إلغاء</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!categoryName.trim() || isSubmitting || isDeleting}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0077FF] text-white text-base font-bold leading-normal tracking-[0.015em] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed noto-sans-arabic-bold"
            >
              <span className="truncate noto-sans-arabic-bold">
                {isSubmitting ? 'جاري الحفظ...' : (editMode ? 'حفظ التغييرات' : 'إنشاء الفئة')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
