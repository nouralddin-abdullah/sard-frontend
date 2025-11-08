import React from "react";
import { Gift, BookOpen, UserPlus, Megaphone, MessageCircle, X } from "lucide-react";
import Header from "../../components/common/Header";

// Static notification data
const notificationsData = {
  new: [
    {
      id: 1,
      type: "gift",
      icon: Gift,
      avatarType: "user", // "user" or "novel" or "icon"
      avatarUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      message: (
        <>
          <span className="font-bold">أحمد</span> أرسل لك 🌹 على روايتك{" "}
          <span className="font-bold">صدى الظلال</span>.
        </>
      ),
      time: "منذ دقيقتين",
      isNew: true,
    },
    {
      id: 2,
      type: "chapter",
      icon: BookOpen,
      avatarType: "novel",
      novelCover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
      message: (
        <>
          تم نشر فصل جديد من <span className="font-bold">سجلات الفراغ</span>.
        </>
      ),
      time: "منذ 15 دقيقة",
      isNew: true,
    },
  ],
  earlier: [
    {
      id: 3,
      type: "follow",
      icon: UserPlus,
      avatarType: "user",
      avatarUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      message: (
        <>
          <span className="font-bold">سارة</span> أرسلت لك طلب متابعة.
        </>
      ),
      time: "منذ ساعة",
      isNew: false,
      hasActions: true,
    },
    {
      id: 4,
      type: "announcement",
      icon: Megaphone,
      avatarType: "icon",
      message: (
        <>
          <span className="font-bold">إعلان النظام:</span> مكافآت جديدة في لوحة المتصدرين متاحة الآن. تحقق منها!
        </>
      ),
      time: "أمس",
      isNew: false,
    },
    {
      id: 5,
      type: "comment",
      icon: MessageCircle,
      avatarType: "user",
      avatarUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      message: (
        <>
          <span className="font-bold">خالد</span> رد على تعليقك في الفصل 3 من{" "}
          <span className="font-bold">صدى الظلال</span>.
        </>
      ),
      time: "منذ يومين",
      isNew: false,
    },
    {
      id: 6,
      type: "novel-update",
      icon: BookOpen,
      avatarType: "novel",
      novelCover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      message: (
        <>
          <span className="font-bold">أساطير المملكة</span>، رواية في مكتبتك، تم تحديثها.
        </>
      ),
      time: "منذ 3 أيام",
      isNew: false,
    },
  ],
};

const NotificationItem = ({ notification }) => {
  const Icon = notification.icon;

  return (
    <div className="flex items-start gap-4 p-4">
      {/* Left side: New indicator dot */}
      <div className="flex-shrink-0 mt-1.5">
        {notification.isNew ? (
          <div className="w-3 h-3 rounded-full bg-[#4A9EFF]"></div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-transparent"></div>
        )}
      </div>

      {/* Avatar/Image Section */}
      <div className="flex-shrink-0">
        {notification.avatarType === "user" && notification.avatarUrl && (
          <img
            src={notification.avatarUrl}
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        {notification.avatarType === "novel" && notification.novelCover && (
          <img
            src={notification.novelCover}
            alt="Novel cover"
            className="w-10 h-[60px] object-cover rounded-sm"
          />
        )}
        {notification.avatarType === "icon" && (
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
        {notification.hasActions && (
          <div className="flex gap-2 mb-2">
            <button className="px-4 py-2 bg-[#4A9EFF] text-white rounded-lg text-sm font-bold hover:bg-[#3A8EEF] transition-colors noto-sans-arabic-bold">
              قبول
            </button>
            <button className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm font-bold hover:bg-neutral-600 transition-colors noto-sans-arabic-bold">
              رفض
            </button>
          </div>
        )}
        <p className="text-neutral-400 text-sm noto-sans-arabic-regular">
          {notification.time}
        </p>
      </div>

      {/* Right side: Close button */}
      <div className="flex-shrink-0">
        <button className="text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
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
            <button className="text-[#4A9EFF] text-sm font-medium hover:text-[#3A8EEF] transition-colors noto-sans-arabic-medium">
              وضع علامة مقروء على الكل
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex flex-col gap-6">
            {/* New Notifications Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-neutral-400 text-sm font-bold uppercase tracking-wider noto-sans-arabic-bold">
                جديد
              </h2>
              <div className="flex flex-col rounded-xl bg-neutral-700 overflow-hidden divide-y divide-neutral-600">
                {notificationsData.new.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </div>

            {/* Earlier Notifications Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-neutral-400 text-sm font-bold uppercase tracking-wider noto-sans-arabic-bold">
                سابقاً
              </h2>
              <div className="flex flex-col rounded-xl bg-neutral-700 overflow-hidden divide-y divide-neutral-600">
                {notificationsData.earlier.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default NotificationsPage;
