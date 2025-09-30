import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchWork = async (workId) => {
	if (!workId) throw new Error("Missing work identifier");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/myworks/${workId}`, {
		headers,
	});

	if (!response.ok) {
		throw new Error("Failed to load work details");
	}

	return response.json();
};

export const useGetWorkById = (workId, options = {}) => {
	return useQuery({
		queryKey: ["my-works", workId],
		queryFn: () => fetchWork(workId),
		enabled: Boolean(workId),
		staleTime: 1000 * 30,
		...options,
	});
};
