import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { readApiError } from "../../utils/api-error";

const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";
const SIGNED_OUT = "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى.";
const FAILED = "تعذّر رفع الصورة، حاول مرة أخرى.";
const TOO_MANY = "رفعت صورًا كثيرة في وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.";

// POST /api/novel/{novelId}/chapter-images (backend #86), multipart with the file in `image` (JPEG, PNG or WebP, at most
// 5 MB), by the novel's author: answers { url }, the picture's address to put in the chapter as an image paragraph.
// Refusals come with an Arabic message (cover_* codes for the bytes, ValidationFailed, NotOwner); 429 after 30 uploads in
// 10 minutes. Resolves to the url; throws an Error with the text to show.
export const uploadChapterImage = async ({ novelId, file }) => {
  const token = Cookies.get(TOKEN_KEY);
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/novel/${novelId}/chapter-images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error(OFFLINE);
  }

  if (!response.ok) {
    const { code, message } = await readApiError(response);
    const fallback = response.status === 401 ? SIGNED_OUT : response.status === 429 ? TOO_MANY : FAILED;
    const error = new Error(message || fallback);
    error.code = code;
    error.status = response.status;
    throw error;
  }

  const body = await response.json();
  if (!body?.url) {
    throw new Error(FAILED);
  }
  return body.url;
};

export const useUploadChapterImage = () =>
  useMutation({
    mutationKey: ["upload-chapter-image"],
    mutationFn: uploadChapterImage,
  });
