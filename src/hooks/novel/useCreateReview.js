import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const createReview = async ({ novelId, payload }) => {
	if (!novelId) throw new Error("Missing novel identifier");
	if (!payload) throw new Error("Missing review payload");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/${novelId}`, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to create review");
	}

	return response.json();
};

export const useCreateReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["create-review"],
		mutationFn: createReview,
		onSuccess: (_data, variables) => {
			// Invalidate reviews list to refetch with new review
			if (variables?.novelId) {
				queryClient.invalidateQueries({ queryKey: ["novel-reviews", variables.novelId] });
				// Also invalidate novel details to update rating stats
				queryClient.invalidateQueries({ queryKey: ["novel", variables.novelId] });
			}
		},
	});
};
