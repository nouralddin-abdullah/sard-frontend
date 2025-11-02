import { X } from "lucide-react";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "تأكيد", 
  cancelText = "إلغاء",
  confirmButtonClass = "bg-red-500 hover:bg-red-600",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#2C2C2C] rounded-lg shadow-2xl w-full max-w-md mx-4 border border-[#5A5A5A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#5A5A5A]">
          <h3 className="text-white noto-sans-arabic-bold text-lg">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#B8B8B8] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-[#B8B8B8] noto-sans-arabic-medium text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#5A5A5A]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-[#3C3C3C] text-white noto-sans-arabic-medium text-sm hover:bg-[#4C4C4C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-lg text-white noto-sans-arabic-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحذف...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
