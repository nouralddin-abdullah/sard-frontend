import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const deleteReview = async (novelId) => {
	if (!novelId) throw new Error("Missing novel identifier");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/${novelId}`, {
		method: "DELETE",
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to delete review");
	}

	return response.json();
};

export const useDeleteReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["delete-review"],
		mutationFn: deleteReview,
		onSuccess: (_data, novelId) => {
			// Invalidate reviews list to refetch without deleted review
			if (novelId) {
				queryClient.invalidateQueries({ queryKey: ["novel-reviews", novelId] });
				// Also invalidate novel details to update rating stats
				queryClient.invalidateQueries({ queryKey: ["novel", novelId] });
			}
		},
	});
};
