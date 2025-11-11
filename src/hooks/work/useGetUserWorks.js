import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { useInfiniteQuery } from "@tanstack/react-query";

const buildQueryString = (pageNumber, pageSize) => {
  const params = new URLSearchParams();
  params.set("pageNumber", pageNumber.toString());
  params.set("pageSize", pageSize.toString());
  return params.toString();
};

const getUserWorks = async ({ userId, pageNumber, pageSize }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  try {
    const queryString = buildQueryString(pageNumber, pageSize);
    const response = await fetch(`${BASE_URL}/api/myworks/user/${userId}?${queryString}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Error getting user works");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useGetUserWorks = ({
  userId,
  pageSize = 9,
  enabled = true,
} = {}) => {
  return useInfiniteQuery({
    queryKey: ["user-works", userId, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      getUserWorks({ userId, pageNumber: pageParam, pageSize }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return lastPage.items?.length > 0 && nextPage <= lastPage.totalPages
        ? nextPage
        : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!userId,
  });
};
