import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useFollowReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (readingListId) => {
      const token = Cookies.get(TOKEN_KEY);
      const { data } = await axios.post(
        `${BASE_URL}/api/readinglist/${readingListId}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: (_, readingListId) => {
      queryClient.invalidateQueries({ queryKey: ["followedReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["readingList", readingListId] });
      queryClient.invalidateQueries({ queryKey: ["userReadingLists"] });
    },
  });
};
