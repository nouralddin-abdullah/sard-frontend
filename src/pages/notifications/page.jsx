import React, { useMemo } from "react";
import { Gift, BookOpen, UserPlus, Megaphone, MessageCircle, X, ThumbsUp, Heart, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { useGetNotifications } from "../../hooks/notification/useGetNotifications";
import { useMarkNotificationRead } from "../../hooks/notification/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../../hooks/notification/useMarkAllNotificationsRead";
import { getTimeAgo } from "../../utils/date";
import { toast } from "sonner";

// Map notification types to icons
const getNotificationIcon = (type) => {
  const iconMap = {
    LikeOnComment: ThumbsUp,
    LikeOnPost: Heart,
    CommentOnPost: MessageCircle,
    NewFollower: UserPlus,
    NewChapterInLibrary: BookOpen,
    ReviewOnNovel: Heart,
    Gift: Gift,
    Announcement: Megaphone,
  };
  return iconMap[type] || MessageCircle;
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const Icon = getNotificationIcon(notification.type);
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    
    // Navigate to the URL
    navigate(notification.actionUrl);
  };

  return (
    <Link
      to={notification.actionUrl}
      onClick={handleClick}
      className="flex items-start gap-4 p-4 hover:bg-neutral-600/50 transition-colors"
    >
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
            <img
              src={notification.actorProfilePhoto}
              alt={notification.actorDisplayName}
              className="w-10 h-14 rounded object-cover"
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
          {notification.message}
        </p>
        <p className="text-neutral-400 text-sm noto-sans-arabic-regular">
          {getTimeAgo(notification.createdAt)}
        </p>
      </div>
    </Link>
  );
};

const NotificationsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

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
    </>
  );
};

export default NotificationsPage;
