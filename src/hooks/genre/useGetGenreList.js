import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { useQuery } from "@tanstack/react-query";
import { GENRES } from "../../utils/genreSections";

// Same ids, slugs and names as the API's genres (the author forms submit these ids), so a failed request
// can't make the create/edit forms assign the wrong genre or send genre links to /genre/undefined.
const FALLBACK_GENRES = GENRES;

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
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - genres rarely change
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
};
