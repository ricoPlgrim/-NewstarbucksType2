import type { ReactNode } from "react";
import type { BottomDockItem } from "../components/BottomDock/BottomDock";

/** BottomDock - routeMeta(정적)용 */
export type BottomDockItemMeta = {
  key: string;
  label: string;
  icon?: string;      // ✅ meta에서는 string으로
  target?: string;    // ✅ 눌렀을 때 이동할 경로
  active?: boolean;    // ✅ 현재 활성화된 아이템
};

export type BottomDockMeta = {
  show: boolean;
  items?: BottomDockItemMeta[];   // ✅ 여기! BottomDockItem 쓰지 말기
};

/** Header */
export type HeaderType = "main" | "sub" | "none";

/** routeMeta에 저장되는 정적 옵션 */
export type HeaderTopSheetOptionMeta = {
  icon?: string;
  label: string;
  target?: string;
  disabled?: boolean;
};

/** 컴포넌트에서 쓰는 동적 옵션 */
export type HeaderTopSheetOption = {
  icon?: ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
};

/** Main Header 전용 props */
export type HeaderMainProps = {
  notificationCount?: number;
  notificationTarget?: string;
  sticky?: boolean;
};

/** Sub Header 전용 props */
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
      bottomDock?: BottomDockMeta;   // ✅ main에서만 허용
      onBackTarget?: never;
    }
  | {
      headerType: "sub";
      headerProps?: HeaderSubProps;
      onBackTarget?: string;
      headerTopSheetOptions?: HeaderTopSheetOptionMeta[];
      bottomDock?: never;            // ✅ sub에서는 금지
    }
  | {
      headerType: "none";
      headerProps?: never;
      onBackTarget?: never;
      headerTopSheetOptions?: never;
      bottomDock?: never;            // ✅ none에서도 금지
    };
