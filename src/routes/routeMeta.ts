// src/routes/routeMeta.ts
import type { RouteMeta } from "../types/layout";

export type HeaderBottomSheetOptionMeta = {
  icon?: string;
  label: string;
  target?: string;
};

export type RouteMetaItem = {
  pattern: string;
  meta: RouteMeta & {
    headerBottomSheetOptions?: HeaderBottomSheetOptionMeta[];
  };
};

export const routeMetaMap: RouteMetaItem[] = [
  { pattern: "/detail/:id", meta: { headerType: "sub", onBackTarget: "/", headerProps: {} } },
  { pattern: "/detail/*", meta: { headerType: "sub", onBackTarget: "/", headerProps: {} } },

  { pattern: "/", meta: { headerType: "none" } },
  { pattern: "/login", meta: { headerType: "none" } },
  { pattern: "/guide", meta: { headerType: "none" } },

  {
    pattern: "/green-apron",
    meta: {
      headerType: "main",
      headerProps: {
        notificationCount: 3,
        notificationTarget: "/green-apron/notification",
        sticky: true,
      },
      headerBottomSheetOptions: [
        { label: "메뉴A", target: "/menu-a" },
        { label: "메뉴B", target: "/menu-b" },
      ],
    },
  },
];
