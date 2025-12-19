import React, { useState, useEffect } from 'react';
import { X, BookOpen, Check, Loader2, AlertCircle, Trophy } from 'lucide-react';
import { useGetEligibleNovels } from '../../hooks/competition/useGetEligibleNovels';
import { useJoinCompetition } from '../../hooks/competition/useJoinCompetition';

const JoinCompetitionModal = ({ isOpen, onClose, competitionId, competitionName }) => {
  const [selectedNovelId, setSelectedNovelId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { 
    data: novels, 
    isLoading, 
    isError, 
    error 
  } = useGetEligibleNovels(competitionId, {
    enabled: isOpen && !!competitionId,
  });

  const joinMutation = useJoinCompetition();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNovelId(null);
      setSuccessMessage(null);
      joinMutation.reset();
    }
  }, [isOpen]);

  const handleJoin = async () => {
    if (!selectedNovelId) return;

    try {
      await joinMutation.mutateAsync({
        competitionId,
        novelId: selectedNovelId,
      });
      setSuccessMessage('تم الانضمام للمسابقة بنجاح!');
    } catch (err) {
      // Error is handled by mutation
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Get eligible novels (not already participating)
  const eligibleNovels = novels?.filter(n => !n.isAlreadyParticipating) || [];
  const participatingNovels = novels?.filter(n => n.isAlreadyParticipating) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white noto-sans-arabic-bold">
                الانضمام للمسابقة
              </h2>
              <p className="text-sm text-gray-500 noto-sans-arabic-medium">
                {competitionName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Success State */}
          {successMessage && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 noto-sans-arabic-bold">
                {successMessage}
              </h3>
              <p className="text-gray-500 noto-sans-arabic-medium">
                نتمنى لك حظاً موفقاً في المسابقة
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-3 bg-white text-black rounded-full font-bold noto-sans-arabic-bold hover:bg-white/90 transition-colors"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !successMessage && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-white/50 mb-4" />
              <p className="text-gray-500 noto-sans-arabic-medium">
                جاري تحميل رواياتك المؤهلة...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && !successMessage && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">
                حدث خطأ
              </h3>
              <p className="text-gray-500 noto-sans-arabic-medium">
                {error?.message || 'فشل في تحميل الروايات المؤهلة'}
              </p>
            </div>
          )}

          {/* No Novels State */}
          {!isLoading && !isError && !successMessage && eligibleNovels.length === 0 && participatingNovels.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">
                لا توجد روايات مؤهلة
              </h3>
              <p className="text-gray-500 noto-sans-arabic-medium max-w-sm">
                لا تملك روايات تستوفي شروط المشاركة في هذه المسابقة. تأكد من أن روايتك تحقق المتطلبات المطلوبة.
              </p>
            </div>
          )}

          {/* All Novels Already Participating */}
          {!isLoading && !isError && !successMessage && eligibleNovels.length === 0 && participatingNovels.length > 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">
                أنت مشارك بالفعل
              </h3>
              <p className="text-gray-500 noto-sans-arabic-medium max-w-sm">
                جميع رواياتك المؤهلة مشاركة بالفعل في هذه المسابقة.
              </p>
            </div>
          )}

          {/* Novels List */}
          {!isLoading && !isError && !successMessage && eligibleNovels.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 noto-sans-arabic-medium mb-4">
                اختر الرواية التي تريد المشاركة بها:
              </p>

              {/* Eligible Novels */}
              <div className="space-y-3">
                {eligibleNovels.map((novel) => (
                  <button
                    key={novel.id}
                    onClick={() => setSelectedNovelId(novel.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      selectedNovelId === novel.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {/* Cover Image */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {novel.coverImageUrl ? (
                        <img
                          src={novel.coverImageUrl}
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Novel Info */}
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-white noto-sans-arabic-bold line-clamp-1">
                        {novel.title}
                      </h4>
                      <p className="text-sm text-gray-500 noto-sans-arabic-medium mt-1">
                        {novel.chapterCount} فصل
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedNovelId === novel.id
                        ? 'bg-white border-white'
                        : 'border-gray-600'
                    }`}>
                      {selectedNovelId === novel.id && (
                        <Check className="w-4 h-4 text-black" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Already Participating Novels */}
              {participatingNovels.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-gray-600 noto-sans-arabic-medium mb-3">
                    روايات مشاركة بالفعل:
                  </p>
                  <div className="space-y-2">
                    {participatingNovels.map((novel) => (
                      <div
                        key={novel.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 opacity-50"
                      >
                        <div className="w-10 h-14 rounded overflow-hidden bg-white/5 flex-shrink-0">
                          {novel.coverImageUrl ? (
                            <img
                              src={novel.coverImageUrl}
                              alt={novel.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-400 noto-sans-arabic-medium line-clamp-1">
                            {novel.title}
                          </h4>
                        </div>
                        <span className="text-xs text-green-500 noto-sans-arabic-medium">
                          مشارك
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !isError && !successMessage && eligibleNovels.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-black/50">
            {/* Mutation Error */}
            {joinMutation.isError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 noto-sans-arabic-medium">
                  {joinMutation.error?.message || 'فشل في الانضمام للمسابقة'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-white/5 text-white rounded-full font-bold noto-sans-arabic-bold hover:bg-white/10 transition-colors border border-white/10"
              >
                إلغاء
              </button>
              <button
                onClick={handleJoin}
                disabled={!selectedNovelId || joinMutation.isPending}
                className={`flex-1 px-6 py-3 rounded-full font-bold noto-sans-arabic-bold transition-all flex items-center justify-center gap-2 ${
                  selectedNovelId && !joinMutation.isPending
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                {joinMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الانضمام...
                  </>
                ) : (
                  'انضم للمسابقة'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCompetitionModal;
