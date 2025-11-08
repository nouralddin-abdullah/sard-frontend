import React, { useState, useEffect } from "react";
import { useToggleFollow } from "../../hooks/user/useToggleFollow";
import Button from "../ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

const FollowToggle = ({ isFollowing, userId }) => {
  const { t } = useTranslation();

  const [isFollowedState, setIsFollowedState] = useState(isFollowing ?? false);

  const { mutateAsync: toggleFollow, isPending } = useToggleFollow();

  // Update local state when prop changes
  useEffect(() => {
    if (isFollowing !== undefined) {
      setIsFollowedState(isFollowing);
    }
  }, [isFollowing]);

  const handleFollow = async () => {
    try {
      // Save current state before changing it
      const currentFollowState = isFollowedState;
      
      // Optimistic update - change UI immediately
      setIsFollowedState((prev) => !prev);
      
      // Pass the state BEFORE the change to the API
      await toggleFollow({ isFollowed: currentFollowState, userId });
    } catch (error) {
      console.error(error);
      toast.error("something went wrong, please try again.");
      // Revert on error
      setIsFollowedState((prev) => !prev);
    }
  };

  return (
    <Button
      variant={isFollowedState ? "secondary" : "primary"}
      onClick={handleFollow}
      className="noto-sans-arabic-bold"
      disabled={isPending}
      isLoading={isPending}
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
