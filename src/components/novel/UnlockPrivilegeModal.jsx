import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const UnlockPrivilegeModal = ({ isOpen, onClose, privilegeCost, lockedChaptersCount }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

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
              <h2 className="text-[#F5F5F5] text-xl sm:text-2xl font-bold leading-tight tracking-[-0.015em] noto-sans-arabic-extrabold">
                فقط {privilegeCost} نقطة
              </h2>
              <button className="w-full rounded-lg bg-[#4A9EFF] px-6 py-3 text-center text-base font-bold text-white shadow-lg shadow-[#4A9EFF]/20 transition-all hover:bg-[#3A8EEF] hover:scale-[1.02] active:scale-[0.98] noto-sans-arabic-extrabold">
                افتح الآن بنظام الامتيازات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockPrivilegeModal;
