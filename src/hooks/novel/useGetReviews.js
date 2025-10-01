import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchReviews = async (novelId, pageSize = 10, pageNumber = 1, sorting = "likes") => {
	if (!novelId) throw new Error("Missing novel identifier");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const queryParams = new URLSearchParams({
		pageSize: pageSize.toString(),
		pageNumber: pageNumber.toString(),
		sorting,
	});

	const response = await fetch(`${BASE_URL}/api/${novelId}?${queryParams}`, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error("Failed to fetch reviews");
	}

	return response.json();
};

export const useGetReviews = (novelId, pageSize = 10, pageNumber = 1, sorting = "likes") => {
	return useQuery({
		queryKey: ["novel-reviews", novelId, pageSize, pageNumber, sorting],
		queryFn: () => fetchReviews(novelId, pageSize, pageNumber, sorting),
		enabled: !!novelId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
