// src/types/layout.ts
import type { ReactNode } from "react";

/** Header */
export type HeaderType = "main" | "sub" | "none";

/** BottomSheet */
export type HeaderBottomSheetOptionMeta = {
  icon?: string;
  label: string;
  target?: string;
};


/** ✅ Main Header 전용 props */
export type HeaderMainProps = {
  notificationCount?: number;
  notificationTarget?: string; // ✅ routeMeta에서 관리
};

/** ✅ Sub Header 전용 props */
export type HeaderSubProps = {
  categoryName?: string;
  showUtilities?: boolean;
  showMoreButton?: boolean;
};



export type RouteMeta =
  | {
      headerType: "main";
      headerProps?: HeaderMainProps;
      headerBottomSheetOptions?: HeaderBottomSheetOptionMeta[];
      onBackTarget?: never;
    }
  | {
      headerType: "sub";
      headerProps?: HeaderSubProps;
      onBackTarget?: string;
      headerBottomSheetOptions?: HeaderBottomSheetOptionMeta[];
    }
  | {
      headerType: "none";
      headerProps?: never;
      onBackTarget?: never;
      headerBottomSheetOptions?: never;
    };
