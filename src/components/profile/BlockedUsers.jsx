import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBlockedUsers, useSetBlocked } from "../../hooks/user/useBlockUser";
import { DEFAULT_AVATAR_SVG } from "../common/SafeImage";

// Settings: the members the signed-in user blocked, most recent first, each with «إلغاء الحظر».
const BlockedUsers = () => {
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useBlockedUsers();
  const { mutateAsync: setBlocked } = useSetBlocked();
  const [unblockingId, setUnblockingId] = useState(null);
  const users = data?.pages.flatMap((page) => page.items) ?? [];

  const unblock = async (user) => {
    setUnblockingId(user.userId);
    try {
      await setBlocked({ userId: user.userId, blocked: false });
      toast.success("تم إلغاء حظر المستخدم");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl text-white noto-sans-arabic-bold mb-2">المستخدمون المحظورون</h2>
        <p className="text-gray-400 noto-sans-arabic-medium">
          لا ترى تعليقات من تحظرهم ومراجعاتهم ومنشوراتهم، ولا يمكنهم متابعتك أو الرد على تعليقاتك أو فتح ملفك الشخصي.
        </p>
      </div>

      {isPending ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-gray-400 noto-sans-arabic-medium">تعذّر تحميل قائمة المحظورين</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#3C3C3C] transition-colors border border-gray-700"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-400 noto-sans-arabic-medium py-10 text-center">لم تحظر أي مستخدم.</p>
      ) : (
        <ul className="divide-y divide-gray-800 border-y border-gray-800">
          {users.map((user) => (
            <li key={user.userId} className="flex items-center gap-3 py-3">
              <Link to={`/profile/${encodeURIComponent(user.userName)}`} className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={user.profilePhoto || DEFAULT_AVATAR_SVG}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-white noto-sans-arabic-bold truncate">{user.displayName}</p>
                  <p className="text-gray-400 text-sm truncate">
                    <span dir="ltr">@{user.userName}</span>
                  </p>
                </div>
              </Link>
              <button
                onClick={() => unblock(user)}
                disabled={unblockingId === user.userId}
                className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-medium text-sm hover:bg-[#3C3C3C] transition-colors border border-gray-700 disabled:opacity-50 flex-shrink-0"
              >
                {unblockingId === user.userId && <Loader2 className="w-4 h-4 animate-spin" />}
                إلغاء الحظر
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-5 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#3C3C3C] transition-colors border border-gray-700 disabled:opacity-50"
          >
            {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
            عرض المزيد
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
