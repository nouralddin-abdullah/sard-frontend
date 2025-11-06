import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useUpdateReadingList } from "../../hooks/reading-list/useUpdateReadingList";

const UpdateReadingListModal = ({ isOpen, onClose, readingList }) => {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public"); // 'public' or 'private'
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const updateMutation = useUpdateReadingList();

  // Store original values for comparison
  const originalValues = useMemo(() => {
    if (readingList) {
      return {
        name: readingList.name || "",
        description: readingList.description || "",
        isPublic: readingList.isPublic,
        coverImageUrl: readingList.coverImageUrl || null,
      };
    }
    return null;
  }, [readingList]);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (isOpen && readingList) {
      setListName(readingList.name || "");
      setDescription(readingList.description || "");
      setPrivacy(readingList.isPublic ? "public" : "private");
      setCoverPreview(readingList.coverImageUrl || null);
      setCoverImage(null); // Reset file input
    }
  }, [isOpen, readingList]);

  if (!isOpen || !readingList || !originalValues) return null;

  // Check if any changes were made
  const hasChanges = () => {
    if (!originalValues) return false;
    
    const nameChanged = listName.trim() !== originalValues.name;
    const descriptionChanged = description.trim() !== originalValues.description;
    const privacyChanged = (privacy === "public") !== originalValues.isPublic;
    const imageChanged = coverImage !== null;
    
    console.log("Change Detection:", {
      nameChanged,
      descriptionChanged,
      privacyChanged,
      imageChanged,
      current: { name: listName.trim(), description: description.trim(), privacy },
      original: originalValues
    });
    
    return nameChanged || descriptionChanged || privacyChanged || imageChanged;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    updateMutation.mutate(
      {
        readingListId: readingList.id,
        name: listName.trim(),
        description: description.trim(),
        isPublic: privacy === "public",
        coverImage: coverImage,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setListName("");
    setDescription("");
    setPrivacy("public");
    setCoverImage(null);
    setCoverPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3A3A3A] rounded-2xl w-full max-w-md p-5 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 text-white hover:text-[#4A9EFF] transition-colors duration-300"
          disabled={updateMutation.isPending}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4 noto-sans-arabic-extrabold">
          تعديل قائمة القراءة
        </h2>

        {/* Cover Image Upload - Matching CreateReadingListModal */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-[120px] aspect-[3/4] rounded-lg overflow-hidden bg-[#4A4A4A] flex items-center justify-center mb-2" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
              />
              تغيير الصورة
            </label>
          )}
        </div>

        {/* List Name Input */}
        <div className="mb-3">
          <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
            اسم قائمة القراءة
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="اسم القائمة"
            className="w-full bg-[#5A5A5A] text-white rounded-lg px-3 py-2 text-sm text-right noto-sans-arabic-medium placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Description Input */}
        <div className="mb-3">
          <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
            الوصف (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف القائمة"
            rows={2}
            className="w-full bg-[#5A5A5A] text-white rounded-lg px-3 py-2 text-sm text-right noto-sans-arabic-medium placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] resize-none"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Privacy Setting and Warning in same row - Matching CreateReadingListModal */}
        <div className="mb-4 flex gap-3">
          {/* Privacy Dropdown */}
          <div className="flex-shrink-0">
            <label className="block text-white text-right mb-1.5 noto-sans-arabic-medium text-sm">
              خصوصية القائمة
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              disabled={updateMutation.isPending}
              className="bg-[#5A5A5A] text-white rounded-lg px-4 py-2 text-sm text-right noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] cursor-pointer appearance-none min-w-[120px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 1rem center',
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
          disabled={!listName.trim() || !hasChanges() || updateMutation.isPending}
          className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors duration-300 noto-sans-arabic-medium text-sm"
        >
          {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>

        {/* No changes message */}
        {!hasChanges() && listName.trim() && (
          <p className="text-[#686868] text-sm noto-sans-arabic-medium text-center mt-3">
            لم يتم إجراء أي تغييرات
          </p>
        )}
      </div>
    </div>
  );
};

export default UpdateReadingListModal;
