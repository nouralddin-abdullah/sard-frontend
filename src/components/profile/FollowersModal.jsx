import React, { useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetFollowersList } from "../../hooks/user/useGetFollowersList";
import { useGetFollowingList } from "../../hooks/user/useGetFollowingList";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import FollowToggle from "../common/FollowToggle";
import mainPicture from "../../assets/mainPicture.jpg";

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
                        <img
                          src={user.profilePhoto || mainPicture}
                          alt={user.displayName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
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
