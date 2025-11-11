import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AVAILABLE_ICONS } from "../../constants/category-icons";
import { useCreateEntity } from "../../hooks/entity/useCreateEntity";

const CreateCategoryModal = ({ isOpen, onClose, novelId }) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("users");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEntityMutation = useCreateEntity();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for placeholder entity to create the section
      const formData = new FormData();
      formData.append('Name', `_section_${categoryName}`);
      formData.append('Section', categoryName); // Section instead of CategoryName/EntityType
      formData.append('Icon', selectedIcon);
      
      await createEntityMutation.mutateAsync({
        novelId,
        data: formData
      });
      
      toast.success("تم إنشاء الفئة بنجاح");
      onClose();
      setCategoryName("");
      setSelectedIcon("users");
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.message || 'فشل إنشاء الفئة');
    } finally {
      setIsSubmitting(false);
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
              إنشاء فئة جديدة
            </p>
            <p className="text-[#B8B8B8] text-base font-normal leading-normal noto-sans-arabic-regular">
              أضف فئة جديدة لتنظيم كياناتك
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end p-6 border-t border-[#5A5A5A]">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#4A4A4A] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-[#5A5A5A] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto noto-sans-arabic-bold"
          >
            <span className="truncate">إلغاء</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || isSubmitting}
            className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0077FF] text-white text-base font-bold leading-normal tracking-[0.015em] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto noto-sans-arabic-bold"
          >
            <span className="truncate noto-sans-arabic-bold">{isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الفئة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
