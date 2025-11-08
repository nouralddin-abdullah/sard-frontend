import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

const getUserByUsername = async (username) => {
  try {
    const token = Cookies.get(TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/User/${username}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useGetUserByUsername = (username) => {
  return useQuery({
    queryKey: ["user-data", username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });
};
