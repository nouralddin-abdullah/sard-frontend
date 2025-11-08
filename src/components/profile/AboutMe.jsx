import { BookCheckIcon, Calendar, MessageSquareText, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import FollowFrame from "../common/FollowFrame";
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

  const followers = userData?.recentFollowers;
  const totalFollowers = userData?.totalFollowers;

  const following = userData?.recentFollowing;
  const totalFollowing = userData?.totalFollowing;

  return (
    <div className="bg-neutral-800 text-white">
      <div className="flex flex-col md:flex-row justify-between p-6 gap-10 md:gap-15 ">
        <div className="flex  items-center flex-col gap-5">
          {/* user about info */}
          <div className="flex flex-col gap-6 bg-neutral-700 p-3 rounded-3xl text-sm md:text-xl font-semibold max-w-[100%] w-full noto-sans-arabic-medium">
            {/* Bio Section */}
            {userData?.userBio && (
              <p className="text-right leading-relaxed">
                "{userData.userBio}"
              </p>
            )}
            
            <div className="flex flex-wrap gap-y-5">
              <div className="flex gap-2 basis-1/2">
                <div>
                  <Calendar></Calendar>
                </div>
                <div>
                  انضم {getTimeSinceArabic(userData?.createdAt)}
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <BookCheckIcon></BookCheckIcon>
                </div>
                <div>
                  {userData?.libraryNovelsCount || 0} رواية في المكتبة
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <Star></Star>
                </div>
                <div>
                  {userData?.reviewsCount || 0} مراجعة
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <MessageSquareText></MessageSquareText>
                </div>
                <div>
                  {userData?.commentsCount || 0} تعليق
                </div>
              </div>
            </div>
          </div>

          {/* followers and following sections */}
          <FollowFrame
            followType={t("profilePage.aboutMe.followers")}
            usersList={followers}
            total={totalFollowers}
          ></FollowFrame>
          <FollowFrame
            followType={t("profilePage.aboutMe.following")}
            usersList={following}
            total={totalFollowing}
          ></FollowFrame>
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
