import React, { useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetFollowersList } from "../../hooks/user/useGetFollowersList";
import { useGetFollowingList } from "../../hooks/user/useGetFollowingList";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import FollowToggle from "../common/FollowToggle";

const DefaultAvatarIcon = ({ className }) => (
  <div className={`rounded-full bg-[#4A4A4A] flex items-center justify-center ${className}`}>
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
    </svg>
  </div>
);

const FollowersModal = ({ isOpen, onClose, userId, initialTab = "followers" }) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const scrollContainerRef = useRef(null);

  // Get logged in user to check if user is viewing themselves
  const { data: loggedInUser } = useGetLoggedInUser();

  // Update active tab when initialTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const {
    data: followersData,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasNextFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
    isLoading: isLoadingFollowers,
  } = useGetFollowersList(userId, 20, isOpen && activeTab === "followers");

  const {
    data: followingData,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasNextFollowing,
    isFetchingNextPage: isFetchingNextFollowing,
    isLoading: isLoadingFollowing,
  } = useGetFollowingList(userId, 20, isOpen && activeTab === "following");

  const followers = followersData?.pages?.flatMap((page) => page.items) || [];
  const following = followingData?.pages?.flatMap((page) => page.items) || [];
  const totalFollowers = followersData?.pages?.[0]?.totalItemsCount || 0;
  const totalFollowing = followingData?.pages?.[0]?.totalItemsCount || 0;

  const currentList = activeTab === "followers" ? followers : following;
  const isLoading = activeTab === "followers" ? isLoadingFollowers : isLoadingFollowing;
  const isFetchingNext = activeTab === "followers" ? isFetchingNextFollowers : isFetchingNextFollowing;
  const hasNext = activeTab === "followers" ? hasNextFollowers : hasNextFollowing;
  const fetchNext = activeTab === "followers" ? fetchNextFollowers : fetchNextFollowing;

  // Handle infinite scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current || !hasNext || isFetchingNext) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchNext();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [hasNext, isFetchingNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#2C2C2C] border border-[#5A5A5A] text-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold noto-sans-arabic-extrabold">
            {activeTab === "followers" ? "المتابِعون" : "المتابَعين"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            className={`flex-1 py-3 text-center font-semibold transition-colors noto-sans-arabic-bold relative ${
              activeTab === "followers"
                ? "text-blue-400"
                : "text-white/60 hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("followers")}
          >
            المتابِعون ({totalFollowers.toLocaleString("ar-EG")})
            {activeTab === "followers" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
          <button
            className={`flex-1 py-3 text-center font-semibold transition-colors noto-sans-arabic-bold relative ${
              activeTab === "following"
                ? "text-blue-400"
                : "text-white/60 hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("following")}
          >
            المتابَعين ({totalFollowing.toLocaleString("ar-EG")})
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
        </div>

        {/* Search Bar - Non-functional for now */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8] w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث في القائمة"
              disabled
              className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg py-2.5 pr-4 pl-10 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-white placeholder:text-[#B8B8B8] noto-sans-arabic-medium disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Users List */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto px-4 pb-4 flex-grow"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-20 text-white/60 noto-sans-arabic-medium">
              {activeTab === "followers"
                ? "لا يوجد متابعون بعد"
                : "لا يتابع أحداً بعد"}
            </div>
          ) : (
            <ul className="space-y-3">
              {currentList.map((user) => {
                const isCurrentUser = loggedInUser?.id === user.userId;
                
                return (
                  <li key={user.userId}>
                    <div className="flex items-center gap-4" dir="rtl">
                      <Link to={`/profile/${user.userName}`}>
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <DefaultAvatarIcon className="w-12 h-12 flex-shrink-0" />
                        )}
                      </Link>
                      <div className="flex-grow min-w-0 text-right">
                        <Link
                          to={`/profile/${user.userName}`}
                          className="font-bold text-white hover:text-blue-400 transition-colors noto-sans-arabic-bold block truncate"
                        >
                          {user.displayName}
                        </Link>
                        <p className="text-sm text-[#B8B8B8] noto-sans-arabic-medium truncate text-right">
                          {/* Truncate username to 8 chars on mobile, full on desktop */}
                          <span className="md:hidden">
                            @{user.userName?.length > 12 ? `${user.userName.slice(0, 12)}...` : user.userName}
                          </span>
                          <span className="hidden md:inline">
                            @{user.userName}
                          </span>
                        </p>
                      </div>
                      {!isCurrentUser && (
                        <FollowToggle
                          isFollowing={user.isFollowing}
                          userId={user.userId}
                          compact
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Loading more indicator */}
          {isFetchingNext && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
