import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { useQuery } from "@tanstack/react-query";

const FALLBACK_GENRES = [
  { id: 1, name: "Adventure" },
  { id: 2, name: "Fantasy" },
  { id: 3, name: "Drama" },
  { id: 4, name: "Science Fiction" },
];

const getGenres = async () => {
  const accessToken = Cookies.get(TOKEN_KEY);

  try {
    const response = await fetch(`${BASE_URL}/api/genre`, {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    });

    if (!response.ok) throw new Error("Error loading Genres");

    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_GENRES;
  } catch (error) {
    console.warn("Falling back to local genres", error);
    return FALLBACK_GENRES;
  }
};

export const useGetGenresList = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });
};
