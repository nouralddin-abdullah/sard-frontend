import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchTransactionHistory = async (pageNumber = 1, pageSize = 10) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const url = `${BASE_URL}/api/wallet/transactions?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }

  return response.json();
};

export const useGetTransactionHistory = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["transactionHistory", pageNumber, pageSize],
    queryFn: () => fetchTransactionHistory(pageNumber, pageSize),
    staleTime: 30000, // 30 seconds
  });
};
