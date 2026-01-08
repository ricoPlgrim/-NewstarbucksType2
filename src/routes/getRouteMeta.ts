// src/routes/getRouteMeta.ts
import { matchPath } from "react-router-dom";
import { routeMetaMap } from "./routeMeta";
import type { RouteMeta } from "../types/layout";

const DEFAULT_META: RouteMeta = {
  headerType: "main",
  headerProps: {},
};

function normalizeMeta(meta: RouteMeta): RouteMeta {
  // ✅ headerType(판별자) 유지한 채로 headerProps만 기본값 보정
  if (meta.headerType === "main") {
    return {
      headerType: "main",
      headerProps: {
        ...(meta.headerProps ?? {}),
      },
      headerTopSheetOptions: meta.headerTopSheetOptions,
    };
  }

  if (meta.headerType === "sub") {
    return {
      headerType: "sub",
      onBackTarget: meta.onBackTarget,
      headerProps: {
        ...(meta.headerProps ?? {}),
      },
      headerTopSheetOptions: meta.headerTopSheetOptions,
    };
  }

  // none
  return { headerType: "none" };
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
