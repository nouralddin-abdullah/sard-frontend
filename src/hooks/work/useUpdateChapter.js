import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { arabicMessage } from "../../utils/api-error";

const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";
const SIGNED_OUT = "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى.";
const FAILED = "تعذّر حفظ الفصل، حاول مرة أخرى.";

// PATCH /api/novel/{novelId}/chapter/{chapterId} (backend #75): { title, content, status, baseRevision, publishAt? },
// or { status } alone. Answers { success, message, revision, status, publishAt }. A save from an older copy (baseRevision
// isn't the chapter's revision) is 409 { code: "ChapterChanged", message, revision } and saves nothing.
// With dryRun, nothing is saved and the answer says what the save would delete:
// { paragraphsRemoved, commentsDeleted, removed: [{ paragraphId, commentsCount }] }.
// Throws an Error with the Arabic text to show and its code, status, and the chapter's revision on a conflict.
const patchChapter = async ({ workId, chapterId, payload, dryRun = false }) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  const url = `${BASE_URL}/api/novel/${workId}/chapter/${chapterId}${dryRun ? "?dryRun=true" : ""}`;

  let response;
  try {
    response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(OFFLINE);
  }

  const text = await response.text().catch(() => "");
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const validationMessage = body?.errors
      ? Object.values(body.errors).flat().find((message) => typeof message === "string")
      : null;
    const message = arabicMessage(body?.message) || arabicMessage(validationMessage);
    const error = new Error(message || (response.status === 401 ? SIGNED_OUT : FAILED));
    error.code = typeof body?.code === "string" ? body.code : null;
    error.status = response.status;
    error.revision = typeof body?.revision === "number" ? body.revision : null;
    throw error;
  }

  return body ?? {};
};

/** What saving this payload would delete, without saving: { paragraphsRemoved, commentsDeleted, removed }. */
export const previewChapterUpdate = ({ workId, chapterId, payload }) =>
  patchChapter({ workId, chapterId, payload, dryRun: true });

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-chapter"],
    mutationFn: patchChapter,
    onSuccess: (_data, variables) => {
      if (variables?.dryRun) return;
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
