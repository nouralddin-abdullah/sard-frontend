import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useGetReadingListById = (readingListId) => {
  return useQuery({
    queryKey: ["readingList", readingListId],
    queryFn: async () => {
      const token = Cookies.get(TOKEN_KEY);
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      
      const { data } = await axios.get(
        `${BASE_URL}/api/readinglist/${readingListId}`,
        config
      );
      return data;
    },
    enabled: Boolean(readingListId),
    staleTime: 1000 * 60 * 5,
  });
};
