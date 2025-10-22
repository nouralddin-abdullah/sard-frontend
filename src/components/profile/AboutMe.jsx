import { BookCheckIcon, Calendar, MessageSquareText, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import FollowFrame from "../common/FollowFrame";
import mainPicture from "../../assets/mainPicture.jpg";
import AboutMePost from "../common/AboutMePost";
import { formatDateShort } from "../../utils/date";

const AboutMe = ({ userData }) => {
  const { t } = useTranslation();

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
            <p className="text-right leading-relaxed">
              "سأحارب الأشرار واحمي العجائز والنساء.. نعم انا القط المشمشي حلو بس مش شقي."
            </p>
            
            <div className="flex flex-wrap gap-y-5">
              <div className="flex gap-2 basis-1/2">
                <div>
                  <Calendar></Calendar>
                </div>
                <div>
                  {t("profilePage.aboutMe.joined")}{" "}
                  {formatDateShort(userData?.createdAt)}
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <BookCheckIcon></BookCheckIcon>
                </div>
                <div>
                  {t("profilePage.aboutMe.red")} 1,298{" "}
                  {t("profilePage.aboutMe.chapter")}
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <Star></Star>
                </div>
                <div>
                  {t("profilePage.aboutMe.gave")} 24{" "}
                  {t("profilePage.aboutMe.rating")}
                </div>
              </div>

              <div className="flex gap-2 basis-1/2">
                <div>
                  <MessageSquareText></MessageSquareText>
                </div>
                <div>
                  {t("profilePage.aboutMe.commented")} 249{" "}
                  {t("profilePage.aboutMe.times")}
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
          <div className="bg-neutral-700 rounded-3xl p-3 flex items-center gap-5">
            <img
              src={mainPicture}
              alt=""
              className="w-12 md:w-16 rounded-full"
            />
            <textarea
              placeholder={t("profilePage.aboutMe.writeSomething")}
              className="bg-amber-50 w-full h-22 text-black p-6 rounded-3xl border-none outline-none resize-none noto-sans-arabic-medium"
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
          </div>

          <div>
            <AboutMePost
              postId="1"
              content={
                "أنا كقطٍّ مُشْمَشي، واجبٌ عليَّ أن أُحارب الشرَّ وأحمي الحيَّ ممَّا يهدِّده، فالعَدْلُ غريزتي، والمُغامرةُ طريقي."
              }
            />
            <AboutMePost
              postId="2"
              content={
                "That's testing for the posts in the about me page and it's done so far"
              }
            />
            <AboutMePost
              postId="3"
              content={
                "الحل معروف هما ٦ شهور بس يبن الناس هتغير حياتك فيهم هتبطل سكر هتبطل كارب هتبطل اكل هتبدأ بناء ضوئي هتضرب ابوك وامك هتروح الجيم تلعب باي بس هتصحي كل يوم ٤ الفجر تجري ورا الكلاب إللى تحت البيت"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
