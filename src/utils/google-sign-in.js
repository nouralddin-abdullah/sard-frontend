import { BASE_URL } from "../constants/base-url";

const GOOGLE_CLIENT_ID = "782956139930-c2n3qomffhg645rkiqj4r2drppha7g1g.apps.googleusercontent.com";

// Google's sign-in page (authorization code flow). Google sends the reader to the API's callback, which signs them in
// and redirects to /auth/success with the token. selectAccount makes Google ask which account to use, even when the
// browser is signed in to one already (to confirm it's the reader before deleting their account).
export const googleSignInUrl = ({ selectAccount = false } = {}) =>
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(`${BASE_URL}/api/identity/google-callback`)}&` +
  `response_type=code&` +
  `scope=openid%20profile%20email&` +
  (selectAccount ? `prompt=select_account&` : "") +
  `state=login_${Date.now()}`;
