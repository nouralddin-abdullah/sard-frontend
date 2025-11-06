import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to track reading progress
 * API: POST /api/library/track-progress/{chapterId}
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Reading progress tracked successfully"
 * }
 * 
 * Behavior:
 * - Creates new progress if first time reading novel
 * - Updates existing progress if novel already tracked
 * - Auto-calculates progress percentage
 * - Only works for authenticated users
 */
export const useTrackReadingProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId) => {
      const token = Cookies.get(TOKEN_KEY);
      
      // Don't send request if user is not authenticated
      if (!token) {
        return null;
      }

      const { data } = await axios.post(
        `${BASE_URL}/api/library/track-progress/${chapterId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate reading history to show updated progress
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
    },
    onError: (error) => {
      // Silently fail for unauthenticated users or other errors
      console.log("Failed to track reading progress:", error.message);
    },
  });
};
