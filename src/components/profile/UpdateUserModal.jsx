import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, Upload, Image, X } from "lucide-react";
import { useUpdateMe } from "../../hooks/user/useUpdateMe";
import { toast } from "sonner";

const UpdateUserModal = ({ userData, isOpen, onClose }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    displayName: "",
    userBio: "",
    profilePhoto: null,
    profileBanner: null,
  });

  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState({
    profilePhoto: null,
    profileBanner: null,
  });

  // Initialize form data when modal opens or userData changes
  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        userName: userData.userName || "",
        displayName: userData.displayName || "",
        userBio: userData.userBio || "",
        profilePhoto: null,
        profileBanner: null,
      });
      setPreviews({
        profilePhoto: userData.profilePhotoUrl || null,
        profileBanner: userData.profileBannerUrl || null,
      });
      setErrors({});
    }
  }, [userData, isOpen]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        if (!value.trim()) {
          return "اسم المستخدم مطلوب";
        }
        if (value.length < 3) {
          return "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
        }
        if (value.length > 20) {
          return "اسم المستخدم يجب ألا يتجاوز 20 حرف";
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط";
        }
        return "";

      case "displayName":
        if (!value.trim()) {
          return "الاسم المعروض مطلوب";
        }
        if (value.length > 50) {
          return "الاسم المعروض يجب ألا يتجاوز 50 حرف";
        }
        return "";

      case "userBio":
        if (value.length > 500) {
          return "السيرة الذاتية يجب ألا تتجاوز 500 حرف";
        }
        return "";

      default:
        return "";
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle file uploads
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "يجب أن يكون الملف صورة",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "حجم الملف يجب ألا يتجاوز 5 ميجابايت",
        }));
        return;
      }

      // Clear any existing errors
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));

      // Update form data
      setFormData((prev) => ({ ...prev, [fieldName]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({ ...prev, [fieldName]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded file
  const removeFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreviews((prev) => ({
      ...prev,
      [fieldName]: userData?.[`${fieldName}Url`] || null,
    }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    newErrors.userName = validateField("userName", formData.userName);
    newErrors.displayName = validateField("displayName", formData.displayName);
    newErrors.userBio = validateField("userBio", formData.userBio);

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error);
  };

  const { mutateAsync: updateMe, isPending } = useUpdateMe();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (validateForm()) {
        const formDataPayload = new FormData();
        
        // Check if username has changed
        const usernameChanged = formData.userName !== userData.userName;
        const newUsername = formData.userName;

        formDataPayload.append("UserName", formData.userName);
        formDataPayload.append("DisplayName", formData.displayName);
        formDataPayload.append("UserBio", formData.userBio);

        formData.profilePhoto &&
          formDataPayload.append("ProfilePhoto", formData.profilePhoto);

        formData.profileBanner &&
          formDataPayload.append("ProfileBanner", formData.profileBanner);

        await updateMe(formDataPayload);

        // Close modal first
        onClose();
        
        // If username changed, redirect to new profile URL
        if (usernameChanged) {
          toast.success("تم تحديث الملف الشخصي بنجاح");
          // Small delay to allow the toast to show before navigation
          setTimeout(() => {
            navigate(`/profile/${newUsername}`, { replace: true });
          }, 500);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      userName: "",
      displayName: "",
      userBio: "",
      profilePhoto: null,
      profileBanner: null,
    });
    setPreviews({
      profilePhoto: null,
      profileBanner: null,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3A3A3A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-[#3A3A3A] p-6 border-b border-neutral-600 flex items-center justify-between z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white noto-sans-arabic-extrabold">
            تحديث الملف الشخصي
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-neutral-600 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-neutral-600">
            <label className="block text-base md:text-lg font-semibold text-white noto-sans-arabic-medium">
              الصورة الشخصية
            </label>
            
            <div className="relative">
              {previews.profilePhoto ? (
                <>
                  <img
                    src={previews.profilePhoto}
                    alt="معاينة الصورة الشخصية"
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-600"
                    style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
                  />
                  {formData.profilePhoto && (
                    <button
                      type="button"
                      onClick={() => removeFile("profilePhoto")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="w-32 h-32 rounded-full bg-neutral-600 flex items-center justify-center border-4 border-neutral-500">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-lg px-6 py-3 cursor-pointer transition-colors noto-sans-arabic-medium">
              <Upload className="h-5 w-5" />
              <span>
                {formData.profilePhoto ? "تغيير الصورة" : "رفع صورة"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profilePhoto")}
                className="hidden"
              />
            </label>
            {errors.profilePhoto && (
              <p className="text-red-400 text-sm noto-sans-arabic-medium">{errors.profilePhoto}</p>
            )}
          </div>

          {/* Profile Banner Section */}
          <div className="space-y-4 pb-6 border-b border-neutral-600">
            <label className="block text-base md:text-lg font-semibold text-white noto-sans-arabic-medium">
              صورة الغلاف
            </label>
            
            {previews.profileBanner ? (
              <div className="relative">
                <img
                  src={previews.profileBanner}
                  alt="معاينة صورة الغلاف"
                  className="w-full h-48 rounded-xl object-cover border-2 border-neutral-600"
                  style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
                />
                {formData.profileBanner && (
                  <button
                    type="button"
                    onClick={() => removeFile("profileBanner")}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full h-48 rounded-xl bg-neutral-600 flex flex-col items-center justify-center border-2 border-dashed border-neutral-500">
                <Image className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                  رفع صورة الغلاف
                </span>
              </div>
            )}

            <label className="flex items-center justify-center gap-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg px-6 py-3 cursor-pointer transition-colors noto-sans-arabic-medium">
              <Image className="h-5 w-5" />
              <span>
                {formData.profileBanner ? "تغيير الغلاف" : "رفع صورة الغلاف"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "profileBanner")}
                className="hidden"
              />
            </label>
            {errors.profileBanner && (
              <p className="text-red-400 text-sm noto-sans-arabic-medium">{errors.profileBanner}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="userName" className="block text-base md:text-lg font-semibold text-white noto-sans-arabic-medium">
              اسم المستخدم <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 right-4 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="أدخل اسم المستخدم"
                className={`w-full bg-[#5A5A5A] text-white rounded-lg pr-12 pl-4 py-3 text-right noto-sans-arabic-medium focus:outline-none focus:ring-2 ${
                  errors.userName ? "focus:ring-red-400 border-2 border-red-400" : "focus:ring-[#4A9EFF]"
                } transition-all`}
                required
              />
            </div>
            {errors.userName && (
              <p className="text-red-400 text-sm noto-sans-arabic-medium">{errors.userName}</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-base md:text-lg font-semibold text-white noto-sans-arabic-medium">
              الاسم المعروض <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 right-4 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="أدخل الاسم المعروض"
                className={`w-full bg-[#5A5A5A] text-white rounded-lg pr-12 pl-4 py-3 text-right noto-sans-arabic-medium focus:outline-none focus:ring-2 ${
                  errors.displayName ? "focus:ring-red-400 border-2 border-red-400" : "focus:ring-[#4A9EFF]"
                } transition-all`}
                required
              />
            </div>
            {errors.displayName && (
              <p className="text-red-400 text-sm noto-sans-arabic-medium">{errors.displayName}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="userBio" className="block text-base md:text-lg font-semibold text-white noto-sans-arabic-medium">
              السيرة الذاتية
              <span className="text-gray-400 text-sm mr-2">
                ({formData.userBio.length}/500)
              </span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute top-3 right-4 h-5 w-5 text-gray-400 pointer-events-none" />
              <textarea
                id="userBio"
                name="userBio"
                value={formData.userBio}
                onChange={handleInputChange}
                placeholder="اكتب نبذة عنك..."
                rows={4}
                className={`w-full bg-[#5A5A5A] text-white rounded-lg pr-12 pl-4 py-3 text-right noto-sans-arabic-medium focus:outline-none focus:ring-2 ${
                  errors.userBio ? "focus:ring-red-400 border-2 border-red-400" : "focus:ring-[#4A9EFF]"
                } transition-all resize-none`}
              />
            </div>
            {errors.userBio && (
              <p className="text-red-400 text-sm noto-sans-arabic-medium">{errors.userBio}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-600">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-white bg-neutral-600 hover:bg-neutral-500 rounded-lg transition-colors noto-sans-arabic-medium"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-[#4A9EFF] text-white rounded-lg hover:bg-[#3A8EEF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors noto-sans-arabic-medium flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التحديث...</span>
                </>
              ) : (
                "تحديث الملف الشخصي"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;
