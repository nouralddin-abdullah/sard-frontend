import React, { useState, useEffect } from 'react';
import { Info, Save, Lock, GripVertical } from 'lucide-react';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';
import { useGetNovelChapters } from '../../hooks/novel/useGetNovelChapters';

const PrivilegeSystemSetup = ({ workId }) => {
  // Static data - will be replaced with API integration
  const [isEnabled, setIsEnabled] = useState(false);
  const [privilegeCost, setPrivilegeCost] = useState(100);
  const [privilegeStartIndex, setPrivilegeStartIndex] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track if privilege was previously enabled (will come from API)
  // Set to true if API returns existing privilege system
  const [wasEnabledBefore, setWasEnabledBefore] = useState(false);
  const [initialStartIndex, setInitialStartIndex] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalCost, setOriginalCost] = useState(100);
  const [originalStartIndex, setOriginalStartIndex] = useState(10);

  // Fetch privilege status on mount
  useEffect(() => {
    const fetchPrivilegeStatus = async () => {
      try {
        const token = Cookies.get(TOKEN_KEY);
        if (!token) {
          console.log('No token found');
          setIsLoading(false);
          return;
        }

        console.log('Fetching privilege status for workId:', workId);
        const response = await fetch(`${BASE_URL}/api/novel/${workId}/privilege`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });

        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Privilege data received:', data);
          if (data.isEnabled) {
            setIsEnabled(true);
            setWasEnabledBefore(true);
            setPrivilegeCost(data.subscriptionCost);
            setPrivilegeStartIndex(data.privilegeStartSequence - 1); // Convert to 0-based
            setInitialStartIndex(data.privilegeStartSequence - 1);
            setOriginalCost(data.subscriptionCost);
            setOriginalStartIndex(data.privilegeStartSequence - 1);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch privilege status:', response.status, errorText);
        }
      } catch (error) {
        console.error('Failed to fetch privilege status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivilegeStatus();
  }, [workId]);
  
  // Fetch real chapters from API
  const {
    data: chaptersData = [],
    isLoading: chaptersLoading,
    error: chaptersError
  } = useGetNovelChapters(workId);

  // Map chapters to the format needed for the privilege system
  const baseChapters = chaptersData.map((chapter, index) => ({
    id: chapter.id,
    title: chapter.title || `الفصل ${index + 1}`,
    sequence: chapter.sequence || index + 1
  }));

  // Calculate the correct starting index for first-time enable
  // Formula: totalChapters - 20 (but minimum 10 to keep first 10 free)
  // This ensures we only lock the LAST 20 chapters maximum
  useEffect(() => {
    if (!wasEnabledBefore && baseChapters.length > 0) {
      const totalChapters = baseChapters.length;
      // Start index should lock at most 20 chapters from the end
      // For 50 chapters: 50 - 20 = 30, so start at index 30 (chapter 31)
      // For 15 chapters: 15 - 20 = -5, so use minimum 10
      const suggestedStartIndex = Math.max(10, totalChapters - 20);
      setPrivilegeStartIndex(suggestedStartIndex);
      setInitialStartIndex(suggestedStartIndex);
      setOriginalStartIndex(suggestedStartIndex);
    }
  }, [baseChapters.length, wasEnabledBefore]);

  // Dynamically calculate chapter status based on privilegeStartIndex
  const chapters = baseChapters.map((chapter, index) => {
    let status;
    if (index < privilegeStartIndex) {
      status = 'unlocked';
    } else if (index >= privilegeStartIndex && index < privilegeStartIndex + 20) {
      status = 'privileged';
    } else {
      status = 'unlocked';
    }
    return { ...chapter, status };
  });

  // Minimum 10 chapters required to enable privilege system
  const hasMinimumChapters = baseChapters.length >= 10;
  const canEnablePrivilege = hasMinimumChapters;

  const privilegedChaptersCount = chapters.filter(ch => ch.status === 'privileged').length;

  // Check if there are unsaved changes
  const hasUnsavedChanges = wasEnabledBefore 
    ? (privilegeCost !== originalCost || privilegeStartIndex !== originalStartIndex)
    : true; // Always allow save for first-time enable

  const handleSave = async () => {
    if (!isEnabled) return;
    
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) {
        setErrorMessage('يجب تسجيل الدخول للمتابعة');
        setIsSaving(false);
        return;
      }

      // Determine if this is first-time enable or update
      const isUpdate = wasEnabledBefore;
      const endpoint = isUpdate 
        ? `${BASE_URL}/api/novel/${workId}/privilege`
        : `${BASE_URL}/api/novel/${workId}/privilege/enable`;
      const method = isUpdate ? 'PATCH' : 'POST';

      // Build request body - only include changed values for PATCH
      let requestBody;
      if (isUpdate) {
        requestBody = {};
        // Only include cost if it changed
        if (privilegeCost !== originalCost) {
          requestBody.newSubscriptionCost = privilegeCost;
        }
        // Only include start index if it changed
        if (privilegeStartIndex !== originalStartIndex) {
          requestBody.newPrivilegeStartSequence = privilegeStartIndex + 1; // API uses 1-based
        }
        
        // If nothing changed, don't make the request
        if (Object.keys(requestBody).length === 0) {
          setSuccessMessage('لا توجد تغييرات للحفظ');
          setIsSaving(false);
          return;
        }
      } else {
        // First-time enable - send all values
        requestBody = {
          subscriptionCost: privilegeCost,
          privilegeStartSequence: privilegeStartIndex + 1 // API uses 1-based index
        };
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        if (isUpdate) {
          setSuccessMessage('تم تحديث الإعدادات بنجاح!');
          // Update original values to reflect saved state
          setOriginalCost(privilegeCost);
          setOriginalStartIndex(privilegeStartIndex);
        } else {
          setSuccessMessage(data.message || 'تم تفعيل نظام الامتيازات بنجاح!');
          // Lock the system after successful enable
          setWasEnabledBefore(true);
          setInitialStartIndex(privilegeStartIndex);
          setOriginalCost(privilegeCost);
          setOriginalStartIndex(privilegeStartIndex);
        }
      } else {
        setErrorMessage(data.message || 'فشل في حفظ الإعدادات. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error saving privilege settings:', error);
      setErrorMessage('حدث خطأ أثناء الحفظ. تحقق من اتصالك بالإنترنت.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    if (!isEnabled) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e, index) => {
    if (isDragging && isEnabled) {
      // Minimum 10 unlocked chapters from the start
      if (index < 10) return;
      
      // Cannot move backward if privilege was already enabled
      if (wasEnabledBefore && index < initialStartIndex) return;
      
      setPrivilegeStartIndex(index);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  if (isLoading || chaptersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#B0B0B0] text-lg noto-sans-arabic-medium">جاري التحميل...</div>
      </div>
    );
  }

  if (chaptersError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500 text-lg noto-sans-arabic-medium">فشل في تحميل الفصول</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column - Configuration */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        <h2 className="text-xl font-bold text-white noto-sans-arabic-extrabold">الإعدادات</h2>
        
        <div className="flex flex-col gap-6 rounded-[1.5rem] border border-[#3C3C3C] bg-[#2C2C2C] p-6">
          {/* Enable/Disable Toggle */}
          <div className="flex flex-1 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <p className="text-white text-base font-bold noto-sans-arabic-extrabold">تفعيل نظام الامتيازات</p>
              <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">
                السماح للقراء بالوصول المبكر للفصول مقابل نقاط
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                // Only allow enabling, not disabling once enabled
                if (!wasEnabledBefore) {
                  setIsEnabled(!isEnabled);
                }
              }}
              disabled={wasEnabledBefore}
              className={`relative inline-flex h-[31px] w-[51px] flex-shrink-0 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-[#4A9EFF]' : 'bg-[#3C3C3C]'
              } ${wasEnabledBefore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-lg transition-transform ${
                  isEnabled ? '-translate-x-[22px]' : 'translate-x-0'
                }`}
                style={{ marginRight: isEnabled ? '0px' : '2px', marginLeft: 'auto' }}
              />
            </button>
          </div>

          {wasEnabledBefore && (
            <div className="rounded-lg bg-[#4A9EFF]/10 border border-[#4A9EFF]/30 p-4">
              <p className="text-[#4A9EFF] text-sm font-bold noto-sans-arabic-extrabold mb-2">
                ملاحظة هامة للكُتّاب
              </p>
              <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium leading-relaxed">
                تجنب جعل الربح هدفك الأول. لا تقم بتقسيم الفصول إلى فصول قصيرة فقط للاستفادة من نظام الامتيازات. 
                ركز على جودة المحتوى وتجربة القارئ لبناء قاعدة جماهيرية مخلصة.
              </p>
            </div>
          )}

          <hr className="border-[#3C3C3C]" />

          {/* Cost Input */}
          <div className="flex flex-col">
            <label className="flex flex-col w-full">
              <p className="text-white text-base font-medium noto-sans-arabic-extrabold pb-2">
                تكلفة الامتياز
              </p>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="1"
                  value={privilegeCost}
                  onChange={(e) => setPrivilegeCost(Number(e.target.value))}
                  className="w-full rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 border border-[#3C3C3C] bg-[#1A1A1A] h-12 pl-10 pr-4 text-base font-normal noto-sans-arabic-medium"
                  placeholder="100"
                  disabled={!isEnabled}
                />
                <svg className="absolute left-3 w-5 h-5 text-[#4A9EFF] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#B0B0B0] text-xs noto-sans-arabic-medium pt-2">
                أدخل عدد النقاط المطلوبة لفتح جميع الفصول المميزة
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Right Column - Live Preview */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        {!isEnabled ? (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white noto-sans-arabic-extrabold">قواعد نظام الامتيازات</h2>
            
            <div className="flex flex-col gap-6 rounded-[1.5rem] border border-[#3C3C3C] bg-[#2C2C2C] p-6">
              <div className="flex flex-col gap-4 rounded-lg bg-[#4A9EFF]/10 p-6">
                <div className="flex items-center gap-3">
                  <Info className="text-[#4A9EFF] w-6 h-6" />
                  <p className="text-lg font-bold text-[#4A9EFF] noto-sans-arabic-extrabold">
                    اقرأ القواعد بعناية قبل التفعيل
                  </p>
                </div>
                <ul className="list-disc pr-5 space-y-3 text-white text-base noto-sans-arabic-medium">
                  <li>مطلوب 10 فصول على الأقل لتفعيل النظام</li>
                  <li>يمكنك تحديد 20 فصلاً مميزاً كحد أقصى</li>
                  <li>يفتح القراء فصلاً مميزاً واحداً يومياً</li>
                  <li>لا يمكن إرجاع نقطة البداية للخلف بعد التفعيل</li>
                  <li>يجب عليك تحديد تكلفة الوصول للفصول المميزة</li>
                  <li>المشتركون يحصلون على وصول فوري لجميع الفصول المميزة المستقبلية</li>
                  <li className="text-yellow-400 font-bold">بمجرد التفعيل، لا يمكن إلغاء نظام الامتيازات</li>
                </ul>
              </div>

              <div className="rounded-lg bg-[#1A1A1A] p-6 border border-[#3C3C3C]">
                <p className="text-sm text-[#B0B0B0] noto-sans-arabic-medium leading-relaxed">
                  بمجرد تفعيل نظام الامتيازات، ستتمكن من تحديد الفصول التي سيدفع القراء مقابل الوصول إليها مبكراً. 
                  قم بتفعيل النظام من الإعدادات على اليسار للبدء.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white noto-sans-arabic-extrabold">معاينة مباشرة</h2>
              <button
                onClick={handleSave}
                disabled={!isEnabled || isSaving || !hasUnsavedChanges}
                className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-[#4A9EFF] text-white text-base font-bold noto-sans-arabic-extrabold disabled:bg-[#3C3C3C] disabled:text-[#666666] disabled:cursor-not-allowed transition-colors hover:bg-[#3A8EEF]"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/50 p-4">
                <p className="text-green-400 text-sm noto-sans-arabic-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4">
                <p className="text-red-400 text-sm noto-sans-arabic-medium">{errorMessage}</p>
              </div>
            )}

        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[#3C3C3C] bg-[#2C2C2C] p-4">
          {/* Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-[#1A1A1A] p-3">
            <p className="text-sm text-[#B0B0B0] font-medium noto-sans-arabic-medium">
              اسحب الخط أو اختر فصلاً لتحديد مستوى الامتياز الخاص بك
            </p>
            <div className="flex items-center gap-4 text-sm font-semibold text-white noto-sans-arabic-extrabold">
              <span>الفصول المميزة:</span>
              <span className="text-lg font-bold text-[#4A9EFF]">
                {privilegedChaptersCount} / 20
              </span>
            </div>
          </div>

          {/* Chapters List */}
          <div 
            className="relative h-96 overflow-y-auto pr-1 custom-scrollbar overflow-x-visible"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ul className="space-y-1 text-sm text-white overflow-visible">
              {chapters.map((chapter, index) => {
                const isPrivilegeStart = index === privilegeStartIndex;
                const isPrivileged = chapter.status === 'privileged';
                const isBuffer = chapter.status === 'buffer';

                return (
                  <React.Fragment key={chapter.id}>
                    {isPrivilegeStart && (
                      <li className="my-2 relative z-10 -mr-1">
                        <div 
                          onMouseDown={handleMouseDown}
                          className={`group relative flex h-auto items-center select-none ${
                            isEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
                          }`}
                        >
                          <div className="h-px w-full flex-1 bg-[#4A9EFF]"></div>
                          <div className="absolute right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#4A9EFF] text-white shadow-lg transition-transform group-hover:scale-110 z-10">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="mr-4 text-xs font-bold uppercase tracking-wider text-[#4A9EFF] noto-sans-arabic-extrabold">
                            بداية الامتياز
                          </span>
                        </div>
                      </li>
                    )}

                    <li
                      onMouseMove={(e) => handleMouseMove(e, index)}
                      onClick={() => {
                        if (isEnabled) {
                          // Minimum 10 unlocked chapters from the start
                          if (index < 10) return;
                          
                          // Cannot move backward if privilege was already enabled
                          if (wasEnabledBefore && index < initialStartIndex) return;
                          
                          setPrivilegeStartIndex(index);
                        }
                      }}
                      className={`rounded-md transition-colors ${
                        isPrivileged
                          ? 'bg-[#4A9EFF]/10 hover:bg-[#4A9EFF]/20'
                          : (index < 10 || (wasEnabledBefore && index < initialStartIndex))
                          ? 'opacity-50 cursor-not-allowed'
                          : isDragging ? 'cursor-grabbing' : 'cursor-pointer hover:bg-[#2C2C2C]'
                      }`}
                    >
                      <div className="flex items-center justify-between p-2 rounded-md">
                        <span className={`noto-sans-arabic-medium text-white`}>
                          {chapter.title}
                        </span>
                        {isPrivileged ? (
                          <Lock className="text-[#4A9EFF] w-4 h-4" />
                        ) : (
                          <span className="text-xs text-[#B0B0B0] noto-sans-arabic-medium">
                            مفتوح
                          </span>
                        )}
                      </div>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        </div>
          </>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1A1A1A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3C3C3C;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4A4A4A;
        }
      `}</style>
    </div>
  );
};

export default PrivilegeSystemSetup;
