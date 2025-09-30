import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const patchWork = async ({ workId, payload }) => {
	if (!workId) throw new Error("Missing work identifier");
	if (!payload) throw new Error("Missing update payload");

	const accessToken = Cookies.get(TOKEN_KEY);
	const headers = {
		"Content-Type": "application/json",
	};
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const response = await fetch(`${BASE_URL}/api/myworks/${workId}`, {
		method: "PATCH",
		headers,
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error("Failed to update work");
	}

	return response.json();
};

export const useUpdateWork = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-work"],
		mutationFn: patchWork,
		onSuccess: (_data, variables) => {
			if (variables?.workId) {
				queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId] });
				queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId, "chapters"] });
			}
		},
	});
};
