import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const postChapter = async ({ workId, payload }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novel/${workId}/chapter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create chapter");
  }

  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-chapter"],
    mutationFn: postChapter,
    onSuccess: (_data, variables) => {
      if (variables?.workId) {
        queryClient.invalidateQueries({ queryKey: ["my-works", variables.workId, "chapters"] });
      }
    },
  });
};
