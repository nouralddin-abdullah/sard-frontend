import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

export const useGetUserPosts = (userId, pageSize = 10, pageNumber = 1) => {
  const token = Cookies.get(TOKEN_KEY);

  return useQuery({
    queryKey: ["userPosts", userId, pageSize, pageNumber],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/api/posts/user/${userId}`,
        {
          params: {
            pageSize,
            pageNumber,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    enabled: !!userId,
  });
};
