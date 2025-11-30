import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const UnlockPrivilegeModal = ({ isOpen, onClose, privilegeCost, lockedChaptersCount, novelId, onSubscribeSuccess }) => {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Calculate time until next UTC midnight (00:00:00)
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const utcNow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      );
      
      // Next UTC midnight
      const nextMidnight = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      );
      
      const diff = nextMidnight - utcNow;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    // Set initial time
    setTimeLeft(calculateTimeUntilMidnight());

    const timer = setInterval(() => {
      const newTime = calculateTimeUntilMidnight();
      setTimeLeft(newTime);
      
      // If we've hit midnight, you might want to trigger a refresh or callback here
      if (newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        // Optional: trigger a refresh or callback
        // onMidnightReached?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!novelId) return;

    setIsSubscribing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) {
        setErrorMessage('يجب تسجيل الدخول أولاً');
        setIsSubscribing(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/novel/${novelId}/privilege/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('تم الاشتراك بنجاح! يمكنك الآن قراءة جميع الفصول المقفلة.');
        // Refresh chapters list to show unlocked chapters
        queryClient.invalidateQueries({ queryKey: ["novel", novelId, "chapters"] });
        // Refresh privilege info to update subscription status
        queryClient.invalidateQueries({ queryKey: ["novel-privilege", novelId] });
        setTimeout(() => {
          onSubscribeSuccess?.();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'فشل الاشتراك. يرجى التحقق من رصيدك والمحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setErrorMessage('حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex flex-col overflow-hidden rounded-[1.5rem] bg-[#252528] shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-[#B0B0B0] hover:text-white transition-colors z-10"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col p-6 sm:p-8 text-center">
            <h1 className="text-[#F5F5F5] text-2xl sm:text-3xl font-bold leading-tight noto-sans-arabic-extrabold">
              لا تنتظر! اقرأ الآن
            </h1>
            <p className="text-[#B0B0B0] text-sm font-normal leading-normal pt-3 pb-2 noto-sans-arabic-medium">
              الفصل المجاني التالي خلال:
            </p>

            <div className="flex gap-3 self-center max-w-xs w-full">
              <div className="flex grow basis-0 flex-col items-stretch gap-2">
                <div className="flex h-14 grow items-center justify-center rounded-lg bg-[#1A1A1D]">
                  <p className="text-[#4A9EFF] text-xl font-bold leading-tight tracking-[-0.015em]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-[#B0B0B0] text-xs font-normal leading-normal noto-sans-arabic-medium">ساعات</p>
                </div>
              </div>
              <div className="flex grow basis-0 flex-col items-stretch gap-2">
                <div className="flex h-16 grow items-center justify-center rounded-lg bg-[#1A1A1D]">
                  <p className="text-[#4A9EFF] text-2xl font-bold leading-tight tracking-[-0.015em]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-[#B0B0B0] text-xs font-normal leading-normal noto-sans-arabic-medium">دقائق</p>
                </div>
              </div>
              <div className="flex grow basis-0 flex-col items-stretch gap-2">
                <div className="flex h-16 grow items-center justify-center rounded-lg bg-[#1A1A1D]">
                  <p className="text-[#4A9EFF] text-2xl font-bold leading-tight tracking-[-0.015em]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-[#B0B0B0] text-xs font-normal leading-normal noto-sans-arabic-medium">ثواني</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-6 sm:p-8 pt-0">
            <div className="grid grid-cols-[auto_1fr] gap-x-4">
              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3C3C3C] py-3">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4A9EFF]">auto_stories</span>
                </div>
                <div className="text-right">
                  <p className="text-[#F5F5F5] text-sm font-medium leading-normal noto-sans-arabic-extrabold">
                    اقرأ فوراً
                  </p>
                  <p className="text-[#B0B0B0] text-sm font-normal leading-normal noto-sans-arabic-medium">
                    افتح {lockedChaptersCount} فصل إضافي على الفور
                  </p>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3C3C3C] py-4">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4A9EFF]">favorite</span>
                </div>
                <div className="text-right">
                  <p className="text-[#F5F5F5] text-sm font-medium leading-normal noto-sans-arabic-extrabold">
                    ادعم الكاتب
                  </p>
                  <p className="text-[#B0B0B0] text-sm font-normal leading-normal noto-sans-arabic-medium">
                    مساهمتك تساعد الكاتب مباشرة على إنشاء المزيد من المحتوى
                  </p>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#3C3C3C] py-4">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4A9EFF]">ad_off</span>
                </div>
                <div className="text-right">
                  <p className="text-[#F5F5F5] text-sm font-medium leading-normal noto-sans-arabic-extrabold">
                    قراءة بدون إعلانات
                  </p>
                  <p className="text-[#B0B0B0] text-sm font-normal leading-normal noto-sans-arabic-medium">
                    استمتع بتجربة قراءة دون انقطاع
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              {errorMessage && (
                <div className="w-full rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-center">
                  <p className="text-red-400 text-sm noto-sans-arabic-medium">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="w-full rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-center">
                  <p className="text-green-400 text-sm noto-sans-arabic-medium">{successMessage}</p>
                </div>
              )}
              <h2 className="text-[#F5F5F5] text-xl sm:text-2xl font-bold leading-tight tracking-[-0.015em] noto-sans-arabic-extrabold">
                فقط {privilegeCost} نقطة
              </h2>
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing || !!successMessage}
                className="w-full rounded-lg bg-[#4A9EFF] px-6 py-3 text-center text-base font-bold text-white shadow-lg shadow-[#4A9EFF]/20 transition-all hover:bg-[#3A8EEF] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 noto-sans-arabic-extrabold"
              >
                {isSubscribing ? 'جاري الاشتراك...' : 'افتح الآن بنظام الامتيازات'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockPrivilegeModal;
