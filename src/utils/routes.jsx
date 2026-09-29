import { lazy } from "react";

// Every page is its own chunk, so a reader downloads the code of the page they open (not the editor, the
// dashboard or the contests). AppRouter shows a placeholder while a chunk loads; main.jsx reloads the page
// once if a chunk from an older deploy is gone.
const AuthFailure = lazy(() => import("../pages/auth/auth-failed"));
const AuthSuccess = lazy(() => import("../pages/auth/auth-successful"));
const ChangePasswordPage = lazy(() => import("../pages/auth/change-password"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/forgot-password"));
const LoginPage = lazy(() => import("../pages/auth/login"));
const RegisterPage = lazy(() => import("../pages/auth/register"));
const HomePage = lazy(() => import("../pages/home/page"));
const LandingPage = lazy(() => import("../pages/landing/page"));
const MetsardPage = lazy(() => import("../pages/authorsbenefits/page"));
const CreateNovelPage = lazy(() => import("../pages/novel/create"));
const NovelPage = lazy(() => import("../pages/novel/page"));
const ChapterReaderPage = lazy(() => import("../pages/novel/chapter-reader"));
const NovelLeaderboardPage = lazy(() => import("../pages/novel/leaderboard"));
const NovelSupportersPage = lazy(() => import("../pages/novel/supporters"));
const NovelWikipediaPage = lazy(() => import("../pages/novel/wikipedia"));
const EntityDetailsPage = lazy(() => import("../pages/novel/entity-details"));
const EntityEditPage = lazy(() => import("../pages/novel/entity-edit"));
const ProfilePage = lazy(() => import("../pages/profile/page"));
const SettingsPage = lazy(() => import("../pages/profile/settings"));
const DeleteAccountPage = lazy(() => import("../pages/profile/delete-account"));
const LegalPage = lazy(() => import("../pages/legal/page"));
const ReadingListPage = lazy(() => import("../pages/profile/ReadingListPage"));
const LibraryPage = lazy(() => import("../pages/profile/LibraryPage"));
const SearchPage = lazy(() => import("../pages/search/page"));
const LeaderboardPage = lazy(() => import("../pages/leaderboard/page"));
const NotificationsPage = lazy(() => import("../pages/notifications/page"));
const EditWorkPage = lazy(() => import("../pages/work/edit"));
const WorkDashboardPage = lazy(() => import("../pages/work/dashboard"));
const ChapterEditorPage = lazy(() => import("../pages/work/chapter-editor"));
const GenrePage = lazy(() => import("../pages/genre/GenrePage"));
const HelpCenterPage = lazy(() => import("../pages/help/page"));
const HelpArticlePage = lazy(() => import("../pages/help/article"));
const EarningsPage = lazy(() => import("../pages/earnings/page"));
const WekipeidaTutorial = lazy(() => import("../pages/wekipeida/page"));
const GlobalNotFoundPage = lazy(() => import("../pages/not-found/page"));
const ImSpecialContestPage = lazy(() => import("../pages/contests/im-special"));
const JudgingCriteriaPage = lazy(() => import("../pages/contests/judging-criteria"));
const WinningRulesPage = lazy(() => import("../pages/contests/winning-rules"));
const ImportantNotesPage = lazy(() => import("../pages/contests/important-notes"));

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
  // Account deletion: what it does, and the form for a signed-in member. Google Play lists this URL.
  {
    url: "/delete-account",
    component: <DeleteAccountPage />,
  },
  // The legal pages, public: Google Play, the Google sign-in consent screen and the app link them. The texts are the
  // owner's (src/content/legal); the SEO worker serves the same pages to crawlers.
  {
    url: "/privacy",
    component: <LegalPage pageKey="privacy" />,
  },
  {
    url: "/terms",
    component: <LegalPage pageKey="terms" />,
  },
  {
    url: "/guidelines",
    component: <LegalPage pageKey="guidelines" />,
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
