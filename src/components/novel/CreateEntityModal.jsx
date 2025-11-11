import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { useCreateEntity } from "../../hooks/entity/useCreateEntity";

const CreateEntityModal = ({ isOpen, onClose, categoryName = "شخصية", categoryIcon = "users", novelId }) => {
  const [entityName, setEntityName] = useState("");
  const [role, setRole] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEntityMutation = useCreateEntity();

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!entityName.trim() || !novelId) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData to send image file (backend handles Cloudflare R2 upload)
      const formData = new FormData();
      formData.append('Name', entityName);
      formData.append('Section', categoryName); // Section replaces CategoryName and EntityType
      
      if (role) {
        formData.append('Role', role);
      }
      
      if (shortDescription) {
        formData.append('ShortDescription', shortDescription);
      }
      
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }
      
      // Create entity with FormData (backend uploads to Cloudflare R2)
      await createEntityMutation.mutateAsync({
        novelId,
        data: formData
      });
      
      toast.success("تم إنشاء الكيان بنجاح");
      onClose();
      // Reset form
      setEntityName("");
      setRole("");
      setShortDescription("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to create entity:', error);
      toast.error(error.message || 'فشل إنشاء الكيان');
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
      <div className="relative w-full max-w-lg bg-[#3C3C3C] rounded-xl border border-[#5A5A5A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between border-b border-[#5A5A5A] p-6 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-xl font-bold leading-tight noto-sans-arabic-extrabold">
              إضافة {categoryName} جديدة
            </h2>
            <p className="text-[#B8B8B8] text-sm font-normal leading-normal noto-sans-arabic-regular">
              املأ التفاصيل أدناه لإنشاء كيان جديد
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B8B8B8] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:ring-offset-2 focus:ring-offset-[#3C3C3C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - Scrollable without scrollbar */}
        <div className="flex flex-col gap-6 p-6 overflow-y-auto scrollbar-hide flex-1">
          {/* Entity Name Input */}
          <label className="flex flex-col">
            <p className="pb-2 text-base font-medium leading-normal text-white noto-sans-arabic-bold">
              اسم {categoryName}
            </p>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#5A5A5A] bg-[#2C2C2C] p-4 text-base font-normal leading-normal text-white placeholder:text-[#797979] focus:border-[#0077FF] focus:outline-0 focus:ring-2 focus:ring-[#0077FF]/50 noto-sans-arabic-regular"
              placeholder="مثال: أراجورن، ابن أراثورن"
            />
          </label>

          {/* Role Input */}
          <label className="flex flex-col">
            <p className="pb-2 text-base font-medium leading-normal text-white noto-sans-arabic-bold">
              الدور (اختياري)
            </p>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#5A5A5A] bg-[#2C2C2C] p-4 text-base font-normal leading-normal text-white placeholder:text-[#797979] focus:border-[#0077FF] focus:outline-0 focus:ring-2 focus:ring-[#0077FF]/50 noto-sans-arabic-regular"
              placeholder="مثال: بطل، شرير، شخصية ثانوية"
            />
          </label>

          {/* Short Description Input */}
          <label className="flex flex-col">
            <p className="pb-2 text-base font-medium leading-normal text-white noto-sans-arabic-bold">
              وصف مختصر (اختياري)
            </p>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#5A5A5A] bg-[#2C2C2C] p-4 text-base font-normal leading-normal text-white placeholder:text-[#797979] focus:border-[#0077FF] focus:outline-0 focus:ring-2 focus:ring-[#0077FF]/50 noto-sans-arabic-regular"
              placeholder="وصف قصير عن الكيان"
            />
          </label>

          {/* Image Uploader */}
          <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-[#5A5A5A] px-6 py-10">
            {imagePreview ? (
              <div className="relative w-full max-w-xs">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg"
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-white noto-sans-arabic-extrabold">
                    صورة مصغرة
                  </p>
                  <p className="text-sm font-normal leading-normal text-[#B8B8B8] noto-sans-arabic-regular">
                    اسحب وأفلت صورة هنا، أو انقر للتصفح
                  </p>
                </div>
                <label className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#4A4A4A] px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-[#5A5A5A] noto-sans-arabic-bold">
                  <Upload className="w-4 h-4" />
                  <span className="truncate">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Footer Buttons - Fixed */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#5A5A5A] px-6 py-4 flex-shrink-0 bg-[#3C3C3C]">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#4A4A4A] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-[#5A5A5A] disabled:opacity-50 disabled:cursor-not-allowed noto-sans-arabic-bold"
          >
            <span className="truncate">إلغاء</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!entityName.trim() || isSubmitting}
            className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#0077FF] px-5 text-base font-bold leading-normal tracking-[0.015em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed noto-sans-arabic-bold"
          >
            <span className="truncate noto-sans-arabic-bold">{isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الكيان'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEntityModal;
