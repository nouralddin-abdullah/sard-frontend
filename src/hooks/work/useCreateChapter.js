import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { apiError } from "../../utils/api-error";

const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";

// POST /api/novel/{novelId}/chapter: { title, content, status } → the author's chapter (id, paragraphs, revision...).
const postChapter = async ({ workId, payload }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/novel/${workId}/chapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(OFFLINE);
  }

  if (!response.ok) {
    throw await apiError(
      response,
      response.status === 401 ? "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى." : "تعذّر إنشاء الفصل، حاول مرة أخرى."
    );
  }

  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
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
