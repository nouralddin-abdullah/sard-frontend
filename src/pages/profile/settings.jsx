import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, Save, ArrowRight, User, Link as LinkIcon, Lock } from "lucide-react";
import Header from "../../components/common/Header";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { useUpdateMe } from "../../hooks/user/useUpdateMe";
import { useUpdatePassword } from "../../hooks/user/useUpdatePassword";
import { toast } from "sonner";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { data: userData, isPending } = useGetLoggedInUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateMe();
  const { mutateAsync: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();

  // Active section state
  const [activeSection, setActiveSection] = useState("account");

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Track only changed fields
  const [changedFields, setChangedFields] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    userName: "",
    displayName: "",
    userBio: "",
    facebookUrl: "",
    twitterUrl: "",
    discordUrl: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profileBannerPreview, setProfileBannerPreview] = useState(null);

  // Sidebar sections
  const sections = [
    { id: "account", label: "الحساب", icon: User },
    { id: "social", label: "وسائل التواصل", icon: LinkIcon },
    { id: "password", label: "كلمة المرور", icon: Lock },
  ];

  // Initialize form data when userData loads
  React.useEffect(() => {
    if (userData) {
      setFormData({
        userName: userData.userName || "",
        displayName: userData.displayName || "",
        userBio: userData.userBio || "",
        facebookUrl: userData.facebookUrl || "",
        twitterUrl: userData.twitterUrl || "",
        discordUrl: userData.discordUrl || "",
      });
      setProfilePhotoPreview(userData.profilePhoto);
      setProfileBannerPreview(userData.profileBanner);
    }
  }, [userData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Track that this field has changed
    const originalValue = userData?.[field] || "";
    if (value !== originalValue) {
      setChangedFields((prev) => ({ ...prev, [field]: value }));
    } else {
      // Remove from changed fields if reverted to original
      setChangedFields((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if anything changed
    if (Object.keys(changedFields).length === 0 && !profilePhoto && !profileBanner) {
      toast.info("لم يتم تغيير أي شيء");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Only append changed text fields
      Object.keys(changedFields).forEach((key) => {
        formDataToSend.append(key, changedFields[key]);
      });

      // Append files if they exist
      if (profilePhoto) {
        formDataToSend.append("ProfilePhoto", profilePhoto);
      }
      if (profileBanner) {
        formDataToSend.append("ProfileBanner", profileBanner);
      }

      await updateUser(formDataToSend);
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setChangedFields({});
      setProfilePhoto(null);
      setProfileBanner(null);
      
      // Navigate back to profile
      navigate(`/profile/${userData?.userName}`);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("الرجاء ملء جميع الحقول");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success("تم تغيير كلمة المرور بنجاح");
      
      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء تغيير كلمة المرور");
    }
  };

  if (isPending) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#1C1C1C] flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1C1C1C]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-800">
            <button
              onClick={() => navigate(`/profile/${userData?.userName}`)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <h1 className="text-2xl text-white noto-sans-arabic-bold">الإعدادات</h1>
          </div>

          <div className="flex">
            {/* Sidebar Navigation */}
            <aside className="w-80 border-l border-gray-800 min-h-screen bg-[#1C1C1C]">
              <nav className="py-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 text-right transition-colors ${
                        activeSection === section.id
                          ? "bg-[#2C2C2C] text-white border-l-4 border-[#4A9EFF]"
                          : "text-gray-400 hover:bg-[#2C2C2C] hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="noto-sans-arabic-bold text-lg">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 px-8 py-6 bg-[#1C1C1C]">
              <div className="max-w-3xl">
                {/* Account Section */}
                {activeSection === "account" && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl text-white noto-sans-arabic-bold mb-2">حسابك</h2>
                      <p className="text-gray-400 noto-sans-arabic-medium">قم بإدارة معلومات حسابك وصورك الشخصية</p>
                    </div>

                    {/* Profile Banner */}
                    <div className="space-y-3">
                      <label className="block text-white noto-sans-arabic-bold text-lg">صورة الغلاف</label>
                      <div className="relative">
                        <div
                          className="w-full h-48 bg-[#2C2C2C] rounded-xl bg-cover bg-center relative overflow-hidden border border-gray-700"
                          style={{
                            backgroundImage: profileBannerPreview ? `url(${profileBannerPreview})` : "none",
                          }}
                        >
                          {!profileBannerPreview && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                              <Camera className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="banner-upload"
                          className="absolute bottom-4 right-4 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white px-4 py-2 rounded-lg cursor-pointer transition-colors noto-sans-arabic-bold flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          {profileBannerPreview ? "تغيير الغلاف" : "رفع غلاف"}
                        </label>
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileBannerChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="space-y-3">
                      <label className="block text-white noto-sans-arabic-bold text-lg">الصورة الشخصية</label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div
                            className="w-32 h-32 rounded-full bg-[#2C2C2C] bg-cover bg-center overflow-hidden border-2 border-gray-700"
                            style={{
                              backgroundImage: profilePhotoPreview ? `url(${profilePhotoPreview})` : "none",
                            }}
                          >
                            {!profilePhotoPreview && (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Camera className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <label
                            htmlFor="photo-upload"
                            className="absolute bottom-0 right-0 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white p-2 rounded-full cursor-pointer transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                          </label>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoChange}
                            className="hidden"
                          />
                        </div>
                        <div className="text-gray-400 noto-sans-arabic-medium">
                          <p>حجم الصورة الموصى به: 400×400 بكسل</p>
                          <p className="text-sm">الصيغ المدعومة: JPG, PNG, GIF</p>
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">اسم المستخدم</label>
                      <input
                        type="text"
                        value={formData.userName}
                        onChange={(e) => handleInputChange("userName", e.target.value)}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        dir="ltr"
                      />
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">الاسم المعروض</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange("displayName", e.target.value)}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">نبذة عني</label>
                      <textarea
                        value={formData.userBio}
                        onChange={(e) => handleInputChange("userBio", e.target.value)}
                        rows={4}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] resize-none border border-gray-700"
                        placeholder="أخبرنا عن نفسك..."
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${userData?.userName}`)}
                        className="px-6 py-3 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors border border-gray-700"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating || (Object.keys(changedFields).length === 0 && !profilePhoto && !profileBanner)}
                        className="px-6 py-3 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            حفظ التغييرات
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Social Media Section */}
                {activeSection === "social" && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl text-white noto-sans-arabic-bold mb-2">وسائل التواصل الاجتماعي</h2>
                      <p className="text-gray-400 noto-sans-arabic-medium">اربط حساباتك على وسائل التواصل الاجتماعي</p>
                    </div>

                    {/* Facebook */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">Facebook</label>
                      <input
                        type="url"
                        value={formData.facebookUrl}
                        onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="https://facebook.com/username"
                        dir="ltr"
                      />
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">Twitter / X</label>
                      <input
                        type="url"
                        value={formData.twitterUrl}
                        onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="https://twitter.com/username"
                        dir="ltr"
                      />
                    </div>

                    {/* Discord */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">Discord</label>
                      <input
                        type="text"
                        value={formData.discordUrl}
                        onChange={(e) => handleInputChange("discordUrl", e.target.value)}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="username#1234"
                        dir="ltr"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => navigate(`/profile/${userData?.userName}`)}
                        className="px-6 py-3 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors border border-gray-700"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating || (Object.keys(changedFields).length === 0 && !profilePhoto && !profileBanner)}
                        className="px-6 py-3 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            حفظ التغييرات
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Password Section */}
                {activeSection === "password" && (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Section Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl text-white noto-sans-arabic-bold mb-2">تغيير كلمة المرور</h2>
                      <p className="text-gray-400 noto-sans-arabic-medium">قم بتحديث كلمة المرور الخاصة بك</p>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">كلمة المرور الحالية</label>
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                      <p className="text-sm text-gray-400 noto-sans-arabic-medium">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <label className="block text-white noto-sans-arabic-bold text-lg">تأكيد كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-[#2C2C2C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-gray-700"
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="px-6 py-3 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors border border-gray-700"
                      >
                        إعادة تعيين
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="px-6 py-3 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdatingPassword ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري التحديث...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            تغيير كلمة المرور
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
