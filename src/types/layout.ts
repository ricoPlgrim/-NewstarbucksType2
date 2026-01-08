// src/types/layout.ts
import type { ReactNode } from "react";

/** Header */
export type HeaderType = "main" | "sub" | "none";

/** ✅ routeMeta에 저장되는 정적 옵션 (데이터만) */
export type HeaderTopSheetOptionMeta = {
  icon?: string;     // ✅ 예: "🔒" 또는 아이콘 키
  label: string;     // ✅ 표시 텍스트
  target?: string;   // ✅ 이동 경로
  disabled?: boolean;
};

/** ✅ 실제 컴포넌트에서 쓰는 동적 옵션 */
export type HeaderTopSheetOption = {
  icon?: ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
};


/** ✅ Main Header 전용 props */
export type HeaderMainProps = {
  notificationCount?: number;
  notificationTarget?: string; // ✅ routeMeta에서 관리
  sticky?: boolean;
};

/** ✅ Sub Header 전용 props */
export type HeaderSubProps = {
  categoryName?: string;
  showUtilities?: boolean;
  showMoreButton?: boolean;
  sticky?: boolean;
};


export type RouteMeta =
  | {
      headerType: "main";
      headerProps?: HeaderMainProps;
      headerTopSheetOptions?: HeaderTopSheetOptionMeta[];
      onBackTarget?: never;
    }
  | {
      headerType: "sub";
      headerProps?: HeaderSubProps;
      onBackTarget?: string;
      headerTopSheetOptions?: HeaderTopSheetOptionMeta[];
    }
  | {
      headerType: "none";
      headerProps?: never;
      onBackTarget?: never;
      headerTopSheetOptions?: never;
    };
