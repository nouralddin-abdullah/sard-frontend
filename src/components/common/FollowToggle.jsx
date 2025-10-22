import React, { useState } from "react";
import { useToggleFollow } from "../../hooks/user/useToggleFollow";
import Button from "../ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

const FollowToggle = ({ isFollowed, userId }) => {
  const { t } = useTranslation();

  const [isFollowedState, setIsFollowedState] = useState(isFollowed);

  const { mutateAsync: toggleFollow } = useToggleFollow();

  const handleFollow = async () => {
    try {
      setIsFollowedState((prev) => !prev);
      await toggleFollow({ isFollowed: isFollowedState, userId });
    } catch (error) {
      console.error(error);
      toast.error("something went wrong, please try again.");
      setIsFollowedState((prev) => !prev);
    }
  };

  return (
    <Button
      variant={isFollowedState ? "secondary" : "primary"}
      onClick={handleFollow}
      className="noto-sans-arabic-bold"
    >
      {isFollowedState ? (
        <span className="noto-sans-arabic-bold">{t("common.followed")}</span>
      ) : (
        <p className="flex items-center gap-1 noto-sans-arabic-bold">
          <span>{t("common.follow")}</span>
          <span>
            <Plus />{" "}
          </span>
        </p>
      )}
    </Button>
  );
};

export default FollowToggle;
