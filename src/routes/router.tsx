// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "../layouts/RootLayout";
import Loading from "../components/Loading/Loading";

// ✅ 공통 loading 래퍼 컴포넌트 
const withSuspense = (el: React.ReactNode) => (
  <Suspense
    fallback={
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <Loading size={48} thickness={4} label="로딩 중..." />
      </div>
    }
  >
    {el}
  </Suspense>
);

// ✅ lazy pages
const PublishingUrlPage = lazy(() => import("../pages/PublishingUrlPage/PublishingUrlPage"));
const PublishingGuidePage = lazy(() => import("../pages/PublishingGuidePage/PublishingGuidePage"));
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const SearchSamplePage = lazy(() => import("../pages/SearchSamplePage/SearchSamplePage"));
const ReportPage = lazy(() => import("../pages/ReportPage/ReportPage"));
const MobileOfficeHomePage = lazy(() => import("../pages/MobileOfficeHomePage/MobileOfficeHomePage"));
const SendCardPage = lazy(() => import("../pages/SendCardPage/SendCardPage"));
const ReceivedCardPage = lazy(() => import("../pages/ReceivedCardPage/ReceivedCardPage"));
const MaintenancePage = lazy(() => import("../pages/MaintenancePage/MaintenancePage"));
const GreenApronCardPage = lazy(() => import("../pages/GreenApronCardPage/GreenApronCardPage"));
const ProgressStatusPage = lazy(() => import("../pages/ProgressStatusPage/ProgressStatusPage"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: withSuspense(<PublishingUrlPage />) },
      { path: "/url", element: withSuspense(<PublishingUrlPage />) },
      { path: "/guide", element: withSuspense(<PublishingGuidePage />) },
      { path: "/login", element: withSuspense(<LoginPage />) },
      { path: "/search-sample", element: withSuspense(<SearchSamplePage />) },

      { path: "/report", element: withSuspense(<ReportPage />) },
      { path: "/mobile-office", element: withSuspense(<MobileOfficeHomePage />) },
      { path: "/send-card", element: withSuspense(<SendCardPage />) },
      { path: "/received-card", element: withSuspense(<ReceivedCardPage />) },
      { path: "/maintenance", element: withSuspense(<MaintenancePage />) },
      { path: "/green-apron", element: withSuspense(<GreenApronCardPage />) },
      { path: "/progress-status", element: withSuspense(<ProgressStatusPage />) },
    ],
  },
]);
