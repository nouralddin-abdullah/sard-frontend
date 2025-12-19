import AuthFailure from "../pages/auth/auth-failed";
import AuthSuccess from "../pages/auth/auth-successful";
import ChangePasswordPage from "../pages/auth/change-password";
import ForgotPasswordPage from "../pages/auth/forgot-password";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import HomePage from "../pages/home/page";
import LandingPage from "../pages/landing/page";
import MetsardPage from "../pages/authorsbenefits/page";
import CreateNovelPage from "../pages/novel/create";
import NovelPage from "../pages/novel/page";
import ChapterReaderPage from "../pages/novel/chapter-reader";
import NovelLeaderboardPage from "../pages/novel/leaderboard";
import NovelSupportersPage from "../pages/novel/supporters";
import NovelWikipediaPage from "../pages/novel/wikipedia";
import EntityDetailsPage from "../pages/novel/entity-details";
import EntityEditPage from "../pages/novel/entity-edit";
import ProfilePage from "../pages/profile/page";
import SettingsPage from "../pages/profile/settings";
import ReadingListPage from "../pages/profile/ReadingListPage";
import LibraryPage from "../pages/profile/LibraryPage";
import SearchPage from "../pages/search/page";
import LeaderboardPage from "../pages/leaderboard/page";
import NotificationsPage from "../pages/notifications/page";
import Test from "../pages/test";
import EditWorkPage from "../pages/work/edit";
import WorkDashboardPage from "../pages/work/dashboard";
import ChapterEditorPage from "../pages/work/chapter-editor";
import GenrePage from "../pages/genre/GenrePage";
import HelpCenterPage from "../pages/help/page";
import HelpArticlePage from "../pages/help/article";
import EarningsPage from "../pages/earnings/page";
import WekipeidaTutorial from "../pages/wekipeida/page";
import GlobalNotFoundPage from "../pages/not-found/page";
import ImSpecialContestPage from "../pages/contests/im-special";
import JudgingCriteriaPage from "../pages/contests/judging-criteria";
import WinningRulesPage from "../pages/contests/winning-rules";
import ImportantNotesPage from "../pages/contests/important-notes";


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
    url: "/change-password",
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
    component: <LandingPage />,
  },
  {
    url: "/home",
    component: <HomePage />,
  },
  {
    url: "/authorsbenefits",
    component: <MetsardPage />,
  },
  {
    url: "/test",
    component: <Test />,
  },
  {
    url: "/library",
    component: <LibraryPage />,
  },
  {
    url: "/leaderboard",
    component: <LeaderboardPage />,
  },
  {
    url: "/notifications",
    component: <NotificationsPage />,
  },
  {
    url: "/search",
    component: <SearchPage />,
  },
  {
    url: "/profile/:username",
    component: <ProfilePage />,
  },
  {
    url: "/settings",
    component: <SettingsPage />,
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
    url: "/novel/:novelSlug/leaderboard",
    component: <NovelLeaderboardPage />,
  },
  {
    url: "/novel/:novelSlug/supporters",
    component: <NovelSupportersPage />,
  },
  {
    url: "/novel/:novelId/wikipedia",
    component: <NovelWikipediaPage />,
  },
  {
    url: "/novel/:novelId/wikipedia/:entityId/edit",
    component: <EntityEditPage />,
  },
  {
    url: "/novel/:novelId/wikipedia/:entityId",
    component: <EntityDetailsPage />,
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
    url: "/genre/:genreSlug",
    component: <GenrePage />,
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
  {
    url: "/help",
    component: <HelpCenterPage />,
  },
  {
    url: "/help/article/:articleId",
    component: <HelpArticlePage />,
  },
  {
    url: "/earnings",
    component: <EarningsPage />,
  },
  {
    url: "/metwekpeida",
    component: <WekipeidaTutorial />,
  },
  // Contests - Individual competition pages at /contests/{slug}
  {
    url: "/contests/im-special",
    component: <ImSpecialContestPage />,
  },
  // Contests - Shared pages (judging criteria, winning rules, important notes)
  {
    url: "/contests/judging-criteria",
    component: <JudgingCriteriaPage />,
  },
  {
    url: "/contests/winning-rules",
    component: <WinningRulesPage />,
  },
  {
    url: "/contests/important-notes",
    component: <ImportantNotesPage />,
  },
  // 404 catch-all route - must be last
  {
    url: "*",
    component: <GlobalNotFoundPage />,
  },
];

export default routes;
