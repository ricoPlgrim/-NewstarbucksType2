// src/routes/routeMeta.ts
import type { RouteMeta } from "../types/layout";

export type RouteMetaItem = {
  pattern: string;
  meta: RouteMeta;
};

export type HeaderBottomSheetOptionMeta = {
    icon?: string;
    label: string;
    target?: string;    
  };

export const routeMetaMap: RouteMetaItem[] = [
  { pattern: "/detail/:id", meta: { headerType: "sub", onBackTarget: "/", headerProps: {} } },
  { pattern: "/detail/*", meta: { headerType: "sub", onBackTarget: "/", headerProps: {} } },

  {
    pattern: "/",
    meta: {
      headerType: "main",
      headerProps: {
        notificationCount: 3,
        notificationTarget: "/green-apron/notification",
      },
      headerBottomSheetOptions: [
        { label: "메뉴A", target: "/menu-a" },
        { label: "메뉴B", target: "/menu-b" },
      ],
    },
  },

  { pattern: "/login", meta: { headerType: "none" } },
];
