import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const ShareModal = ({ 
  isOpen, 
  onClose, 
  title,
  description,
  imageUrl,
  shareUrl,
  itemType = "novel" // "novel" or "post"
}) => {
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط بنجاح");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ الرابط");
    }
  };

  const handleFacebookShare = () => {
    // Check if it's localhost
    if (shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1')) {
      handleCopyLink();
      toast.info("لا يمكن مشاركة روابط localhost على Facebook. تم نسخ الرابط!");
      return;
    }
    
    // Use Facebook's standard sharer endpoint (most compatible)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=600");
  };

  const handleTwitterShare = () => {
    const text = customMessage || `${title} - ${description}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleWhatsAppShare = () => {
    const text = customMessage || `${title} - ${description}`;
    const message = `${text}\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 z-[9999]">
      <div className="relative w-full max-w-lg rounded-xl bg-[#2C2C2C] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold noto-sans-arabic-extrabold">
              {itemType === "novel" ? "مشاركة الرواية" : "مشاركة المنشور"}
            </h2>
            <p className="text-sm text-[#B0B0B0] noto-sans-arabic-medium">
              شارك "{title}" مع أصدقائك
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#B0B0B0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Preview */}
            <div>
              <h3 className="text-sm font-medium text-[#B0B0B0] mb-3 noto-sans-arabic-bold">معاينة</h3>
              <div className="flex gap-4 rounded-lg bg-[#3C3C3C] p-4 border border-white/10">
                {imageUrl && (
                  <img 
                    src={imageUrl}
                    alt={title}
                    className="w-20 h-28 flex-shrink-0 object-cover rounded-md"
                  />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <h4 className="font-bold text-white noto-sans-arabic-extrabold line-clamp-1">{title}</h4>
                  <p className="text-sm text-[#B0B0B0] mt-1 line-clamp-3 noto-sans-arabic-medium">
                    {description}
                  </p>
                  <span className="text-xs text-[#808080] mt-auto pt-1">
                    {window.location.hostname}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label 
                className="text-sm font-medium text-[#B0B0B0] mb-2 block noto-sans-arabic-bold" 
                htmlFor="custom-message"
              >
                أضف رسالة (اختياري)
              </label>
              <textarea 
                className="w-full resize-none rounded-lg bg-[#3C3C3C] border border-white/10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-[#808080] text-white p-3 noto-sans-arabic-medium"
                id="custom-message"
                rows={3}
                placeholder="تحقق من هذا..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>

            {/* Social Share Buttons */}
            <div>
              <h3 className="text-sm font-medium text-[#B0B0B0] mb-3 noto-sans-arabic-bold">مشاركة عبر</h3>
              <p className="text-xs text-[#808080] mb-3 noto-sans-arabic-medium">
                سيتم عرض الصورة والوصف تلقائياً عند المشاركة
              </p>
              <div className="flex items-center gap-4" dir="rtl">
                {/* Twitter/X */}
                <button 
                  onClick={handleTwitterShare}
                  className="flex items-center justify-center size-12 bg-[#3C3C3C] rounded-full hover:bg-[#4A4A4A] transition-colors border border-white/10"
                  title="مشاركة على X"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button 
                  onClick={handleFacebookShare}
                  className="flex items-center justify-center size-12 bg-[#3C3C3C] rounded-full hover:bg-[#4A4A4A] transition-colors border border-white/10"
                  title="مشاركة على Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10Z" fillRule="evenodd"/>
                  </svg>
                </button>

                {/* WhatsApp */}
                <button 
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center size-12 bg-[#3C3C3C] rounded-full hover:bg-[#4A4A4A] transition-colors border border-white/10"
                  title="مشاركة على WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="p-6 pt-0">
          <div className="flex items-center gap-2 rounded-lg bg-[#3C3C3C] p-2 border border-white/10">
            <input 
              className="w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#B0B0B0] focus:outline-none bg-transparent p-2 text-sm font-normal noto-sans-arabic-medium" 
              readOnly 
              type="text" 
              value={shareUrl}
              dir="ltr"
            />
            <button 
              onClick={handleCopyLink}
              className="flex-shrink-0 flex min-w-[100px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-colors noto-sans-arabic-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
