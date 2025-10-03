import React from "react";
import mainPicture from "../../assets/mainPicture.jpg";
import { Heart, HeartIcon, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutMePost = ({ content }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-neutral-700 rounded-3xl mb-10">
      <div className=" px-3 py-6 flex gap-5 items-center">
        <img src={mainPicture} alt="" className="w-12 md:w-16 rounded-full" />
        <p>{content}</p>
      </div>

      <div className="flex items-center ">
        <Heart className="text-red-400 mx-3"></Heart>
        <img src={mainPicture} alt="" className="w-8 rounded-full -mr-3" />
        <img src={mainPicture} alt="" className="w-8 rounded-full -mr-3" />
        <img src={mainPicture} alt="" className="w-8 rounded-full -mr-3 " />
      </div>

      <div className="flex justify-around items-center border-t-2 mt-1 py-4">
        <div className=" group flex justify-center items-center gap-1 cursor-pointer">
          <HeartIcon className="group-hover:fill-red-500 group-hover:text-red-500"></HeartIcon>
          {t("profilePage.aboutMe.like")}
        </div>

        <div className="flex justify-center items-center gap-1 cursor-pointer">
          <MessageSquareText></MessageSquareText>
          {t("profilePage.aboutMe.comment")}
        </div>
      </div>
    </div>
  );
};

export default AboutMePost;
