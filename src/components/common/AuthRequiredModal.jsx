import React from 'react';
import { X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/button';

const AuthRequiredModal = ({ isOpen, onClose, action = "لتنفيذ هذا الإجراء" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" dir="rtl">
      <div className="relative bg-[#2C2C2C] rounded-2xl max-w-[500px] w-full mx-4 p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-white hover:text-[#AAAAAA] transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#4A9EFF]/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-[#4A9EFF]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white noto-sans-arabic-extrabold text-[28px] text-center mb-4">
          يجب تسجيل الدخول
        </h2>

        {/* Description */}
        <p className="text-[#AAAAAA] noto-sans-arabic-medium text-[18px] text-center leading-relaxed mb-8">
          {action}، يجب عليك تسجيل الدخول أو إنشاء حساب جديد للمتابعة
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white noto-sans-arabic-extrabold text-[18px] py-4 rounded-2xl transition-colors"
          >
            تسجيل الدخول
          </Button>
          <Button
            onClick={handleSignup}
            className="w-full bg-transparent border-2 border-[#4A9EFF] text-[#4A9EFF] hover:bg-[#4A9EFF] hover:text-white noto-sans-arabic-extrabold text-[18px] py-4 rounded-2xl transition-colors"
          >
            إنشاء حساب جديد
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-[#797979] noto-sans-arabic-medium text-[14px] text-center mt-6">
          انضم إلى مجتمعنا وشارك آرائك مع الآخرين
        </p>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
