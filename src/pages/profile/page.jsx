import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Loader2 } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import AboutMe from "../../components/profile/AboutMe";
import MyNovels from "../../components/profile/MyNovels";
import Library from "../../components/profile/Library";
import BadgesList from "../../components/profile/BadgesList";
import PointsWallet from "../../components/profile/PointsWallet";
import Header from "../../components/common/Header";
import profilePicture from "../../assets/profilePicture.jpg";
import { useGetUserByUsername } from "../../hooks/user/useGetUserByUsername";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import FollowToggle from "../../components/common/FollowToggle";
import { FaFacebook, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

// Default user avatar SVG component (same as Header)
const DefaultAvatarIcon = () => (
  <svg width="160" height="160" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
  </svg>
);

const ProfilePage = () => {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: loggedInUser, dataUpdatedAt: loggedInUserUpdatedAt, isLoading: isLoadingLoggedIn } = useGetLoggedInUser();
  
  // Only fetch user by username if it's NOT the logged-in user's profile
  const isOwnProfile = loggedInUser?.userName?.toLowerCase() === username?.toLowerCase();
  const { data: fetchedUserData, isPending: isFetchingUser, dataUpdatedAt } = useGetUserByUsername(
    isOwnProfile ? null : username // Pass null to disable the query for own profile
  );
  
  // Use loggedInUser data for own profile, fetched data for others
  const userData = isOwnProfile ? loggedInUser : fetchedUserData;
  const isPending = isOwnProfile ? isLoadingLoggedIn : isFetchingUser;

  // Cache-busting for images (in case backend replaces with same filename)
  const getCacheBustedUrl = (url, timestamp) => {
    if (!url) return null;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${timestamp}`;
  };

  // Use appropriate timestamp based on whose profile we're viewing
  const imageTimestamp = isOwnProfile ? loggedInUserUpdatedAt : dataUpdatedAt;

  const { t } = useTranslation();

  // Valid tabs - single source of truth
  const VALID_TABS = ['about-me', 'my-novels', 'reading-lists', 'points'];
  const DEFAULT_TAB = 'about-me';
  
  // Get current tab from URL, fallback to default if invalid
  const tabParam = searchParams.get('tab');
  const currentTab = VALID_TABS.includes(tabParam) ? tabParam : DEFAULT_TAB;

  // Navigate to tab by updating URL
  const navigateToTab = (tab) => {
    if (tab === DEFAULT_TAB) {
      // Remove tab param for default tab (cleaner URLs)
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const [showDiscordTooltip, setShowDiscordTooltip] = useState(false);

  const handleDiscordClick = () => {
    if (userData?.discordUrl) {
      navigator.clipboard.writeText(userData.discordUrl);
      toast.success("تم نسخ اسم المستخدم على Discord");
      setShowDiscordTooltip(false);
    }
  };

  /* 
        in order to change the text written in the buttons that navigates between sections you have to use the t function in this array
        for example, if you want to translate the (About Me) text and you already changed the translation.json files to handle it
        then you will have to vome to this array, choose the (title) property and use the t function in it
        so if you added the text in translation.json in a variable called (aboutMe), then You have to make a change similar to this:-
        before: title: "About Me"
        after: title: t("aboutMe")
    */
  const allSubPages = [
    {
      // Show "About Me" for own profile, "About Him" for others
      title: isOwnProfile 
        ? t("profilePage.profileNav.aboutMe")
        : "عنه",
      value: "about-me",
      isActive: true,
      showForOthers: true, // Always visible
    },
    {
      // Show "My Novels" for own profile, "His Novels" for others
      title: isOwnProfile 
        ? t("profilePage.profileNav.myNovels")
        : "رواياته",
      value: "my-novels",
      isActive: false,
      showForOthers: true, // Always visible - everyone can see user's novels
    },
    {
      title: t("profilePage.profileNav.library"),
      value: "reading-lists",
      isActive: false,
      showForOthers: true, // Always visible - Library component handles public/private lists internally
    },
    {
      title: "المحفظة",
      value: "points",
      isActive: false,
      showForOthers: false, // Only visible to own profile
    },
    // Badges temporarily removed
    // {
    //   title: t("profilePage.profileNav.badges"),
    //   value: "badges",
    //   isActive: false,
    //   showForOthers: true, // Always visible
    // },
  ];

  // Filter tabs based on whether viewing own profile
  const subPages = isOwnProfile 
    ? allSubPages 
    : allSubPages.filter(page => page.showForOthers);

  if (isPending) {
    return (
      <>
        <Header />
        <div className="bg-zinc-800 min-h-screen">
          {/* Loading Banner */}
          <div className="w-full h-80 bg-zinc-700 animate-pulse flex justify-center items-center">
            <div className="flex justify-center items-center flex-col gap-4">
              <div className="w-40 h-40 rounded-full bg-zinc-600 animate-pulse"></div>
              <div className="h-8 w-48 bg-zinc-600 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-zinc-600 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Loading Navigation */}
          <div className="bg-neutral-800 flex justify-between items-center text-white px-6 py-3">
            <div className="flex gap-4 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24 bg-zinc-600 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-10 w-32 bg-zinc-600 rounded animate-pulse"></div>
          </div>

          {/* Loading Content */}
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-zinc-800 min-h-screen">
        {/* profile image, username */}
        <div
          className="w-full h-80 bg-cover bg-center flex justify-center relative"
          style={{
            backgroundImage: `url(${userData?.profileBanner ? getCacheBustedUrl(userData.profileBanner, imageTimestamp) : profilePicture})`,
          }}
        >
          {/* Social Media Icons - Bottom Left Corner */}
          {(userData?.facebookUrl || userData?.twitterUrl || userData?.discordUrl) && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {userData?.facebookUrl && (
                <a
                  href={userData.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-[#1877f2] transition-all duration-300 group"
                  title="Facebook"
                >
                  <FaFacebook className="text-white text-xl group-hover:scale-110 transition-transform" />
                </a>
              )}
              
              {userData?.twitterUrl && (
                <a
                  href={userData.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black transition-all duration-300 group"
                  title="X (Twitter)"
                >
                  <FaXTwitter className="text-white text-xl group-hover:scale-110 transition-transform" />
                </a>
              )}
              
              {userData?.discordUrl && (
                <div className="relative">
                  <button
                    onClick={handleDiscordClick}
                    onMouseEnter={() => setShowDiscordTooltip(true)}
                    onMouseLeave={() => setShowDiscordTooltip(false)}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-[#5865f2] transition-all duration-300 group"
                    title="Discord"
                  >
                    <FaDiscord className="text-white text-xl group-hover:scale-110 transition-transform" />
                  </button>
                  
                  {/* Discord Tooltip */}
                  {showDiscordTooltip && (
                    <div className="absolute bottom-12 left-0 bg-[#2C2C2C] text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10 noto-sans-arabic-medium text-sm">
                      <div className="mb-1 text-gray-400">Discord:</div>
                      <div className="font-bold" dir="ltr">{userData.discordUrl}</div>
                      <div className="text-xs text-gray-400 mt-1">اضغط للنسخ</div>
                      {/* Arrow */}
                      <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#2C2C2C]"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        <div className=" flex justify-center items-center flex-col gap-4">
          {userData?.profilePhoto ? (
            <img
              src={getCacheBustedUrl(userData.profilePhoto, imageTimestamp)}
              alt={userData?.displayName}
              className="w-40 h-40 rounded-full object-cover"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-zinc-700 flex items-center justify-center">
              <DefaultAvatarIcon />
            </div>
          )}
          <p className="text-3xl text-white font-bold text-shadow-sm text-shadow-gray-800">
            {userData?.displayName}
          </p>
          <Link
            to={`/profile/${userData?.userName}`}
            className="text-2xl text-white font-bold text-shadow-sm text-shadow-gray-800"
            dir="ltr"
          >
            @{userData?.userName}
          </Link>
        </div>
      </div>

      {/* the navigation buttons */}
      <div className="bg-neutral-800 flex justify-between items-center text-white px-6 drop-shadow-md">
        <div className="flex gap-4 md:gap-8">
          {subPages.map((subPage) => (
            <button
              key={subPage.value}
              className={`cursor-pointer relative whitespace-nowrap text-[14px] md:text-xl py-2.5 btn-underline noto-sans-arabic-medium ${
                subPage.value === currentTab && "border-b-2 border-white"
              }`}
              onClick={() => navigateToTab(subPage.value)}
            >
              {subPage.title}
            </button>
          ))}
        </div>

        {isOwnProfile ? (
          <Link
            to="/settings"
            className="flex justify-between items-center gap-3 bg-neutral-700 py-1.5 px-2 md:py-2 md:px-3 rounded-md cursor-pointer hover:bg-neutral-600 transition-colors"
          >
            <Settings className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]"></Settings>
            <span className="cursor-pointer text-shadow-sm text-shadow-gray-800 hidden md:block noto-sans-arabic-medium">
              {t("profilePage.profileNav.profileSettings")}
            </span>
          </Link>
        ) : (
          <FollowToggle
            isFollowing={userData?.isFollowing}
            userId={userData?.id}
          />
        )}
      </div>

      {/* components of the sub sections */}
      {currentTab === "about-me" && (
        <AboutMe 
          userData={userData} 
          isOwnProfile={isOwnProfile}
        />
      )}
      {/* My Novels is visible to everyone */}
      {currentTab === "my-novels" && (
        <MyNovels 
          userId={userData?.id} 
          isOwnProfile={isOwnProfile}
        />
      )}
      {/* Library component handles public/private reading lists internally */}
      {currentTab === "reading-lists" && <Library username={username} />}
      {/* Points/Wallet - Only for own profile */}
      {currentTab === "points" && isOwnProfile && (
        <PointsWallet userId={userData?.id} />
      )}
      {/* Badges temporarily removed */}
      {/* {currentTab === "badges" && <BadgesList />} */}
      </div>
    </>
  );
};

export default ProfilePage;
