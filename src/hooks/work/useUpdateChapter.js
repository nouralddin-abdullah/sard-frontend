import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const patchChapter = async ({ workId, chapterId, payload }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novel/${workId}/chapter/${chapterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update chapter");
  }

  return response.json();
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-chapter"],
    mutationFn: patchChapter,
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
