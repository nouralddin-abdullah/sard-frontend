import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const patchChapterOrder = async ({ workId, orderedChapterIds }) => {
	if (!workId) throw new Error("Missing work identifier");
	if (!Array.isArray(orderedChapterIds)) throw new Error("Missing chapter ordering");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/myworks/${workId}/chapters`, {
		method: "PATCH",
		headers,
		body: JSON.stringify({ orderedChapterIds }),
	});

	if (!response.ok) {
		throw new Error("Failed to reorder chapters");
	}

	// Handle 204 No Content or any empty response body
	const contentType = response.headers.get("content-type");
	if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
		return { success: true };
	}

	// Check if response has content before parsing
	const text = await response.text();
	if (!text) {
		return { success: true };
	}

	return JSON.parse(text);
};

export const useReorderWorkChapters = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["reorder-chapters"],
		mutationFn: patchChapterOrder,
		onSuccess: (_data, variables) => {
			if (variables?.workId) {
				queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId, "chapters"] });
			}
		},
	});
};
