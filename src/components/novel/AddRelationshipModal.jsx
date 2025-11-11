import { useState, useEffect } from 'react';
import { X, Search, ArrowRightLeft } from 'lucide-react';
import { useSearchEntities } from '../../hooks/entity/useSearchEntities';

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

const AddRelationshipModal = ({ isOpen, onClose, onSave, currentEntity, novelId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [relationshipFromCurrent, setRelationshipFromCurrent] = useState('');
  const [relationshipToSelected, setRelationshipToSelected] = useState('');
  const [activeField, setActiveField] = useState('from'); // Track which field is active: 'from' or 'to'
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch entities from API
  const { data: searchResults } = useSearchEntities(
    novelId,
    debouncedSearchQuery,
    null, // section
    1, // pageNumber
    20, // pageSize
    !!debouncedSearchQuery && isOpen // only enabled when there's a search query and modal is open
  );

  // Filter out the current entity from search results
  const filteredEntities = (searchResults?.items || []).filter(
    entity => entity.id !== currentEntity?.id
  );

  const handleSave = () => {
    if (!selectedEntity || !relationshipFromCurrent || !relationshipToSelected) {
      return;
    }

    onSave({
      targetEntityId: selectedEntity.id,
      targetEntityName: selectedEntity.name,
      targetEntityImage: selectedEntity.imageUrl,
      relationshipType: relationshipFromCurrent,
      reverseRelationshipType: relationshipToSelected
    });

    // Reset form
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedEntity(null);
    setRelationshipFromCurrent('');
    setRelationshipToSelected('');
    setActiveField('from');
    onClose();
  };

  const handleQuickSelect = (type) => {
    if (activeField === 'from') {
      setRelationshipFromCurrent(type);
    } else {
      setRelationshipToSelected(type);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
              إضافة علاقة جديدة
            </h2>
            <p className="text-sm text-[#797979] mt-1 noto-sans-arabic-regular">
              حدد العلاقة بين {currentEntity?.name || 'الشخصية'} وكيان آخر
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#797979] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Search Entity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white noto-sans-arabic-medium">
              1. اختر الكيان المرتبط
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#797979]" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كيان بالاسم..."
                className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg pr-10 pl-4 py-2 text-white placeholder-[#797979] focus:outline-none focus:ring-2 focus:ring-[#0077FF] noto-sans-arabic-regular"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-2 bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg max-h-48 overflow-y-auto">
                {filteredEntities.length > 0 ? (
                  filteredEntities.map(entity => (
                    <button
                      key={entity.id}
                      onClick={() => {
                        setSelectedEntity(entity);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-[#4A4A4A] transition-colors text-right"
                    >
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${entity.imageUrl})` }}
                      />
                      <span className="text-white noto-sans-arabic-medium">{entity.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#797979] noto-sans-arabic-regular">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Define Relationship */}
          {selectedEntity && (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium text-white noto-sans-arabic-medium">
                  2. حدد العلاقة
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
                      className={`w-full text-center bg-[#3C3C3C] border rounded-lg px-3 py-2 text-white placeholder-[#797979] focus:outline-none focus:ring-2 focus:ring-[#0077FF] noto-sans-arabic-regular ${
                        activeField === 'from' ? 'border-[#0077FF]' : 'border-[#5A5A5A]'
                      }`}
                    />
                    <ArrowRightLeft className="text-[#0077FF]" size={24} />
                    <input
                      type="text"
                      value={relationshipToSelected}
                      onChange={(e) => setRelationshipToSelected(e.target.value)}
                      onFocus={() => setActiveField('to')}
                      placeholder="ابن، صديق، حليف..."
                      className={`w-full text-center bg-[#3C3C3C] border rounded-lg px-3 py-2 text-white placeholder-[#797979] focus:outline-none focus:ring-2 focus:ring-[#0077FF] noto-sans-arabic-regular ${
                        activeField === 'to' ? 'border-[#0077FF]' : 'border-[#5A5A5A]'
                      }`}
                    />
                  </div>

                  {/* Selected Entity */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedEntity.imageUrl})` }}
                    />
                    <p className="text-sm font-semibold text-white noto-sans-arabic-bold">
                      {selectedEntity.name}
                    </p>
                    {relationshipToSelected && (
                      <p className="text-xs text-[#0077FF] noto-sans-arabic-regular bg-[#0077FF]/10 px-2 py-1 rounded-full">
                        {relationshipToSelected}
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
                      : relationshipToSelected === type;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => handleQuickSelect(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors noto-sans-arabic-regular ${
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-[#242424] border-t border-[#5A5A5A] rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3C3C3C] hover:bg-[#4A4A4A] rounded-lg transition-colors text-white noto-sans-arabic-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedEntity || !relationshipFromCurrent}
            className="px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed rounded-lg transition-colors text-white noto-sans-arabic-bold flex items-center gap-2"
          >
            <span>حفظ العلاقة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRelationshipModal;
