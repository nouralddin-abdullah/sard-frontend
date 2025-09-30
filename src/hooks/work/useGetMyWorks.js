import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { useInfiniteQuery } from "@tanstack/react-query";

const EMPTY_FILTERS = Object.freeze({});

const buildQueryString = (pageNumber, pageSize, filters = {}) => {
  const params = new URLSearchParams();
  params.set("PageNumber", pageNumber.toString());
  params.set("PageSize", pageSize.toString());

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, value);
  });

  return params.toString();
};

const getMyWork = async ({ pageNumber, pageSize, filters }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  try {
    const queryString = buildQueryString(pageNumber, pageSize, filters);
    const response = await fetch(`${BASE_URL}/api/myworks?${queryString}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Error getting user work");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useGetMyWorks = ({
  pageSize = 9,
  filters = EMPTY_FILTERS,
  enabled = true,
} = {}) => {
  return useInfiniteQuery({
    queryKey: ["my-works", pageSize, filters],
    queryFn: ({ pageParam = 1 }) =>
      getMyWork({ pageNumber: pageParam, pageSize, filters }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.totalPages) return undefined;
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
  });
};
