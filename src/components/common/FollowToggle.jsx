import React, { useState, useEffect } from "react";
import { useToggleFollow } from "../../hooks/user/useToggleFollow";
import Button from "../ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

const FollowToggle = ({ isFollowing, userId, compact = false }) => {
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
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
      // Revert on error
      setIsFollowedState((prev) => !prev);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleFollow}
        disabled={isPending}
        className={`font-semibold px-4 py-1.5 rounded-full transition-opacity text-sm noto-sans-arabic-bold ${
          isFollowedState
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isFollowedState ? t("common.followed") : t("common.follow")}
      </button>
    );
  }

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
