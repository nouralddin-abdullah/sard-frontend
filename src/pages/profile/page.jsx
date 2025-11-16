import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AboutMe from "../../components/profile/AboutMe";
import MyNovels from "../../components/profile/MyNovels";
import Library from "../../components/profile/Library";
import BadgesList from "../../components/profile/BadgesList";
import PointsWallet from "../../components/profile/PointsWallet";
import Header from "../../components/common/Header";
import mainPicture from "../../assets/mainPicture.jpg";
import profilePicture from "../../assets/profilePicture.jpg";
import { useGetUserByUsername } from "../../hooks/user/useGetUserByUsername";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import FollowToggle from "../../components/common/FollowToggle";
import { FaFacebook, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

const ProfilePage = () => {
  const { username } = useParams();
  const { data: userData, isPending } = useGetUserByUsername(username);
  const { data: loggedInUser } = useGetLoggedInUser();

  const { t } = useTranslation();

  const [selectedSubPage, setSelectedSubPage] = useState("about-me");
  const [showDiscordTooltip, setShowDiscordTooltip] = useState(false);

  const handleDiscordClick = () => {
    if (userData?.discordUrl) {
      navigator.clipboard.writeText(userData.discordUrl);
      toast.success("تم نسخ اسم المستخدم على Discord");
      setShowDiscordTooltip(false);
    }
  };

  // Check if viewing own profile
  const isOwnProfile = loggedInUser?.id === userData?.id;

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
      value: "library",
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

  const navigateSubPages = (val) => {
    setSelectedSubPage(val);
  };

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
            backgroundImage: `url(${userData?.profileBanner || profilePicture})`,
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
          <img
            src={userData?.profilePhoto || mainPicture}
            alt={userData?.displayName}
            className="w-40 h-40 rounded-full object-cover"
          />
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
                subPage.value === selectedSubPage && "border-b-2 border-white"
              }`}
              onClick={() => navigateSubPages(subPage.value)}
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
      {selectedSubPage === "about-me" && (
        <AboutMe 
          userData={userData} 
          isOwnProfile={isOwnProfile}
        />
      )}
      {/* My Novels is visible to everyone */}
      {selectedSubPage === "my-novels" && (
        <MyNovels 
          userId={userData?.id} 
          isOwnProfile={isOwnProfile}
        />
      )}
      {/* Library component handles public/private reading lists internally */}
      {selectedSubPage === "library" && <Library username={username} />}
      {/* Points/Wallet - Only for own profile */}
      {selectedSubPage === "points" && isOwnProfile && (
        <PointsWallet userId={userData?.id} />
      )}
      {/* Badges temporarily removed */}
      {/* {selectedSubPage === "badges" && <BadgesList />} */}
      </div>
    </>
  );
};

export default ProfilePage;
