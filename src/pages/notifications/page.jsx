import React, { useMemo, useState } from "react";
import { Gift, BookOpen, UserPlus, Megaphone, MessageCircle, X, ThumbsUp, Heart, Loader2, Flag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { useGetNotifications } from "../../hooks/notification/useGetNotifications";
import { useMarkNotificationRead } from "../../hooks/notification/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../../hooks/notification/useMarkAllNotificationsRead";
import { getTimeAgo } from "../../utils/date";
import { toast } from "sonner";
import NovelCover from "../../components/common/NovelCover";
import ReportModal from "../../components/common/ReportModal";

// Map notification types to icons
const getNotificationIcon = (type) => {
  const iconMap = {
    LikeOnComment: ThumbsUp,
    LikeOnPost: Heart,
    CommentOnPost: MessageCircle,
    NewFollower: UserPlus,
    NewChapterInLibrary: BookOpen,
    ReviewOnNovel: Heart,
    GiftReceived: Gift,
    Gift: Gift,
    Announcement: Megaphone,
  };
  return iconMap[type] || MessageCircle;
};

const NotificationItem = ({ notification, onMarkRead, onReport }) => {
  const Icon = getNotificationIcon(notification.type);
  const navigate = useNavigate();
  // What a gift's sender wrote (#31), read from the gift: null once a moderator removed it. The author can report it,
  // by the gift's id.
  const giftMessage = notification.type === "GiftReceived" ? notification.giftMessage : null;
  const canReportMessage = !!giftMessage && !!notification.giftTransactionId;

  const handleClick = (e) => {
    e.preventDefault();
    
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    
    // Navigate to the URL
    navigate(notification.actionUrl);
  };

  return (
    // The whole row opens the notification (its link's ::after covers the row); the report button sits above that.
    <div className="relative flex items-start gap-4 p-4 hover:bg-neutral-600/50 transition-colors">
      {/* Left side: New indicator dot */}
      <div className="flex-shrink-0 mt-1.5">
        {!notification.isRead ? (
          <div className="w-3 h-3 rounded-full bg-[#4A9EFF]"></div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-transparent"></div>
        )}
      </div>

      {/* Avatar/Image Section */}
      <div className="flex-shrink-0">
        {notification.actorProfilePhoto ? (
          // Novel-related notifications show rectangular cover, others show circular avatar
          notification.type === "NewChapterInLibrary" || notification.type === "ReviewOnNovel" ? (
            <NovelCover
              src={notification.actorProfilePhoto}
              title={notification.actorDisplayName}
              rounded="rounded"
              className="w-10"
              sizes="40px"
            />
          ) : (
            <img
              src={notification.actorProfilePhoto}
              alt={notification.actorDisplayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#4A9EFF]/20 flex items-center justify-center text-[#4A9EFF]">
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-base mb-2 noto-sans-arabic-medium">
          <Link
            to={notification.actionUrl}
            onClick={handleClick}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[#4A9EFF]"
          >
            {notification.message}
          </Link>
        </p>
        {giftMessage && (
          <p
            dir="auto"
            title={giftMessage}
            className="mb-2 w-fit max-w-full rounded-lg bg-neutral-800/70 px-3 py-2 text-sm leading-relaxed text-neutral-200 whitespace-pre-line break-words line-clamp-6 noto-sans-arabic-medium"
          >
            {giftMessage}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-neutral-400 text-sm noto-sans-arabic-regular">
            {getTimeAgo(notification.createdAt)}
          </p>
          {canReportMessage && (
            <button
              type="button"
              onClick={() => onReport({ type: "GiftMessage", id: notification.giftTransactionId })}
              className="relative z-10 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors noto-sans-arabic-medium"
            >
              <Flag size={12} aria-hidden="true" />
              إبلاغ عن الرسالة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const [reportTarget, setReportTarget] = useState(null);

  // Flatten all notifications from all pages
  const allNotifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.notifications || []);
  }, [data]);

  const handleMarkRead = (notificationId) => {
    markNotificationRead.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead.mutate(undefined, {
      onSuccess: () => {
        toast.success("تم وضع علامة مقروء على جميع الإشعارات");
      },
      onError: () => {
        toast.error("فشل في تحديث الإشعارات");
      },
    });
  };

  // Separate notifications into new and earlier
  const { newNotifications, earlierNotifications } = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newOnes = allNotifications.filter(notif => {
      // Ensure UTC parsing by appending 'Z' if not present
      const dateStr = notif.createdAt?.endsWith('Z') ? notif.createdAt : notif.createdAt + 'Z';
      const notifDate = new Date(dateStr);
      return notifDate > oneDayAgo;
    });

    const earlierOnes = allNotifications.filter(notif => {
      // Ensure UTC parsing by appending 'Z' if not present
      const dateStr = notif.createdAt?.endsWith('Z') ? notif.createdAt : notif.createdAt + 'Z';
      const notifDate = new Date(dateStr);
      return notifDate <= oneDayAgo;
    });

    return { newNotifications: newOnes, earlierNotifications: earlierOnes };
  }, [allNotifications]);

  return (
    <>
      <Header />
      <div className="bg-zinc-800 min-h-screen">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-3xl font-bold noto-sans-arabic-bold">
              الإشعارات
            </h1>
            <button 
              onClick={handleMarkAllRead}
              disabled={markAllNotificationsRead.isPending || allNotifications.length === 0}
              className="text-[#4A9EFF] text-sm font-medium hover:text-[#3A8EEF] transition-colors noto-sans-arabic-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllNotificationsRead.isPending ? "جاري التحديث..." : "وضع علامة مقروء على الكل"}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#4A9EFF]" />
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-20">
              <p className="text-neutral-400 text-lg noto-sans-arabic-regular">
                حدث خطأ في تحميل الإشعارات. يرجى المحاولة مرة أخرى.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && allNotifications.length === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-400 text-lg noto-sans-arabic-regular">
                لا توجد إشعارات حتى الآن
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!isLoading && !isError && allNotifications.length > 0 && (
            <div className="flex flex-col gap-6">
              {/* New Notifications Section */}
              {newNotifications.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-neutral-400 text-sm font-bold uppercase tracking-wider noto-sans-arabic-bold">
                    جديد
                  </h2>
                  <div className="flex flex-col rounded-xl bg-neutral-700 overflow-hidden divide-y divide-neutral-600">
                    {newNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onReport={setReportTarget}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier Notifications Section */}
              {earlierNotifications.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-neutral-400 text-sm font-bold uppercase tracking-wider noto-sans-arabic-bold">
                    سابقاً
                  </h2>
                  <div className="flex flex-col rounded-xl bg-neutral-700 overflow-hidden divide-y divide-neutral-600">
                    {earlierNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onReport={setReportTarget}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-3 bg-[#4A9EFF] text-white rounded-lg font-bold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed noto-sans-arabic-bold flex items-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        يتم التحميل...
                      </>
                    ) : (
                      "تحميل المزيد"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />
    </>
  );
};

export default NotificationsPage;
