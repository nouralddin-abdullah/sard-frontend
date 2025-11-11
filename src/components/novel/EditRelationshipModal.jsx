import { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

const RELATIONSHIP_TYPES = [
  'حليف',
  'عدو',
  'صديق',
  'أب',
  'أم',
  'شقيق',
  'زوج',
  'معلم'
];

const EditRelationshipModal = ({ isOpen, onClose, onSave, relationship, currentEntity, isLoading }) => {
  const [relationshipFromCurrent, setRelationshipFromCurrent] = useState('');
  const [relationshipToTarget, setRelationshipToTarget] = useState('');
  const [activeField, setActiveField] = useState('from'); // Track which field is active: 'from' or 'to'

  // Initialize form with existing relationship data
  useEffect(() => {
    if (relationship) {
      setRelationshipFromCurrent(relationship.label || '');
      setRelationshipToTarget(relationship.reverseLabel || '');
    }
  }, [relationship]);

  const handleSave = () => {
    if (!relationshipFromCurrent || !relationshipToTarget) {
      return;
    }

    onSave({
      relationshipId: relationship.id,
      label: relationshipFromCurrent,
      reverseLabel: relationshipToTarget,
      relationType: 'custom' // Keep the same type
    });
  };

  const handleQuickSelect = (type) => {
    if (activeField === 'from') {
      setRelationshipFromCurrent(type);
    } else {
      setRelationshipToTarget(type);
    }
  };

  const handleClose = () => {
    // Reset form
    setRelationshipFromCurrent('');
    setRelationshipToTarget('');
    setActiveField('from');
    onClose();
  };

  if (!isOpen || !relationship) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-[#2C2C2C] rounded-lg w-full max-w-2xl border border-[#5A5A5A]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#5A5A5A]">
          <div>
            <h2 className="text-xl font-bold text-white noto-sans-arabic-bold">
              تعديل العلاقة
            </h2>
            <p className="text-sm text-[#797979] mt-1 noto-sans-arabic-regular">
              تحديث العلاقة بين {currentEntity?.name || 'الشخصية'} و {relationship.targetEntityName}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#797979] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Relationship Definition */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-white noto-sans-arabic-medium">
              تعديل العلاقة
            </p>
            <div className="flex items-center justify-center gap-4 text-center">
              {/* Current Entity */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentEntity?.imageUrl})` }}
                />
                <p className="text-sm font-semibold text-white noto-sans-arabic-bold">
                  {currentEntity?.name}
                </p>
                {relationshipFromCurrent && (
                  <p className="text-xs text-[#0077FF] noto-sans-arabic-regular bg-[#0077FF]/10 px-2 py-1 rounded-full">
                    {relationshipFromCurrent}
                  </p>
                )}
              </div>

              {/* Relationship Inputs */}
              <div className="flex flex-col items-center flex-1 max-w-xs gap-2">
                <input
                  type="text"
                  value={relationshipFromCurrent}
                  onChange={(e) => setRelationshipFromCurrent(e.target.value)}
                  onFocus={() => setActiveField('from')}
                  placeholder="أب، صديق، حليف..."
                  disabled={isLoading}
                  className={`w-full text-center bg-[#3C3C3C] border rounded-lg px-3 py-2 text-white placeholder-[#797979] focus:outline-none focus:ring-2 focus:ring-[#0077FF] noto-sans-arabic-regular disabled:opacity-50 ${
                    activeField === 'from' ? 'border-[#0077FF]' : 'border-[#5A5A5A]'
                  }`}
                />
                <ArrowRightLeft className="text-[#0077FF]" size={24} />
                <input
                  type="text"
                  value={relationshipToTarget}
                  onChange={(e) => setRelationshipToTarget(e.target.value)}
                  onFocus={() => setActiveField('to')}
                  placeholder="ابن، صديق، حليف..."
                  disabled={isLoading}
                  className={`w-full text-center bg-[#3C3C3C] border rounded-lg px-3 py-2 text-white placeholder-[#797979] focus:outline-none focus:ring-2 focus:ring-[#0077FF] noto-sans-arabic-regular disabled:opacity-50 ${
                    activeField === 'to' ? 'border-[#0077FF]' : 'border-[#5A5A5A]'
                  }`}
                />
              </div>

              {/* Target Entity */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${relationship.targetEntityImage})` }}
                />
                <p className="text-sm font-semibold text-white noto-sans-arabic-bold">
                  {relationship.targetEntityName}
                </p>
                {relationshipToTarget && (
                  <p className="text-xs text-[#0077FF] noto-sans-arabic-regular bg-[#0077FF]/10 px-2 py-1 rounded-full">
                    {relationshipToTarget}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Select Relationship Types */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white noto-sans-arabic-medium">
              أنواع العلاقات الشائعة {activeField === 'from' ? '(للحقل الأول)' : '(للحقل الثاني)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_TYPES.map(type => {
                const isActive = activeField === 'from' 
                  ? relationshipFromCurrent === type 
                  : relationshipToTarget === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => handleQuickSelect(type)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded-full transition-colors noto-sans-arabic-regular disabled:opacity-50 ${
                      isActive
                        ? 'bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]'
                        : 'bg-[#3C3C3C] text-[#B8B8B8] hover:bg-[#4A4A4A]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-[#242424] border-t border-[#5A5A5A] rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-[#3C3C3C] hover:bg-[#4A4A4A] rounded-lg transition-colors text-white noto-sans-arabic-medium disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={!relationshipFromCurrent || !relationshipToTarget || isLoading}
            className="px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed rounded-lg transition-colors text-white noto-sans-arabic-bold flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <span>حفظ التغييرات</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRelationshipModal;
