import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { apiError } from "../../utils/api-error";

const authHeaders = () => {
  const token = Cookies.get(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// POST /api/User/block and DELETE /api/User/block/{userId}; both are idempotent.
const setBlocked = async ({ userId, blocked }) => {
  const response = blocked
    ? await fetch(`${BASE_URL}/api/User/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ userId }),
      })
    : await fetch(`${BASE_URL}/api/User/block/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

  if (!response.ok) {
    throw await apiError(response, blocked ? "تعذّر حظر المستخدم، حاول مرة أخرى" : "تعذّر إلغاء الحظر، حاول مرة أخرى");
  }
  return response.json();
};

// What a block changes on the server: the profile's isBlockedByMe, the follows between the two, and the blocked
// user's comments, replies, reviews, posts and notifications in the blocker's lists.
const AFFECTED_QUERIES = [
  "user-data",
  "blocked-users",
  "chapterComments",
  "paragraphComments",
  "postComments",
  "commentReplies",
  "novel-reviews",
  "userPosts",
  "userReadingLists",
  "notifications",
];

export const useSetBlocked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["set-blocked"],
    mutationFn: setBlocked,
    onSuccess: () => {
      AFFECTED_QUERIES.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
  });
};

const PAGE_SIZE = 20;

// GET /api/User/blocked: the users the signed-in user blocked, most recent first.
export const useBlockedUsers = ({ enabled = true } = {}) =>
  useInfiniteQuery({
    queryKey: ["blocked-users"],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`${BASE_URL}/api/User/blocked?pageNumber=${pageParam}&pageSize=${PAGE_SIZE}`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        throw await apiError(response, "تعذّر تحميل قائمة المحظورين");
      }
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.items.length > 0 && pages.reduce((count, page) => count + page.items.length, 0) < lastPage.totalItemsCount
        ? pages.length + 1
        : undefined,
    enabled,
  });
