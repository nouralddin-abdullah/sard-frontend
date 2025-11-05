import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useGetMyReadingLists = (pageNumber = 1, pageSize = 12, options = {}) => {
  return useQuery({
    queryKey: ["myReadingLists", pageNumber, pageSize],
    queryFn: async () => {
      const token = Cookies.get(TOKEN_KEY);
      const { data } = await axios.get(
        `${BASE_URL}/api/readinglist/my-lists`,
        {
          params: { pageNumber, pageSize },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
