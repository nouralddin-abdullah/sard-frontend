import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchWalletBalance = async () => {
  const token = Cookies.get(TOKEN_KEY);
  
  const url = `${BASE_URL}/api/wallet`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wallet balance");
  }

  return response.json();
};

export const useGetWalletBalance = (enabled = true) => {
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWalletBalance,
    enabled: enabled, // Only fetch when explicitly enabled
    staleTime: 30000, // 30 seconds
  });
};
