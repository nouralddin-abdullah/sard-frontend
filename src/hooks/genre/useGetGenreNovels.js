import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const getGenreNovels = async ({ genreSlug, pageNumber = 1, pageSize = 20, sorting, isCompleted }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  const params = new URLSearchParams();
  if (pageNumber) params.append("PageNumber", pageNumber);
  if (pageSize) params.append("PageSize", pageSize);
  if (sorting) params.append("Sorting", sorting);
  if (isCompleted !== undefined && isCompleted !== null) {
    params.append("IsCompleted", isCompleted);
  }

  const queryString = params.toString();
  const url = `${BASE_URL}/api/genre/${genreSlug}/novels${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch genre novels");
  }

  return response.json();
};

export const useGetGenreNovels = ({ genreSlug, pageNumber, pageSize, sorting, isCompleted }) => {
  return useQuery({
    queryKey: ["genre-novels", genreSlug, pageNumber, pageSize, sorting, isCompleted],
    queryFn: () => getGenreNovels({ genreSlug, pageNumber, pageSize, sorting, isCompleted }),
    enabled: !!genreSlug,
  });
};
