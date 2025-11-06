import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateReadingList } from "../../hooks/reading-list/useCreateReadingList";
import { toast } from "sonner";

const CreateReadingListModal = ({ isOpen, onClose }) => {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public"); // 'public' or 'private'
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const createMutation = useCreateReadingList();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setListName("");
      setDescription("");
      setPrivacy("public");
      setCoverImage(null);
      setCoverPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("نوع الملف يجب أن يكون JPEG أو PNG أو WebP");
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!listName.trim()) {
      toast.error("الرجاء إدخال اسم القائمة");
      return;
    }

    if (listName.trim().length > 100) {
      toast.error("اسم القائمة يجب أن يكون أقل من 100 حرف");
      return;
    }

    if (description && description.length > 1000) {
      toast.error("الوصف يجب أن يكون أقل من 1000 حرف");
      return;
    }

    createMutation.mutate(
      {
        name: listName.trim(),
        description: description.trim() || undefined,
        isPublic: privacy === "public",
        coverImage: coverImage,
      },
      {
        onSuccess: () => {
          toast.success("تم إنشاء القائمة بنجاح");
          onClose();
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message;
          if (errorMessage?.toLowerCase().includes("duplicate")) {
            toast.error("لديك قائمة بنفس الاسم بالفعل");
          } else {
            toast.error("حدث خطأ أثناء إنشاء القائمة");
          }
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3A3A3A] rounded-2xl w-full max-w-md p-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-white hover:text-[#4A9EFF] transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4 noto-sans-arabic-extrabold">
          إنشاء قائمة قراءة جديدة
        </h2>

        {/* Cover Image Upload */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-[120px] aspect-[3/4] rounded-lg overflow-hidden bg-[#4A4A4A] flex items-center justify-center mb-2" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer w-full h-full flex items-center justify-center px-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-[#686868] text-center noto-sans-arabic-medium text-sm">
                  انقر لتحميل صورة الغلاف
                </span>
              </label>
            )}
          </div>
          {coverPreview && (
            <label className="cursor-pointer text-[#4A9EFF] hover:text-[#3A8EEF] transition-colors duration-300 noto-sans-arabic-medium text-sm">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              تغيير الصورة
            </label>
          )}
        </div>

        {/* List Name Input */}
        <div className="mb-3">
          <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
            اسم قائمة القراءة <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="اسم القائمة الجديدة"
            maxLength={100}
            className="w-full bg-[#5A5A5A] text-white rounded-lg px-3 py-2 text-right noto-sans-arabic-medium text-sm placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]"
          />
        </div>

        {/* Description Input (Optional) */}
        <div className="mb-3">
          <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
            الوصف (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للقائمة"
            maxLength={1000}
            rows={2}
            className="w-full bg-[#5A5A5A] text-white rounded-lg px-3 py-2 text-right noto-sans-arabic-medium text-sm placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] resize-none"
          />
          <p className="text-[#888888] text-xs text-right mt-1 noto-sans-arabic-regular">
            {description.length}/1000
          </p>
        </div>

        {/* Privacy Setting and Warning in same row */}
        <div className="mb-4 flex gap-3">
          {/* Privacy Dropdown */}
          <div className="flex-shrink-0">
            <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
              خصوصية القائمة
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-[#5A5A5A] text-white rounded-lg px-4 py-2 text-right noto-sans-arabic-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] cursor-pointer appearance-none min-w-[120px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.75rem center',
                paddingLeft: '2.5rem'
              }}
            >
              <option value="public">عامة</option>
              <option value="private">خاصة</option>
            </select>
          </div>

          {/* Privacy Notice */}
          <div className="flex-1 bg-[#5A5A5A] rounded-lg p-2.5 flex items-start gap-2">
            <div className="w-6 h-6 bg-[#4A9EFF] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base font-bold">!</span>
            </div>
            <p className="text-[#CCCCCC] text-right text-xs noto-sans-arabic-medium leading-relaxed">
              تنويه: إذا كانت قائمتك خاصة، فلن يكون بإمكانك مشاركتها مع أي مستخدم. لضمان إمكانية المشاركة، يُرجى
              التأكد من ضبط الخصوصية على الوضع العام.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!listName.trim() || createMutation.isPending}
          className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors duration-300 noto-sans-arabic-medium text-sm flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الإنشاء...</span>
            </>
          ) : (
            "إنشاء القائمة"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateReadingListModal;
