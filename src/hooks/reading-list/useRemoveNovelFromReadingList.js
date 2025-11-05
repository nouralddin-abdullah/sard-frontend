import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useRemoveNovelFromReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ readingListId, novelId }) => {
      const token = Cookies.get(TOKEN_KEY);
      await axios.delete(
        `${BASE_URL}/api/readinglist/${readingListId}/novels/${novelId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["readingList", variables.readingListId] });
    },
  });
};
