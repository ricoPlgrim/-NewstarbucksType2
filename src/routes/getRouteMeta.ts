// src/routes/getRouteMeta.ts
import { matchPath } from "react-router-dom";
import { routeMetaMap } from "./routeMeta";
import type { RouteMeta } from "../types/layout";

const DEFAULT_META: RouteMeta = {
  headerType: "main",
  headerProps: {},
};

function normalizeMeta(meta: RouteMeta): RouteMeta {
  // ✅ meta를 그대로 유지하면서 headerProps만 기본값 보정
  if (meta.headerType === "main") {
    return {
      ...meta, // ✅ bottomDock 포함해서 다 유지됨
      headerProps: { ...(meta.headerProps ?? {}) },
    };
  }

  if (meta.headerType === "sub") {
    return {
      ...meta, // ✅ headerTopSheetOptions도 그대로, bottomDock은 타입상 never라 없겠지만 안전
      headerProps: { ...(meta.headerProps ?? {}) },
    };
  }

  return meta; // {headerType:"none"} 그대로
}

export function getRouteMeta(pathname: string): RouteMeta {
  for (const item of routeMetaMap) {
    const matched = matchPath(
      { path: item.pattern, end: item.pattern === "/" },
      pathname
    );
    if (matched) return normalizeMeta(item.meta);
  }
  return DEFAULT_META;
}
