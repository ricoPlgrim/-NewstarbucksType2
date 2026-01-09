import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import BottomDock from "../components/BottomDock/BottomDock";
import { getRouteMeta } from "../routes/getRouteMeta";
import type { HeaderTopSheetOption } from "../types/layout";

export default function RootLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const meta = getRouteMeta(pathname);


  const topSheetOptions: HeaderTopSheetOption[] | undefined =
    meta.headerTopSheetOptions?.map((o) => {
      const target = o.target;
      return {
        title: o.label,
        icon: o.icon ? <span>{o.icon}</span> : undefined,
        disabled: o.disabled,
        onClick: target ? () => { navigate(target); } : undefined,
      };
    });

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

  // ✅ main 헤더 (BottomDock 사용)
  if (meta.headerType === "main") {
    const mainProps = meta.headerProps ?? {};
    const dock = meta.bottomDock;
    const notificationTarget = mainProps.notificationTarget;

    const onNotificationClick = notificationTarget
      ? () => { navigate(notificationTarget); }
      : undefined;


    const headerProps = {
      ...mainProps,
      ...(topSheetOptions ? { topSheetOptions } : {}),
      onNotificationClick,
    };

    // ✅ BottomDock item icon은 ReactNode니까 그대로 써도 됨(문자/이모지 OK)
    const dockItems = dock?.items?.map((it) => ({
      key: it.key,
      label: it.label,
      icon: it.icon,
    }));

    const defaultActiveIndex =
    dock?.items?.findIndex((it) => it.active) ?? -1;

    const resolvedDefaultActiveIndex =
    defaultActiveIndex >= 0 ? defaultActiveIndex : undefined;


    return (
      <div className="layout">
        <Header variant="main" {...headerProps} />

        <main className="layout__content">
          <Outlet />
        </main>

        {dock?.show && dockItems && (
          <BottomDock
            items={dockItems}
            defaultActiveIndex={resolvedDefaultActiveIndex}
            onChange={(key) => {
              const target = dock.items?.find((x) => x.key === key)?.target;
              if (target) void navigate(target);
            }}
          />
        )}
      </div>
    );
  }

  // ✅ sub 헤더 (BottomDock 사용안함)
  const subProps = meta.headerProps ?? {};
  const onBackTarget = meta.onBackTarget;

  const onBack = onBackTarget
    ? () => { navigate(onBackTarget); }
    : undefined;

  const headerProps = {
    ...subProps,
    ...(topSheetOptions ? { topSheetOptions } : {}),
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
