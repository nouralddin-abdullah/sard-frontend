import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import useAuthStore from "../../store/authTokenStore";
import { TOKEN_KEY } from "../../constants/token-key";

const getLoggedInUser = async () => {
  const accessToken = Cookies.get(TOKEN_KEY);

  // If there's no token, handle as an error
  if (!accessToken) {
    throw new Error("No access token found");
  }

  try {
    const response = await fetch(`${BASE_URL}/api/User/my-profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const useGetLoggedInUser = () => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  return useQuery({
    queryKey: ["me"],
    queryFn: getLoggedInUser,
    enabled: !!accessToken, // Only run query if token exists
    retry: false, // Don't retry on failure
    staleTime: 1000 * 60 * 5, // 5 minutes - avoid constant refetching
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
