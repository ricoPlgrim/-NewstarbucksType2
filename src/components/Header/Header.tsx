import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import Typography from "../Typography/Typography";
import Icon from "../Icon/Icon";
import { TopSheetPopup } from "../Popup/Popup";
import "./Header.scss";
import type { HeaderTopSheetOptionMeta } from "../../types/layout";

export type HeaderHandle = {
  toggleMenu: () => void;
  triggerLogoAction: () => void;
};

type HeaderVariant = "main" | "sub";

type HeaderProps = {
  /** 현재 선택된 페이지 (메인 헤더에서 사용) */
  currentPage?: string;
  /** 페이지 변경 시 실행할 함수 (메인 헤더에서 사용) */
  onPageChange?: (page: string) => void;

  /** 헤더 타입: "main" (메인 헤더) 또는 "sub" (서브 헤더) */
  variant?: HeaderVariant;

  /** 서브 헤더에 표시할 카테고리명 (서브 헤더에서 사용) */
  categoryName?: string;
  /** 뒤로가기 버튼 클릭 시 실행할 함수 (서브 헤더에서 사용) */
  onBack?: () => void;
  /** 장바구니 아이콘 클릭 시 실행할 함수 (서브 헤더에서 사용) */
  onCartClick?: () => void;
  /** 헤더 유틸리티 버튼 클릭 시 실행할 함수 (서브 헤더에서 사용) */
  onUtilityClick?: (key: string) => void;

  /** 헤더 고정 여부 (sticky) - 기본값: false */
  sticky?: boolean;
  /** 서브 헤더에서 유틸리티 버튼 표시 여부 - 기본값: true */
  showUtilities?: boolean;
  /** 더보기 버튼 표시 여부 - 기본값: true */
  showMoreButton?: boolean;

  // 메인 헤더 전용 props
  /** 알림 개수 (메인 헤더에서 사용) */
  notificationCount?: number;
  /** 로고 클릭 핸들러 (메인 헤더에서 사용) */
  onLogoClick?: () => void;
  /** 알림 클릭 핸들러 (메인 헤더에서 사용) */
  onNotificationClick?: () => void;
  /** 로고 텍스트 (메인 헤더에서 사용, 기본값: "스타벅스") */
  logoText?: string;
  /** 타이틀 텍스트 (메인 헤더에서 사용, 기본값: "MOBILE OFFICE") */
  titleText?: string;
  /** chevron 아이콘 표시 여부 (메인 헤더에서 사용, 기본값: true) */
  showChevron?: boolean;

  /** 로고 클릭 시 표시할 상단 팝업 옵션 (메인 헤더에서 사용) */
  topSheetOptions?: HeaderTopSheetOptionMeta[];
  /** 바텀 팝업 열림/닫힘 상태 변경 시 호출되는 콜백 (메인 헤더에서 사용) */
  onTopSheetOpenChange?: (isOpen: boolean) => void;
  /** 바텀 팝업에 적용할 커스텀 클래스명 (메인 헤더에서 사용, 기본값: "custom-bottom-sheet") */
  TopSheetClassName?: string;
};

// ------------------------------------
// ✅ Menu Types
// ------------------------------------
type Depth3Item = { id: string; label: string; href: string };

type SubmenuWithChildren = { id: string; label: string; children: Depth3Item[] };
type SubmenuWithHref = { id: string; label: string; href: string };

type SubmenuItem = SubmenuWithChildren | SubmenuWithHref;

type MenuNode = {
  id: string;
  label: string;
  children?: SubmenuItem[];
};

// ------------------------------------
// ✅ Type Guards 
// ------------------------------------
const hasChildren = (submenu: SubmenuItem): submenu is SubmenuWithChildren => {
  return "children" in submenu;
};

const hasHref = (submenu: SubmenuItem): submenu is SubmenuWithHref => {
  return "href" in submenu;
};

// ------------------------------------
// ✅ State / Ref Types
// ------------------------------------
type ExpandedMap = Record<string, boolean>;
type SubmenuRefs = Record<string, HTMLUListElement | null>;

// ------------------------------------
// GNB 메뉴 데이터 (3뎁스 구조)
// ------------------------------------
const gnbMenu = [
  {
    id: "menu1",
    label: "메뉴 1",
    children: [
      {
        id: "submenu1-1",
        label: "서브메뉴 1-1",
        children: [
          { id: "depth3-1-1", label: "3뎁스 1-1-1", href: "#" },
          { id: "depth3-1-2", label: "3뎁스 1-1-2", href: "#" },
        ],
      },
      {
        id: "submenu1-2",
        label: "서브메뉴 1-2",
        children: [
          { id: "depth3-1-3", label: "3뎁스 1-2-1", href: "#" },
          { id: "depth3-1-4", label: "3뎁스 1-2-2", href: "#" },
        ],
      },
    ],
  },
  {
    id: "menu2",
    label: "메뉴 2",
    children: [
      {
        id: "submenu2-1",
        label: "서브메뉴 2-1",
        children: [
          { id: "depth3-2-1", label: "3뎁스 2-1-1", href: "#" },
          { id: "depth3-2-2", label: "3뎁스 2-1-2", href: "#" },
        ],
      },
      {
        id: "submenu2-2",
        label: "서브메뉴 2-2",
        children: [{ id: "depth3-2-3", label: "3뎁스 2-2-1", href: "#" }],
      },
    ],
  },
  {
    id: "menu3",
    label: "메뉴 3",
    children: [
      { id: "submenu3-1", label: "서브메뉴 3-1", href: "#" },
      { id: "submenu3-2", label: "서브메뉴 3-2", href: "#" },
    ],
  },
] satisfies MenuNode[];

const Header = forwardRef<HeaderHandle, HeaderProps>(function Header(
  {
    currentPage,
    onPageChange,
    variant = "main",
    categoryName = "카테고리",
    onBack = () => {},
    onCartClick = () => {},
    onUtilityClick,
    sticky = false,
    showUtilities = true,
    showMoreButton = true,
    notificationCount = 0,
    onLogoClick,
    onNotificationClick,
    logoText = "스타벅스",
    titleText = "MOBILE OFFICE",
    showChevron = true,
    topSheetOptions,
    onTopSheetOpenChange,
    TopSheetClassName = "custom-bottom-sheet",
  }: HeaderProps,
  ref
) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<ExpandedMap>({});
  const [isTopSheetOpen, setIsTopSheetOpen] = useState(false);

  // 각 서브메뉴 DOM 참조 (2뎁스/3뎁스 아코디언)
  const submenuRefs = useRef<SubmenuRefs>({});

  // 최신 상태 추적용 ref
  const expandedItemsRef = useRef<ExpandedMap>({});
  const prevExpandedItemsRef = useRef<ExpandedMap>({});

  useEffect(() => {
    expandedItemsRef.current = expandedItems;
  }, [expandedItems]);

  /**
   * 부모 메뉴 ID 찾기 (3뎁스의 경우 1뎁스 ID 반환)
   */
  const findParentMenuId = useCallback((childId: string): string | null => {
    for (const menu of gnbMenu) {
      const hasChild = menu.children?.some((submenu) => submenu.id === childId);
      if (hasChild) return menu.id;
    }
    return null;
  }, []);

  /**
   * 햄버거 토글
   */
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  /**
   * 로고 클릭 동작
   */
  const triggerLogoAction = useCallback(() => {
    if (topSheetOptions && topSheetOptions.length > 0) {
      setIsTopSheetOpen(true);
      onTopSheetOpenChange?.(true);
    }
    onLogoClick?.();
  }, [topSheetOptions, onTopSheetOpenChange, onLogoClick]);

  useImperativeHandle(ref, () => ({ toggleMenu, triggerLogoAction }), [
    toggleMenu,
    triggerLogoAction,
  ]);

  /**
   * 2뎁스/3뎁스 토글
   */
  const toggleExpanded = useCallback((key: string, isMenu1Depth = false) => {
    setExpandedItems((prev) => {
      const newState: ExpandedMap = { ...prev };

      // 1뎁스 클릭 시: 다른 1뎁스 + 하위 닫기
      if (isMenu1Depth) {
        const menu1DepthKeys = gnbMenu.map((menu) => menu.id);

        menu1DepthKeys.forEach((menuId) => {
          if (menuId !== key) {
            delete newState[menuId];

            const menu = gnbMenu.find((m) => m.id === menuId);
            menu?.children?.forEach((submenu) => {
              delete newState[submenu.id];
            });
          }
        });
      }

      // 현재 토글
      newState[key] = !prev[key];

      // 1뎁스가 닫히면 하위도 닫기
      if (isMenu1Depth && !newState[key]) {
        const menu = gnbMenu.find((m) => m.id === key);
        menu?.children?.forEach((submenu) => delete newState[submenu.id]);
      }

      expandedItemsRef.current = newState;
      return newState;
    });
  }, []);

  /**
   * 메뉴 닫기
   */
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setExpandedItems({});
  }, []);

  /**
   * 단일 메뉴 정확한 높이 측정
   */
  const measureHeight = useCallback((el: HTMLUListElement | null): number => {
    if (!el) return 0;

    const originalMaxHeight = el.style.maxHeight;

    el.style.transition = "none";
    el.style.maxHeight = "9999px";
    void el.offsetHeight; // reflow
    const height = el.scrollHeight;

    el.style.maxHeight = originalMaxHeight;
    return height;
  }, []);

  /**
   * 전체 높이 재계산
   */
  const recalculateAllHeights = useCallback(
    (expandedItemsState: ExpandedMap, prevExpandedItemsState: ExpandedMap = {}) => {
      // 닫혀있는 메뉴 0으로
      Object.keys(submenuRefs.current).forEach((key) => {
        const el = submenuRefs.current[key];
        if (el && !expandedItemsState[key]) {
          if (prevExpandedItemsState[key]) {
            el.style.removeProperty("transition");
            el.style.maxHeight = "0";
          } else {
            el.style.setProperty("transition", "none", "important");
            el.style.maxHeight = "0";
          }
        }
      });

      const depth3Keys: string[] = [];
      const depth2Keys: string[] = [];

      Object.keys(expandedItemsState).forEach((key) => {
        if (expandedItemsState[key]) {
          const parentId = findParentMenuId(key);
          if (parentId) depth3Keys.push(key);
          else depth2Keys.push(key);
        }
      });

      // 1) 3뎁스 먼저
      depth3Keys.forEach((key) => {
        const el = submenuRefs.current[key];
        if (!el) return;

        const wasClosed = !prevExpandedItemsState[key];
        if (wasClosed) {
          el.style.setProperty("transition", "none", "important");
          el.style.maxHeight = "0";
        } else {
          const h = measureHeight(el);
          el.style.removeProperty("transition");
          el.style.maxHeight = `${h}px`;
        }
      });

      // 2) 2뎁스
      depth2Keys.forEach((key) => {
        const el = submenuRefs.current[key];
        if (!el) return;

        const wasClosed = !prevExpandedItemsState[key];
        if (wasClosed) {
          el.style.setProperty("transition", "none", "important");
          el.style.maxHeight = "0";
        } else {
          const h = measureHeight(el);
          el.style.removeProperty("transition");
          el.style.maxHeight = `${h}px`;
        }
      });
    },
    [findParentMenuId, measureHeight]
  );

  /**
   * expandedItems 변경 시: DOM 업데이트 후 높이 계산 + 열림 애니메이션
   */
  useEffect(() => {
    let rafId1: number | null = null;
    let rafId2: number | null = null;
    let rafId3: number | null = null;
    let isCancelled = false;

    const prevExpandedItems = prevExpandedItemsRef.current;

    const updateHeights = () => {
      if (isCancelled) return;

      const currentExpandedItems = expandedItemsRef.current;

      // 1) 높이 재계산
      recalculateAllHeights(currentExpandedItems, prevExpandedItems);

      // 2) 다음 프레임: 열릴 때 애니메이션(3뎁스)
      rafId2 = requestAnimationFrame(() => {
        if (isCancelled) return;

        const latestExpandedItems = expandedItemsRef.current;

        Object.keys(latestExpandedItems).forEach((key) => {
          if (latestExpandedItems[key] && !prevExpandedItems[key]) {
            const parentId = findParentMenuId(key);
            if (!parentId) return; // 3뎁스만

            const el = submenuRefs.current[key];
            if (!el) return;

            const styleTransition = el.style.getPropertyValue("transition");
            const computedTransition = window.getComputedStyle(el).transition;

            if (
              styleTransition === "none" ||
              computedTransition === "none" ||
              computedTransition === "all 0s ease 0s"
            ) {
              const h = measureHeight(el);
              el.style.removeProperty("transition");
              el.style.maxHeight = `${h}px`;
            }
          }
        });

        // 3) 다음 프레임: 2뎁스 애니메이션 + 이미 열려있던 2뎁스 재계산
        rafId3 = requestAnimationFrame(() => {
          if (isCancelled) return;

          const finalExpandedItems = expandedItemsRef.current;

          // 2뎁스 열릴 때
          Object.keys(finalExpandedItems).forEach((key) => {
            if (finalExpandedItems[key] && !prevExpandedItems[key]) {
              const parentId = findParentMenuId(key);
              if (parentId) return; // 2뎁스만

              const el = submenuRefs.current[key];
              if (!el) return;

              const styleTransition = el.style.getPropertyValue("transition");
              const computedTransition = window.getComputedStyle(el).transition;

              if (
                styleTransition === "none" ||
                computedTransition === "none" ||
                computedTransition === "all 0s ease 0s"
              ) {
                const h = measureHeight(el);
                el.style.removeProperty("transition");
                el.style.maxHeight = `${h}px`;
              }
            }
          });

          // 이미 열려있던 2뎁스 높이 재계산(3뎁스 열림 반영)
          Object.keys(finalExpandedItems).forEach((key) => {
            if (finalExpandedItems[key] && prevExpandedItems[key]) {
              const parentId = findParentMenuId(key);
              if (parentId) return; // 2뎁스만

              const el = submenuRefs.current[key];
              if (!el) return;

              const h = measureHeight(el);
              el.style.removeProperty("transition");
              el.style.maxHeight = `${h}px`;
            }
          });
        });
      });
    };

    rafId1 = requestAnimationFrame(() => {
      requestAnimationFrame(updateHeights);
    });

    prevExpandedItemsRef.current = { ...expandedItems };

    return () => {
      isCancelled = true;
      if (rafId1 !== null) cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
      if (rafId3 !== null) cancelAnimationFrame(rafId3);
    };
  }, [expandedItems, findParentMenuId, measureHeight, recalculateAllHeights]);

  // -----------------------------
  // Sub Header
  // -----------------------------
  if (variant === "sub") {
    return (
      <header className={`header header--sub${sticky ? " header--sticky" : ""}`}>
        <div className="header__inner header__inner--sub">
          <button className="header__back" onClick={onBack} aria-label="뒤로가기">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <Typography variant="h5" size="small" className="header__category">
            {categoryName}
          </Typography>

          {showUtilities && (
            <div className="header__utilities">
              <button className="header__utility-btn" onClick={onCartClick} aria-label="장바구니">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19C19.5304 16 20.0391 15.7893 20.4142 15.4142C20.7893 15.0391 21 14.5304 21 14V6H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                className="header__utility-btn"
                onClick={() => onUtilityClick?.("search")}
                aria-label="검색"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {showMoreButton && (
                <button
                  className="header__utility-btn"
                  onClick={() => onUtilityClick?.("more")}
                  aria-label="더보기"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="19" cy="12" r="1" fill="currentColor" />
                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }

  // -----------------------------
  // Main Header
  // -----------------------------
  return (
    <header className={`header${sticky ? " header--sticky" : ""}`}>
      <div className="header__inner">
        <button
          className={`header__hamburger ${isMenuOpen ? "is-active" : ""}`}
          onClick={toggleMenu}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <button
          className="header__logo-section"
          onClick={triggerLogoAction}
          aria-label={`${titleText} 메뉴 열기`}
        >
          <div className="header__logo">{logoText}</div>
          <div className="header__title">
            <Typography variant="h4" size="medium" weight="bold">
              {titleText}
            </Typography>

            {showChevron && (
              <Icon name="chevron-down" size="small">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Icon>
            )}
          </div>
        </button>

        {notificationCount !== undefined && (
          <button
            className="header__notification"
            onClick={onNotificationClick}
            aria-label={`알림 ${notificationCount > 0 ? notificationCount : 0}개`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {notificationCount > 0 && (
              <span className="header__notification-badge">{notificationCount}</span>
            )}
          </button>
        )}
      </div>

      {/* 모바일 사이드 메뉴 */}
      <aside className={`header__aside ${isMenuOpen ? "is-open" : ""}`}>
        <div className="header__aside-inner">
          <button className="header__aside-close" onClick={closeMenu} aria-label="메뉴 닫기">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <nav className="header__nav">
            <ul className="header__nav-list">
              {gnbMenu.map((menu) => (
                <li key={menu.id} className="header__nav-item header__nav-item--has-children">
                  <button
                    className="header__nav-link header__nav-link--expandable"
                    onClick={() => toggleExpanded(menu.id, true)}
                    aria-expanded={!!expandedItems[menu.id]}
                  >
                    {menu.label}
                    <span className="header__nav-arrow" aria-hidden="true">
                      <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.5 3L7.5 6L4.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {menu.children && (
                    <ul
                      ref={(el: HTMLUListElement | null) => {
                        submenuRefs.current[menu.id] = el;
                      }}
                      className={`header__nav-sublist ${expandedItems[menu.id] ? "is-open" : ""}`}
                    >
                      {menu.children.map((submenu) => (
                        <li key={submenu.id} className="header__nav-subitem">
                          {hasChildren(submenu) ? (
                            <>
                              <button
                                className="header__nav-sublink header__nav-sublink--expandable"
                                onClick={() => toggleExpanded(submenu.id)}
                                aria-expanded={!!expandedItems[submenu.id]}
                              >
                                {submenu.label}
                                <span className="header__nav-arrow" aria-hidden="true">
                                  <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M4.5 3L7.5 6L4.5 9"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </button>

                              <ul
                                ref={(el: HTMLUListElement | null) => {
                                  submenuRefs.current[submenu.id] = el;
                                }}
                                className={`header__nav-sublist header__nav-sublist--depth3 ${
                                  expandedItems[submenu.id] ? "is-open" : ""
                                }`}
                              >
                                {submenu.children.map((depth3: Depth3Item) => (
                                  <li key={depth3.id} className="header__nav-subitem">
                                    <a href={depth3.href} className="header__nav-sublink" onClick={closeMenu}>
                                      {depth3.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <a
                              href={submenu.href}
                              className="header__nav-sublink"
                              onClick={closeMenu}
                            >
                              {submenu.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {isMenuOpen && <div className="header__overlay" onClick={closeMenu} aria-hidden="true" />}

      {/* 탑 팝업 */}
      {topSheetOptions?.length ? (
        <TopSheetPopup
          open={isTopSheetOpen}
          onClose={() => { setIsTopSheetOpen(false); onTopSheetOpenChange?.(false); }}
          className={TopSheetClassName}
          items={topSheetOptions}
        />
      ) : null}
    </header>
  );
});

export default Header;
