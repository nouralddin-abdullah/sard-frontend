import { useState } from "react";
import { createPortal } from "react-dom";
import { Flag, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import AuthRequiredModal from "./AuthRequiredModal";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { REPORT_DETAILS_MAX_LENGTH, REPORT_REASONS, useCreateReport } from "../../hooks/moderation/useCreateReport";

const TITLES = {
  Comment: "الإبلاغ عن تعليق",
  Review: "الإبلاغ عن مراجعة",
  Post: "الإبلاغ عن منشور",
  User: "الإبلاغ عن مستخدم",
  Novel: "الإبلاغ عن رواية",
  ReadingList: "الإبلاغ عن قائمة قراءة",
  GiftMessage: "الإبلاغ عن رسالة هدية",
};

const ReportDialog = ({ target, onClose }) => {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState("");
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const close = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    try {
      const { created } = await createReport({ targetType: target.type, targetId: target.id, reason, details });
      toast.success(created ? "تم إرسال البلاغ، شكراً لك. سيراجعه فريق سرد." : "سبق أن أبلغت عن هذا المحتوى، وبلاغك قيد المراجعة.");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#2C2C2C] rounded-lg shadow-2xl w-full max-w-md mx-4 border border-[#5A5A5A] max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#5A5A5A]">
          <h3 id="report-dialog-title" className="flex items-center gap-2 text-white noto-sans-arabic-bold text-lg">
            <Flag size={18} className="text-red-400" />
            {TITLES[target.type] || "إبلاغ"}
          </h3>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
            disabled={isPending}
            className="text-[#B8B8B8] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <fieldset className="space-y-2">
            <legend className="text-[#B8B8B8] noto-sans-arabic-medium text-sm mb-2">ما سبب البلاغ؟</legend>
            {REPORT_REASONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-colors ${
                  reason === option.value ? "border-[#4A9EFF] bg-[#3C3C3C]" : "border-transparent hover:bg-[#3C3C3C]"
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => setReason(option.value)}
                  className="accent-[#4A9EFF] w-4 h-4"
                />
                <span className="text-white noto-sans-arabic-medium text-sm">{option.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="report-details" className="block text-[#B8B8B8] noto-sans-arabic-medium text-sm">
              تفاصيل إضافية (اختياري)
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={REPORT_DETAILS_MAX_LENGTH}
              rows={3}
              placeholder="صف المشكلة باختصار"
              className="w-full bg-[#3C3C3C] text-white rounded-lg px-3 py-2 noto-sans-arabic-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] border border-[#5A5A5A]"
            />
            <p className="text-xs text-[#686868] noto-sans-arabic-medium text-end">
              {details.length}/{REPORT_DETAILS_MAX_LENGTH}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#5A5A5A]">
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-[#3C3C3C] text-white noto-sans-arabic-medium text-sm hover:bg-[#4C4C4C] transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={!reason || isPending}
            className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white noto-sans-arabic-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            إرسال البلاغ
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

// Reports a comment, review, post, user, novel, reading list or gift message: target is {type, id} (type as the API
// names it; a gift message's id is its gift's), or null when closed. Signed-out readers are asked to sign in first.
const ReportModal = ({ target, onClose }) => {
  const { data: currentUser } = useGetLoggedInUser();

  if (!target) return null;
  if (!currentUser?.id) {
    return <AuthRequiredModal isOpen onClose={onClose} action="للإبلاغ عن المحتوى" />;
  }
  return <ReportDialog key={`${target.type}:${target.id}`} target={target} onClose={onClose} />;
};

export default ReportModal;
