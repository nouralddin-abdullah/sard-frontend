import "./App.css";
import AppRouter from "./components/common/AppRouter";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  document.dir =
    !localStorage.getItem("language") ||
    localStorage.getItem("language") === "ar"
      ? "rtl"
      : "ltr";

  return (
    <>
      <ScrollToTop />
      <AppRouter />
    </>
  );
}

export default App;
