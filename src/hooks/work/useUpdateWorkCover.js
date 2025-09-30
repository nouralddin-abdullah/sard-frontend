import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const patchCover = async ({ workId, coverFile }) => {
	if (!workId) throw new Error("Missing work identifier");
	if (!coverFile) throw new Error("Missing cover upload");

	const formData = new FormData();
	formData.append("CoverUrl", coverFile);

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/myworks/novel-cover/${workId}`, {
		method: "PATCH",
		headers,
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Failed to update cover");
	}

	return response.json();
};

export const useUpdateWorkCover = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-work-cover"],
		mutationFn: patchCover,
		onSuccess: (_data, variables) => {
			if (variables?.workId) {
				queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId] });
			}
		},
	});
};
