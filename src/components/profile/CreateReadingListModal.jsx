import React, { useState } from "react";
import { X } from "lucide-react";

const CreateReadingListModal = ({ isOpen, onClose }) => {
  const [listName, setListName] = useState("");
  const [privacy, setPrivacy] = useState("public"); // 'public' or 'private'
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  if (!isOpen) return null;

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

  const handleSubmit = () => {
    // TODO: API call to create reading list
    console.log({
      name: listName,
      privacy: privacy,
      coverImage: coverImage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3A3A3A] rounded-2xl w-full max-w-xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:text-[#4A9EFF] transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-6 noto-sans-arabic-extrabold">
          إنشاء قائمة قراءة جديدة
        </h2>

        {/* Cover Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-[160px] aspect-[3/4] rounded-xl overflow-hidden bg-[#4A4A4A] flex items-center justify-center mb-3" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-[#686868] text-center noto-sans-arabic-medium">
                  انقر لتحميل صورة الغلاف
                </span>
              </label>
            )}
          </div>
          {coverPreview && (
            <label className="cursor-pointer text-[#4A9EFF] hover:text-[#3A8EEF] transition-colors duration-300 noto-sans-arabic-medium">
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
        <div className="mb-5">
          <label className="block text-white text-right mb-2 noto-sans-arabic-medium text-sm">
            اسم قائمة القراءة
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="اسم القائمة الجديدة"
            className="w-full bg-[#5A5A5A] text-white rounded-lg px-4 py-2.5 text-right noto-sans-arabic-medium placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]"
          />
        </div>

        {/* Privacy Setting and Warning in same row */}
        <div className="mb-6 flex gap-4">
          {/* Privacy Dropdown */}
          <div className="flex-shrink-0">
            <label className="block text-white text-right mb-2 noto-sans-arabic-medium text-sm">
              خصوصية القائمة
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-[#5A5A5A] text-white rounded-lg px-5 py-2.5 text-right noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] cursor-pointer appearance-none min-w-[140px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 1rem center',
                paddingLeft: '3rem'
              }}
            >
              <option value="public">عامة</option>
              <option value="private">خاصة</option>
            </select>
          </div>

          {/* Privacy Notice */}
          <div className="flex-1 bg-[#5A5A5A] rounded-lg p-3 flex items-start gap-2">
            <div className="w-7 h-7 bg-[#4A9EFF] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">!</span>
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
          disabled={!listName.trim()}
          className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed text-white py-2.5 rounded-lg transition-colors duration-300 noto-sans-arabic-medium text-base"
        >
          إنشاء القائمة
        </button>
      </div>
    </div>
  );
};

export default CreateReadingListModal;
