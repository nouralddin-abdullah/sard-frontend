import { BookCheckIcon, Calendar, MessageSquareText, Star, Users, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import mainPicture from "../../assets/mainPicture.jpg";
import AboutMePost from "../common/AboutMePost";
import CreatePostModal from "./CreatePostModal";
import { getTimeSinceArabic } from "../../utils/date";
import { useGetUserPosts } from "../../hooks/post/useGetUserPosts";

const AboutMe = ({ userData, isOwnProfile = false }) => {
  const { t } = useTranslation();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  
  // Fetch user posts
  const { data: postsData, isLoading: loadingPosts } = useGetUserPosts(userData?.id);

  const totalFollowers = userData?.totalFollowers || 0;
  const totalFollowing = userData?.totalFollowing || 0;

  return (
    <div className="bg-neutral-800 text-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between p-6 gap-6 md:gap-10">
        {/* Left Sidebar - Stats */}
        <div className="flex items-start flex-col gap-5 w-full md:max-w-sm">
          {/* Bio Section */}
          {userData?.userBio && (
            <div className="w-full rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 shadow-lg">
              <p className="text-right leading-relaxed text-white/90 noto-sans-arabic-medium text-sm">
                "{userData.userBio}"
              </p>
            </div>
          )}

          {/* Social Stats Panel */}
          <div className="w-full rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="#" 
                className="group flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                  <p className="text-sm font-normal text-white/50 group-hover:text-white/80 transition-colors noto-sans-arabic-medium">
                    متابَعون
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-white noto-sans-arabic-bold">
                  {totalFollowing.toLocaleString('ar-EG')}
                </p>
              </a>

              <a 
                href="#" 
                className="group flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                  <p className="text-sm font-normal text-white/50 group-hover:text-white/80 transition-colors noto-sans-arabic-medium">
                    متابِعون
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-white noto-sans-arabic-bold">
                  {totalFollowers.toLocaleString('ar-EG')}
                </p>
              </a>
            </div>

            {/* Divider */}
            <div className="my-6 h-px w-full bg-white/10"></div>

            {/* User Details List */}
            <div className="flex flex-col gap-2">
              <div className="flex min-h-14 items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="flex-1 truncate text-base font-normal text-white/80 noto-sans-arabic-medium">
                    انضم منذ
                  </p>
                </div>
                <div className="shrink-0">
                  <p className="text-base font-normal text-white noto-sans-arabic-medium">
                    {getTimeSinceArabic(userData?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex min-h-14 items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <BookCheckIcon className="w-5 h-5" />
                  </div>
                  <p className="flex-1 truncate text-base font-normal text-white/80 noto-sans-arabic-medium">
                    روايات في المكتبة
                  </p>
                </div>
                <div className="shrink-0">
                  <p className="text-base font-normal text-white noto-sans-arabic-bold">
                    {userData?.libraryNovelsCount || 0}
                  </p>
                </div>
              </div>

              <div className="flex min-h-14 items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="flex-1 truncate text-base font-normal text-white/80 noto-sans-arabic-medium">
                    مراجعات مكتوبة
                  </p>
                </div>
                <div className="shrink-0">
                  <p className="text-base font-normal text-white noto-sans-arabic-bold">
                    {userData?.reviewsCount || 0}
                  </p>
                </div>
              </div>

              <div className="flex min-h-14 items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <p className="flex-1 truncate text-base font-normal text-white/80 noto-sans-arabic-medium">
                    تعليقات
                  </p>
                </div>
                <div className="shrink-0">
                  <p className="text-base font-normal text-white noto-sans-arabic-bold">
                    {userData?.commentsCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* profile writings */}
        <div className="w-full flex flex-col gap-10 md:gap-15">
          {/* Only show "write something" box if viewing own profile */}
          {isOwnProfile && (
            <div 
              onClick={() => setIsCreatePostModalOpen(true)}
              className="bg-neutral-700 rounded-3xl p-3 flex items-center gap-5 cursor-pointer hover:bg-neutral-600 transition-colors"
            >
              <img
                src={userData?.profilePhoto || mainPicture}
                alt=""
                className="w-12 md:w-16 rounded-full"
              />
              <div className="bg-amber-50 w-full h-22 text-gray-500 p-6 rounded-3xl flex items-center noto-sans-arabic-medium">
                {t("profilePage.aboutMe.writeSomething")}
              </div>
            </div>
          )}

          <div>
            {loadingPosts ? (
              <div className="text-center py-8 text-[#B0B0B0] noto-sans-arabic-medium">
                جاري تحميل المنشورات...
              </div>
            ) : postsData?.items && postsData.items.length > 0 ? (
              postsData.items.map((post) => (
                <AboutMePost
                  key={post.id}
                  postId={post.id}
                  content={post.content}
                  author={{
                    userName: post.user?.userName || userData?.userName,
                    displayName: post.user?.displayName || userData?.displayName,
                    profilePhoto: post.user?.profilePhoto || userData?.profilePhoto,
                  }}
                  createdAt={post.createdAt}
                  attachedImage={post.imageUrl}
                  attachedNovel={post.novel}
                  likesCount={post.likesCount}
                  commentsCount={post.commentsCount}
                  isLiked={post.isLikedByCurrentUser}
                />
              ))
            ) : (
              <div className="text-center py-8 text-[#B0B0B0] noto-sans-arabic-medium">
                {isOwnProfile 
                  ? "لا توجد منشورات بعد. ابدأ بكتابة أول منشور لك!" 
                  : `لا توجد منشورات من ${userData?.displayName || "هذا المستخدم"} بعد`
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal - Only show if viewing own profile */}
      {isOwnProfile && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AboutMe;
