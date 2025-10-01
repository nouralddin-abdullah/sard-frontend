import Cookies from "js-cookie";
import { TOKEN_KEY } from "../constants/token-key";

const DEV_FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjE5MDgzNjBlLTcwYWYtNGRhNi1iM2Y0LThjZGVmMjMzMThkMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJUb2FzdHlfQ29vayIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6Im5vb3JhYmRvNTU3N0BnbWFpbC5jb20iLCJEaXNwbGF5TmFtZSI6IlRvYXN0eSBcdUQ4M0RcdURFMEQiLCJleHAiOjE3NjQ0MDgzMjAsImlzcyI6IlNhcmQiLCJhdWQiOiJTYXJkaW9uIn0.JLnO8atFa_O_NwGhfMa2FBnCJIjnnnq66sua3ePaD5c";

export const ensureDevToken = () => {
  if (!import.meta.env.DEV) return;

  const configuredToken = import.meta.env.VITE_DEV_JWT_TOKEN ?? DEV_FALLBACK_TOKEN;
  if (!configuredToken) return;

  const existingToken = Cookies.get(TOKEN_KEY);
  
  // If there's already a token (even if different), don't override it
  // This allows users to login with different accounts and logout properly
  if (existingToken) return;

  // Only set the dev token if there's NO token at all
  Cookies.set(TOKEN_KEY, configuredToken, {
    sameSite: "strict",
  });
};
