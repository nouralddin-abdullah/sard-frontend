import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AboutMe from "../../components/profile/AboutMe";
import MyNovels from "../../components/profile/MyNovels";
import Library from "../../components/profile/Library";
import BadgesList from "../../components/profile/BadgesList";
import mainPicture from "../../assets/mainPicture.jpg";
import profilePicture from "../../assets/profilePicture.jpg";
import { Settings } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useGetUserByUsername } from "../../hooks/user/useGetUserByUsername";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import UpdateUserModal from "../../components/profile/UpdateUserModal";
import FollowToggle from "../../components/common/FollowToggle";

const ProfilePage = () => {
  const { username } = useParams();
  const { data: userData, isPending } = useGetUserByUsername(username);
  const { data: loggedInUser } = useGetLoggedInUser();

  const { t } = useTranslation();

  const [selectedSubPage, setSelectedSubPage] = useState("about-me");
  const [isUpdateMeOpen, setIsUpdateMeOpen] = useState(false);

  /* 
        in order to change the text written in the buttons that navigates between sections you have to use the t function in this array
        for example, if you want to translate the (About Me) text and you already changed the translation.json files to handle it
        then you will have to vome to this array, choose the (title) property and use the t function in it
        so if you added the text in translation.json in a variable called (aboutMe), then You have to make a change similar to this:-
        before: title: "About Me"
        after: title: t("aboutMe")
    */
  const subPages = [
    {
      title: t("profilePage.profileNav.aboutMe"),
      value: "about-me",
      isActive: true,
    },
    {
      title: t("profilePage.profileNav.myNovels"),
      value: "my-novels",
      isActive: false,
    },
    {
      title: t("profilePage.profileNav.library"),
      value: "library",
      isActive: false,
    },
    {
      title: t("profilePage.profileNav.badges"),
      value: "badges",
      isActive: false,
    },
  ];

  const navigateSubPages = (val) => {
    setSelectedSubPage(val);
  };

  if (isPending) return <>Loading..</>;

  return (
    <div className="bg-zinc-800 min-h-screen">
      {/* profile image, username */}
      <div
        className="w-full h-80 bg-cover bg-center flex justify-center"
        style={{
          backgroundImage: `url(${userData?.profileBanner || profilePicture})`,
        }}
      >
        <div className=" flex justify-center items-center flex-col gap-4">
          <img
            src={userData?.profilePhoto || mainPicture}
            alt={userData?.displayName}
            className="w-40 rounded-full"
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
              className={`cursor-pointer relative whitespace-nowrap text-[14px] md:text-3xl py-3 btn-underline ${
                subPage.value === selectedSubPage && "border-b-2 border-white"
              }`}
              onClick={() => navigateSubPages(subPage.value)}
            >
              {subPage.title}
            </button>
          ))}
        </div>

        {loggedInUser?.id === userData?.id ? (
          <div
            className="flex justify-between items-center gap-3 bg-neutral-700 py-1.5 px-2 md:py-2 md:px-3 rounded-md cursor-pointer"
            onClick={() => setIsUpdateMeOpen(true)}
          >
            <Settings className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]"></Settings>
            <button className="cursor-pointer text-shadow-sm text-shadow-gray-800 hidden md:block">
              {t("profilePage.profileNav.profileSettings")}
            </button>
          </div>
        ) : (
          <FollowToggle
            isFollowed={userData?.isFollowing}
            userId={userData?.id}
          />
        )}
      </div>

      {/* components of the sub sections */}
      {selectedSubPage === "about-me" && <AboutMe userData={userData} />}
      {selectedSubPage === "my-novels" && <MyNovels />}
      {selectedSubPage === "library" && <Library />}
      {selectedSubPage === "badges" && <BadgesList />}

      <UpdateUserModal
        isOpen={isUpdateMeOpen}
        onClose={() => setIsUpdateMeOpen(false)}
        userData={userData}
      />
    </div>
  );
};

export default ProfilePage;
