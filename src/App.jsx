import "./App.css";
import AppRouter from "./components/common/AppRouter";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  // Arabic-only site: always right-to-left (index.html also sets lang="ar" dir="rtl").
  document.documentElement.lang = "ar";
  document.dir = "rtl";

  return (
    <>
      <ScrollToTop />
      <AppRouter />
    </>
  );
}

export default App;
