import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const deleteChapter = async ({ workId, chapterId }) => {
	if (!workId) throw new Error("Missing work identifier");
	if (!chapterId) throw new Error("Missing chapter identifier");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/novel/${workId}/chapter/${chapterId}`, {
		method: "DELETE",
		headers,
	});

	if (!response.ok) {
		throw new Error("Failed to delete chapter");
	}

	return response.text().then((text) => (text ? JSON.parse(text) : null)).catch(() => null);
};

export const useDeleteChapter = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["delete-chapter"],
		mutationFn: deleteChapter,
		onSuccess: (_data, variables) => {
			if (variables?.workId) {
				queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId, "chapters"] });
			}
			if (variables?.workId && variables?.chapterId) {
				queryClient.invalidateQueries({
					queryKey: ["my-works", variables.workId, "chapters", variables.chapterId],
				});
			}
		},
	});
};
