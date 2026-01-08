import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "./Tabs.scss";
import type { ReactNode } from "react";

type TabsType = "scroll" | "swiper" | "line";

type TabItem = {
  id: string;
  label: string;
  description?: ReactNode;
  contentId?: string;
};

type TabsProps = {
  items?: TabItem[];
  type?: TabsType;

  /**
   * scroll 타입에서만 사용(부모에 id를 부여해서 컨테이너 찾기)
   * - line 타입은 Tabs 내부 컨테이너(ref)로 스크롤 처리
   */
  scrollContainerId?: string;

  className?: string;
  showContent?: boolean;

  /** controlled mode */
  activeTabId?: string;
  onChange?: (activeTabId: string) => void;
};

const defaultTabItems: TabItem[] = [
  { id: "detail", label: "상세", description: "상품 이미지, 설명, 원두 정보 등을 제공합니다." },
  { id: "review", label: "리뷰", description: "구매자 후기와 평점을 정렬/필터링하여 보여줍니다." },
  { id: "qa", label: "Q&A", description: "자주 묻는 질문과 답변을 탭 안에서 바로 확인할 수 있습니다." },
];

function Tabs({
  items = defaultTabItems,
  type = "scroll", // ✅ 기본값: scroll
  scrollContainerId,
  onChange,
  className = "",
  showContent = true,
  activeTabId,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(items[0]?.id ?? "");

  const swiperRef = useRef<any>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ✅ line 전용
  const lineContainerRef = useRef<HTMLDivElement | null>(null);
  const [lineStyle, setLineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  /**
   * ✅ 외부 제어(activeTabId) 지원 + items 변경 대응
   */
  useEffect(() => {
    const firstId = items[0]?.id ?? "";
    if (!firstId) return;

    if (activeTabId) {
      const exists = items.some((it) => it.id === activeTabId);
      setActiveTab(exists ? activeTabId : firstId);
      return;
    }

    const exists = items.some((it) => it.id === activeTab);
    if (!exists) setActiveTab(firstId);
  }, [items, activeTabId]);

  /**
   * ✅ scroll/line: activeTab 중앙 정렬 스크롤
   */
  const scrollToActiveTab = (itemId: string) => {
    if (type !== "scroll" && type !== "line") return;

    requestAnimationFrame(() => {
      const targetElement = tabRefs.current[itemId];
      if (!targetElement) return;

      let container: HTMLElement | null = null;

      // scroll 타입: 외부 id로 찾기
      if (type === "scroll") {
        if (!scrollContainerId) return;

        container = document.getElementById(scrollContainerId);

        // 외부 컨테이너일 경우 내부 .tabs__scroll-container 탐색
        if (container && !container.classList.contains("tabs__scroll-container")) {
          container = container.querySelector(".tabs__scroll-container");
        }

        // 그래도 못 찾으면 주변에서 탐색
        if (!container) {
          container =
            targetElement.closest(".tabs--scroll")?.querySelector(".tabs__scroll-container") ?? null;
        }
      }

      // line 타입: 내부 ref 컨테이너 사용
      if (type === "line") {
        container = lineContainerRef.current;
      }

      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      const targetScrollLeft = Math.max(
        0,
        container.scrollLeft +
          targetRect.left -
          containerRect.left -
          containerRect.width / 2 +
          targetRect.width / 2
      );

      const startScrollLeft = container.scrollLeft;
      const distance = targetScrollLeft - startScrollLeft;
      const duration = 300;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        container!.scrollLeft = startScrollLeft + distance * easeOutCubic;

        if (progress < 1) requestAnimationFrame(animateScroll);
      };

      requestAnimationFrame(animateScroll);
    });
  };

  /**
   * ✅ line: underline 위치 계산
   */
  const updateLineIndicator = (tabId: string) => {
    if (type !== "line") return;

    requestAnimationFrame(() => {
      const container = lineContainerRef.current;
      const btn = tabRefs.current[tabId];
      if (!container || !btn) return;

      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      const left = btnRect.left - containerRect.left + container.scrollLeft;
      const width = btnRect.width;

      setLineStyle({ left, width });
    });
  };

  // ✅ activeTab 바뀔 때 scroll/line 중앙 정렬
  useEffect(() => {
    if ((type === "scroll" || type === "line") && activeTab) {
      scrollToActiveTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeTab]);

  // ✅ line일 때만 indicator 동기화 + 리사이즈 대응
  useEffect(() => {
    if (type === "line" && activeTab) updateLineIndicator(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeTab, items]);

  useEffect(() => {
    if (type !== "line") return;

    const onResize = () => updateLineIndicator(activeTab);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeTab]);

  if (!items || items.length === 0) {
    return <div className="tabs-demo__empty">탭 데이터가 없습니다.</div>;
  }

  const handleTabClick = (itemId: string, index?: number) => {
    setActiveTab(itemId);
    onChange?.(itemId);

    if (type === "scroll") {
      scrollToActiveTab(itemId);
    } else if (type === "line") {
      scrollToActiveTab(itemId);
      updateLineIndicator(itemId);
    } else if (type === "swiper" && swiperRef.current) {
      const nextIndex =
        typeof index === "number" ? index : items.findIndex((item) => item.id === itemId);
      if (nextIndex >= 0) swiperRef.current.slideTo(nextIndex, 300);
    }
  };

  const activeItem = items.find((item) => item.id === activeTab);

  // ✅ Swiper 타입
  if (type === "swiper") {
    return (
      <div className={`tabs tabs--swiper ${className}`}>
        <div className="tabs__wrapper">
          <Swiper
            modules={[FreeMode]}
            freeMode={{ enabled: true, sticky: false }}
            slidesPerView="auto"
            spaceBetween={8}
            centeredSlides={true}
            centeredSlidesBounds={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              const realIndex = swiper.realIndex;
              if (items[realIndex] && activeTab !== items[realIndex].id) {
                setActiveTab(items[realIndex].id);
                onChange?.(items[realIndex].id);
              }
            }}
            className="tabs__swiper"
          >
            {items.map((item, index) => (
              <SwiperSlide key={item.id} className="tabs__slide">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === item.id}
                  onClick={() => handleTabClick(item.id, index)}
                  className={`tabs__button ${activeTab === item.id ? "is-active" : ""}`}
                >
                  {item.label}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {showContent && activeItem && (
          <div className="tabs__tabpanel" role="tabpanel" aria-live="polite" aria-label={`${activeItem.label} 탭 내용`}>
            {activeItem.description ?? "내용이 없습니다."}
          </div>
        )}
      </div>
    );
  }

  // ✅ Line 타입
  if (type === "line") {
    return (
      <div className={`tabs tabs--line ${className}`}>
        <div className="tabs__scroll-container" ref={lineContainerRef}>
          <div className="tabs__tablist" role="tablist" aria-label="라인 탭 메뉴">
            {items.map((item, index) => (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[item.id] = el;
                }}
                type="button"
                role="tab"
                aria-selected={activeTab === item.id}
                onClick={() => handleTabClick(item.id, index)}
                className={`tabs__button ${activeTab === item.id ? "is-active" : ""}`}
              >
                {item.label}
              </button>
            ))}

            <span
              className="tabs__indicator"
              aria-hidden="true"
              style={{
                transform: `translateX(${lineStyle.left}px)`,
                width: `${lineStyle.width}px`,
              }}
            />
          </div>
        </div>

        {showContent && activeItem && (
          <div className="tabs__tabpanel" role="tabpanel">
            {activeItem.description ?? "내용이 없습니다."}
          </div>
        )}
      </div>
    );
  }

  // ✅ Scroll 타입 (기본)
  return (
    <div className={`tabs tabs--scroll ${className}`}>
      <div className="tabs__scroll-container" id={scrollContainerId || undefined}>
        <div className="tabs__tablist" role="tablist" aria-label="스크롤 탭 메뉴">
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[item.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={activeTab === item.id}
              onClick={() => handleTabClick(item.id, index)}
              className={`tabs__button ${activeTab === item.id ? "is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {showContent && activeItem && (
        <div className="tabs__tabpanel" role="tabpanel" aria-live="polite" aria-label={`${activeItem.label} 탭 내용`}>
          {activeItem.description ?? "내용이 없습니다."}
        </div>
      )}
    </div>
  );
}

export default Tabs;
