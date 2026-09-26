import React, { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import routes from "../../utils/routes";

// Shown only while a page's code downloads (pages are lazy, see utils/routes). Dark like the pages, so there is no
// white flash; navigations between pages keep the current page on screen instead (React Router uses transitions).
const PageLoading = () => <div className="min-h-screen bg-[#1C1C1C]" aria-busy="true" />;

// A page that fails to load or render shows this instead of a blank screen. Going to another page clears it, without
// remounting pages on ordinary navigations.
class PageErrorBoundary extends React.Component {
  state = { failed: false, failedPath: null };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.failed && state.failedPath !== null && props.pathname !== state.failedPath) {
      return { failed: false, failedPath: null };
    }
    return null;
  }

  componentDidCatch(error) {
    console.error("Page failed to load:", error);
    this.setState({ failedPath: this.props.pathname });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white text-xl noto-sans-arabic-bold">تعذّر تحميل الصفحة</p>
        <p className="text-gray-400 noto-sans-arabic-medium">تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#4A9EFF] px-6 py-2 text-white noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
}

const AppRouter = () => {
  const { pathname } = useLocation();

  return (
    <PageErrorBoundary pathname={pathname}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.url} element={route.component} path={route.url} />
          ))}
        </Routes>
      </Suspense>
    </PageErrorBoundary>
  );
};

export default AppRouter;
