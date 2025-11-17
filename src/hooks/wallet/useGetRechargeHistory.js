import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchRechargeHistory = async (pageNumber = 1, pageSize = 10, status = null) => {
  const token = Cookies.get(TOKEN_KEY);
  
  let url = `${BASE_URL}/api/wallet/recharge?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (status && status !== "all") {
    url += `&status=${status}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recharge history");
  }

  return response.json();
};

export const useGetRechargeHistory = (pageNumber = 1, pageSize = 10, status = null) => {
  return useQuery({
    queryKey: ["rechargeHistory", pageNumber, pageSize, status],
    queryFn: () => fetchRechargeHistory(pageNumber, pageSize, status),
    staleTime: 30000, // 30 seconds
  });
};
