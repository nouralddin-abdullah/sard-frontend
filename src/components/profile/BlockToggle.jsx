import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "../common/ConfirmModal";
import { useSetBlocked } from "../../hooks/user/useBlockUser";

// «حظر» / «إلغاء الحظر» on another member's profile. Blocking asks first: it ends the follows between the two, hides
// the blocked member's comments, reviews and posts from the blocker, and keeps them from following, answering or
// notifying the blocker, or opening the blocker's profile.
const BlockToggle = ({ userId, displayName, isBlocked }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutateAsync: setBlocked, isPending } = useSetBlocked();

  const apply = async (blocked) => {
    try {
      await setBlocked({ userId, blocked });
      toast.success(blocked ? "تم حظر المستخدم" : "تم إلغاء حظر المستخدم");
      setIsConfirming(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isBlocked) {
    return (
      <button
        onClick={() => apply(false)}
        disabled={isPending}
        className="flex items-center gap-2 bg-neutral-700 py-1.5 px-3 md:py-2 rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50 noto-sans-arabic-medium text-sm md:text-base"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
        إلغاء الحظر
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        aria-label="حظر المستخدم"
        title="حظر المستخدم"
        className="flex items-center gap-2 bg-neutral-700 py-1.5 px-2 md:py-2 md:px-3 rounded-md hover:bg-neutral-600 transition-colors"
      >
        <Ban className="w-[18px] h-[18px] md:w-5 md:h-5" />
        <span className="hidden md:block noto-sans-arabic-medium">حظر</span>
      </button>

      <ConfirmModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={() => apply(true)}
        title={`حظر ${displayName}؟`}
        message="لن ترى تعليقاته ومراجعاته ومنشوراته، ولن يتمكن من متابعتك أو الرد على تعليقاتك أو التعليق على منشوراتك أو فتح ملفك الشخصي. ستُلغى المتابعة بينكما، ويمكنك إلغاء الحظر في أي وقت."
        confirmText="حظر"
        isLoading={isPending}
        loadingText="جاري الحظر..."
      />
    </>
  );
};

export default BlockToggle;
