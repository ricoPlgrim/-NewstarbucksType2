// src/layouts/RootLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import { getRouteMeta } from "../routes/getRouteMeta";
import type {
  HeaderBottomSheetOptionMeta,
} from "../types/layout";

export default function RootLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const meta = getRouteMeta(pathname);

  // ✅ bottomSheetOptions meta → 실제 options로 변환
  const bottomSheetOptions =
  meta.headerBottomSheetOptions?.map(({ target, ...rest }) => ({
    ...rest,
    onClick: target ? () => navigate(target) : undefined,
  }));

  // ✅ 헤더가 없는 페이지
  if (meta.headerType === "none") {
    return (
      <div className="layout">
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    );
  }

  // ✅ main 헤더
  if (meta.headerType === "main") {
    const mainProps = meta.headerProps ?? {};

    // notificationTarget이 있을 때만 navigate 실행
    const onNotificationClick = mainProps.notificationTarget
      ? () => navigate(mainProps.notificationTarget!)
      : undefined;

    const headerProps = {
      ...mainProps,
      ...(bottomSheetOptions ? { bottomSheetOptions } : {}),
      onNotificationClick,
    };

    return (
      <div className="layout">
        <Header variant="main" {...headerProps} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    );
  }

  // ✅ sub 헤더
  const subProps = meta.headerProps ?? {};

  const backTarget = meta.onBackTarget; // string | undefined
  const onBack = backTarget ? () => navigate(backTarget) : undefined;

  const headerProps = {
    ...subProps,
    ...(bottomSheetOptions ? { bottomSheetOptions } : {}),
    onBack,
  };

  return (
    <div className="layout">
      <Header variant="sub" {...headerProps} />
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}
