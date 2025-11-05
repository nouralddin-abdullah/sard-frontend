import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";

export const useGetUserReadingLists = (userName, pageNumber = 1, pageSize = 12, options = {}) => {
  return useQuery({
    queryKey: ["userReadingLists", userName, pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE_URL}/api/readinglist/user/${userName}`,
        {
          params: { pageNumber, pageSize },
        }
      );
      return data;
    },
    enabled: Boolean(userName),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
