import AuthFailure from "../pages/auth/auth-failed";
import AuthSuccess from "../pages/auth/auth-successful";
import ChangePasswordPage from "../pages/auth/change-password";
import ForgotPasswordPage from "../pages/auth/forgot-password";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import HomePage from "../pages/home/page";
import CreateNovelPage from "../pages/novel/create";
import NovelPage from "../pages/novel/page";
import ChapterReaderPage from "../pages/novel/chapter-reader";
import ProfilePage from "../pages/profile/page";
import ReadingListPage from "../pages/profile/ReadingListPage";
import Test from "../pages/test";
import EditWorkPage from "../pages/work/edit";
import WorkDashboardPage from "../pages/work/dashboard";
import ChapterEditorPage from "../pages/work/chapter-editor";

const routes = [
  // auth
  {
    url: "/login",
    component: <LoginPage />,
  },
  {
    url: "/register",
    component: <RegisterPage />,
  },
  {
    url: "/forgot-password",
    component: <ForgotPasswordPage />,
  },
  {
    url: "/reset-password",
    component: <ChangePasswordPage />,
  },
  {
    url: "/auth/success",
    component: <AuthSuccess />,
  },
  {
    url: "/auth/error",
    component: <AuthFailure />,
  },

  // pages
  {
    url: "/",
    component: <HomePage />,
  },
  {
    url: "/test",
    component: <Test />,
  },
  {
    url: "/profile/:username",
    component: <ProfilePage />,
  },
  {
    url: "/profile/:username/list/:listId",
    component: <ReadingListPage />,
  },
  {
    url: "/reading-list/:listId",
    component: <ReadingListPage />,
  },
  {
    url: "/novel/:novelSlug",
    component: <NovelPage />,
  },
  {
    url: "/novel/:novelSlug/chapter/:chapterId",
    component: <ChapterReaderPage />,
  },
  {
    url: "/novel/create",
    component: <CreateNovelPage />,
  },
  {
    url: "/dashboard/works",
    component: <WorkDashboardPage />,
  },
  {
    url: "/dashboard/works/:workId/edit",
    component: <EditWorkPage />,
  },
  {
    url: "/dashboard/works/:workId/chapters/:chapterId/edit",
    component: <ChapterEditorPage />,
  },
  {
    url: "/dashboard/works/:workId/chapters/new",
    component: <ChapterEditorPage />,
  },
];

export default routes;
