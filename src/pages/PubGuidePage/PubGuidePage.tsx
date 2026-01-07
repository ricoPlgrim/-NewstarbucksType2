// src/layouts/RootLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import PageScrollReset from "../../components/ScrollToTop/PageScrollReset";
import "../../App.scss";

function AppNav() {
  const location = useLocation();

  return (
    <nav className="app-nav">
      <Link to="/url" className={`app-nav-btn ${location.pathname === "/url" ? "active" : ""}`}>
        URL 관리
      </Link>
      <Link to="/guide" className={`app-nav-btn ${location.pathname === "/guide" ? "active" : ""}`}>
        퍼블리싱 가이드
      </Link>
      <Link to="/sample" className={`app-nav-btn ${location.pathname === "/sample" ? "active" : ""}`}>
        샘플 페이지
      </Link>
    </nav>
  );
}

export default function RootLayout() {
  const location = useLocation();

  const hideChromePaths = new Set([
    "/login",
    "/report",
    "/mobile-office",
    "/send-card",
    "/received-card",
    "/maintenance",
    "/green-apron",
    "/progress-status",
  ]);

  const hideChrome = hideChromePaths.has(location.pathname);

  return (
    <div className="app">
      <PageScrollReset />
      {!hideChrome && <AppNav />}

      <Outlet />

      {!hideChrome && <Footer />}
    </div>
  );
}
