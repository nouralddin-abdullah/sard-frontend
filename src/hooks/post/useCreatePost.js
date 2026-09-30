import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { readApiError } from "../../utils/api-error";

const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";
const SIGNED_OUT = "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى.";
const FAILED = "تعذّر نشر المنشور، حاول مرة أخرى.";

// POST /api/posts (multipart): content, image and novelId, each optional but not all (#43). The API trims the text and
// refuses with 400 {success: false, code, message}: PostContentRequired, PostContentTooLong, PostImageType,
// PostImageTooLarge, NovelNotFound or UploadFailed, with an Arabic message to show as it is. Throws an Error with the
// text to show, and the code and status.
const createPost = async ({ content, image, novelId }) => {
  const token = Cookies.get(TOKEN_KEY);
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  if (image instanceof File) {
    formData.append("image", image);
  }
  if (novelId) {
    formData.append("novelId", novelId);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error(OFFLINE);
  }

  if (!response.ok) {
    const { code, message } = await readApiError(response);
    const error = new Error(message || (response.status === 401 ? SIGNED_OUT : FAILED));
    error.code = code;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch user posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
};
