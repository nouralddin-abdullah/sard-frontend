import { useState } from 'react';
import { X } from 'lucide-react';

const AddAttributeModal = ({ isOpen, onClose, onAdd }) => {
  const [attributeName, setAttributeName] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [isList, setIsList] = useState(false);

  const handleSubmit = () => {
    if (attributeName.trim()) {
      if (isList) {
        // Parse multi-line input into array
        const items = attributeValue
          .split('\n')
          .map(line => line.trim())
          .map(line => line.replace(/^[\*\-•]\s*/, '')) // Remove bullet points (*, -, •)
          .filter(line => line.length > 0); // Remove empty lines
        
        onAdd({ name: attributeName, isList: true, items });
      } else {
        // For simple type, require a value
        if (attributeValue.trim()) {
          onAdd({ name: attributeName, value: attributeValue, isList: false });
        } else {
          return; // Don't submit if simple value is empty
        }
      }
      setAttributeName('');
      setAttributeValue('');
      setIsList(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#2C2C2C] rounded-lg p-6 w-full max-w-md border border-[#5A5A5A]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
            إضافة سمة مخصصة
          </h3>
          <button
            onClick={onClose}
            className="text-[#797979] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
              اسم السمة
            </label>
            <input
              type="text"
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              placeholder="مثال: العمر، القدرات، الأغراض..."
              className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-2 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
            />
          </div>

          {/* Attribute Type Selection */}
          <div>
            <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
              نوع السمة
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsList(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors noto-sans-arabic-medium ${
                  !isList
                    ? 'bg-[#0077FF] text-white'
                    : 'bg-[#3C3C3C] text-[#B8B8B8] hover:bg-[#4A4A4A]'
                }`}
              >
                قيمة واحدة
              </button>
              <button
                onClick={() => setIsList(true)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors noto-sans-arabic-medium ${
                  isList
                    ? 'bg-[#0077FF] text-white'
                    : 'bg-[#3C3C3C] text-[#B8B8B8] hover:bg-[#4A4A4A]'
                }`}
              >
                قائمة
              </button>
            </div>
            <p className="text-xs mt-1 noto-sans-arabic-regular" style={{ color: '#797979' }}>
              {isList 
                ? 'قائمة: مثل القدرات أو الأغراض (عدة عناصر)'
                : 'قيمة واحدة: مثل العمر أو المهنة (نص واحد)'
              }
            </p>
          </div>

          {/* Value Input - Only show for simple type */}
          {!isList && (
            <div>
              <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                القيمة
              </label>
              <input
                type="text"
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                placeholder="أدخل القيمة..."
                className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-2 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>
          )}

          {/* List Input - Show textarea for multiple items */}
          {isList && (
            <div>
              <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                العناصر
              </label>
              <textarea
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                placeholder="أدخل كل عنصر في سطر منفصل، أو استخدم * في البداية:&#10;* سيف النور&#10;* سيف الظلام&#10;* درع الحماية"
                rows={6}
                className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-2 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF] resize-none"
              />
              <p className="text-xs mt-1 noto-sans-arabic-regular" style={{ color: '#797979' }}>
                يمكنك استخدام سطر جديد أو علامة * لفصل العناصر
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3C3C3C] hover:bg-[#5A5A5A] rounded-lg transition-colors noto-sans-arabic-medium"
            style={{ color: '#B8B8B8' }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-lg transition-colors noto-sans-arabic-bold text-white"
            style={{ backgroundColor: '#0077FF' }}
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAttributeModal;
