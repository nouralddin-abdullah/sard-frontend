import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const likeReview = async ({ novelId, reviewId }) => {
	if (!novelId) throw new Error("Missing novel identifier");
	if (!reviewId) throw new Error("Missing review identifier");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/${novelId}/reviews/${reviewId}/like`, {
		method: "POST",
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "Failed to like review");
	}

	return response.json();
};

export const useLikeReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["like-review"],
		mutationFn: likeReview,
		// Optimistic update - update UI immediately before request completes
		onMutate: async ({ novelId, reviewId }) => {
			// Cancel any outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({ 
				predicate: (query) => query.queryKey[0] === "novel-reviews" && query.queryKey[1] === novelId 
			});

			// Snapshot all matching queries (there might be multiple with different pagination/sorting)
			const previousQueries = [];
			queryClient.getQueryCache().findAll({ 
				predicate: (query) => query.queryKey[0] === "novel-reviews" && query.queryKey[1] === novelId 
			}).forEach((query) => {
				previousQueries.push({ queryKey: query.queryKey, data: query.state.data });
			});

			// Optimistically update ALL matching cache entries
			queryClient.getQueryCache().findAll({ 
				predicate: (query) => query.queryKey[0] === "novel-reviews" && query.queryKey[1] === novelId 
			}).forEach((query) => {
				queryClient.setQueryData(query.queryKey, (old) => {
					if (!old) return old;
					
					return {
						...old,
						items: old.items?.map((review) =>
							review.id === reviewId
								? {
										...review,
										isLikedByCurrentUser: true,
										likeCount: review.likeCount + 1,
								  }
								: review
						),
					};
				});
			});

			// Return context with snapshots for rollback on error
			return { previousQueries };
		},
		// If mutation fails, rollback to previous state and refetch
		onError: (_error, variables, context) => {
			// Restore all previous query states
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
			// Refetch on error to get correct state from server
			if (variables?.novelId) {
				queryClient.invalidateQueries({ 
					predicate: (query) => query.queryKey[0] === "novel-reviews" && query.queryKey[1] === variables.novelId 
				});
			}
		},
		// Don't refetch on success to prevent list reordering/jumping
		// The optimistic update is already correct and fast
	});
};
