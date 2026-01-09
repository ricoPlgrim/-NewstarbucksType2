import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import Typography from "../Typography/Typography";
import Button from "../Button/Button";
import Image from "../Image/Image";
import type { ButtonVariant } from "../Button/Button";
import "./Popup.scss";

// ✅ 팝업 공통 스크롤 락 (중첩 안전)
let POPUP_LOCK_COUNT = 0;
let POPUP_SAVED_SCROLL_Y = 0;

function lockPageScroll() {
  if (typeof window === "undefined") return;

  POPUP_LOCK_COUNT += 1;
  if (POPUP_LOCK_COUNT > 1) return;

  const html = document.documentElement;
  const body = document.body;

  POPUP_SAVED_SCROLL_Y = window.scrollY;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  body.style.position = "fixed";
  body.style.top = `-${POPUP_SAVED_SCROLL_Y}px`;
  body.style.width = "100%";
}

function unlockPageScroll() {
  if (typeof window === "undefined") return;

  POPUP_LOCK_COUNT = Math.max(0, POPUP_LOCK_COUNT - 1);
  if (POPUP_LOCK_COUNT > 0) return;

  const html = document.documentElement;
  const body = document.body;

  html.style.overflow = "";
  body.style.overflow = "";

  body.style.position = "";
  body.style.top = "";
  body.style.width = "";

  window.scrollTo(0, POPUP_SAVED_SCROLL_Y);
}

type PopupAction = {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
};

type BasicPopupProps = {
  open: boolean;
  onClose?: () => void;
  icon?: string;
  images?: string[];
  title?: string;
  description?: string;
  actions?: PopupAction[];
};

export function BasicPopup({
  open,
  onClose,
  icon = "🔒",
  images = [],
  title,
  description,
  actions = [],
}: BasicPopupProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  if (!open) return null;

  const shouldUseSwiper = images && images.length > 1;

  const handleOverlayClick = () => onClose?.();
  const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div
        className={`popup popup--basic ${shouldUseSwiper ? "" : "popup--no-swiper"}`}
        onClick={handlePopupClick}
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} 팝업` : "기본 팝업"}
      >
        {images && images.length > 0 ? (
          <div className="popup__image">
            {shouldUseSwiper ? (
              <div className="popup__image-carousel">
                <Swiper
                  onSwiper={(swiper: SwiperType) => {
                    swiperRef.current = swiper;
                  }}
                  onSlideChange={(swiper: SwiperType) => {
                    setCurrentIndex(swiper.realIndex);
                  }}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={images.length > 2}
                  className="popup__swiper"
                >
                  {images.map((imageUrl, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="popup__image-wrapper">
                        <img
                          src={imageUrl}
                          alt={`${title || "팝업"} 이미지 ${idx + 1}`}
                          className="popup__image-element"
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <button
                  type="button"
                  className="popup__nav-button popup__nav-button--prev"
                  onClick={handlePrev}
                  aria-label="이전 이미지"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="popup__nav-button popup__nav-button--next"
                  onClick={handleNext}
                  aria-label="다음 이미지"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="popup__image-wrapper">
                <Image src={images[0]} alt={title || "팝업 이미지"} className="popup__image-element" />
              </div>
            )}
          </div>
        ) : (
          <div className="popup__image">
            <span className="popup__image-icon">{icon}</span>
          </div>
        )}

        <div className="popup__body popup__body--center">
          <Typography variant="h4" size="small">
            {title}
          </Typography>
          <Typography variant="body" size="small" color="muted">
            {description}
          </Typography>
        </div>

        <div className="popup__actions popup__actions--stack">
          {actions.map((action, idx) => (
            <Button key={idx} variant={action.variant ?? "ghost"} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * BottomSheetPopup (✅ 드래그 닫기 제거 버전)
 */
export function BottomSheetPopup({
  open,
  onClose,
  title,
  description,
  options = [],
  content,
  className = "",
  topIcon,                
  showCloseButton = true, 
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  options?: Array<{ icon?: string; label: string; onClick?: () => void }>;
  content?: ReactNode;
  className?: string;
  topIcon?: ReactNode;           
  showCloseButton?: boolean;     
}) {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [popupHeight, setPopupHeight] = useState(0);
  const [offset, setOffset] = useState<number>(() => (typeof window !== "undefined" ? window.innerHeight : 0));
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  const measureHeight = () => {
    const el = popupRef.current;
    if (!el) return;
    setPopupHeight(el.offsetHeight);
  };

  useEffect(() => {
    if (open) {
      setIsClosing(false);

      const initialOffset = typeof window !== "undefined" ? window.innerHeight : 0;
      setOffset(initialOffset);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureHeight();
          setOffset(0);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onResize = () => measureHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeWithAnimation = () => {
    if (isClosing) return;

    const h =
      popupRef.current?.offsetHeight ||
      popupHeight ||
      (typeof window !== "undefined" ? window.innerHeight : 0);

    setIsClosing(true);
    setOffset(h);

    setTimeout(() => {
      onClose?.();
      setOffset(typeof window !== "undefined" ? window.innerHeight : 0);
      setIsClosing(false);
    }, 300);
  };

  const shouldRender =
    open ||
    isClosing ||
    (typeof window !== "undefined" && offset !== window.innerHeight);

  if (!shouldRender) return null;

  const hasHeader = !!title || !!description || (options?.length ?? 0) > 0;

  return (
    <div
      className={`popup-overlay popup-overlay--sheet ${!open && !isClosing ? "popup-overlay--hidden" : ""}`}
      onClick={closeWithAnimation}
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <div
        ref={popupRef}
        className={`popup popup--sheet ${className}`.trim()}
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} 바텀시트` : "바텀시트"}
      >
        {/* ✅ 우측 상단 X 버튼 */}
        {showCloseButton && (
          <button
            type="button"
            className="popup--sheet-close"
            aria-label="닫기"
            onClick={(e) => {
              e.stopPropagation();
              closeWithAnimation();
            }}
          >
            ✕
          </button>
        )}

        {/* ✅ 시안처럼: 아이콘 + 중앙 텍스트 */}
        {(topIcon || title || description) && (
          <div className="popup--sheet-notice">
            {topIcon && <div className="popup--sheet-notice-icon">{topIcon}</div>}

            {title && (
              <Typography variant="h4" size="small" className="popup--sheet-notice-title">
                {title}
              </Typography>
            )}

            {description && (
              <Typography variant="body" size="small" color="muted" className="popup__sheet-notice-desc">
                {description}
              </Typography>
            )}
          </div>
        )}

        {/* ✅ 기존 옵션/컨텐츠는 그대로 (필요하면 안내형에서는 안 쓰면 됨) */}
        {options.length > 0 && (
          <div className="popup__options">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                className="popup__option-item"
                onClick={() => {
                  option.onClick?.();
                  closeWithAnimation();
                }}
              >
                {option.icon && <span className="popup__option-icon">{option.icon}</span>}
                <span className="popup__option-label">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {content && <div className="popup__content">{content}</div>}
      </div>
    </div>
  );
}

/**
 * TopSheetPopup (✅ 상단에서 내려오는 메뉴형 TopSheet)
 */

type TopSheetItem = {
  icon?: ReactNode;
  label?: string;   // ✅ Header가 label 쓰는 경우
  title?: string;   // ✅ 기존 코드가 title 쓰는 경우
  onClick?: () => void;
  disabled?: boolean;
};

export function TopSheetPopup({
  open,
  onClose,
  items = [],
  className = "",
  closeButton = true,
}: {
  open: boolean;
  onClose: () => void;
  items?: Array<TopSheetItem>;
  className?: string;
  closeButton?: boolean;
}) {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [popupHeight, setPopupHeight] = useState(0);
  const [offset, setOffset] = useState<number>(() =>
    typeof window !== "undefined" ? -(window.innerHeight || 0) : 0
  );
  const [isClosing, setIsClosing] = useState(false);
  const [isCloseBtnVisible, setIsCloseBtnVisible] = useState(true);

  //x버튼 표시 여부
  useEffect(() => {
    if (open) setIsCloseBtnVisible(true);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  const measureHeight = () => {
    const el = popupRef.current;
    if (!el) return;
    setPopupHeight(el.offsetHeight);
  };

  useEffect(() => {
    if (open) {
      setIsClosing(false);
      const initialOffset = typeof window !== "undefined" ? -(window.innerHeight || 0) : 0;
      setOffset(initialOffset);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureHeight();
          setOffset(0);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onResize = () => measureHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeWithAnimation = () => {
    if (isClosing) return;

    const h =
      popupRef.current?.offsetHeight ||
      popupHeight ||
      (typeof window !== "undefined" ? window.innerHeight : 0);

    setIsClosing(true);
    setOffset(-h);

    setTimeout(() => {
      onClose?.();
      setOffset(typeof window !== "undefined" ? -(window.innerHeight || 0) : 0);
      setIsClosing(false);
    }, 250);
  };

  const shouldRender =
    open ||
    isClosing ||
    (typeof window !== "undefined" && offset !== -(window.innerHeight || 0));

  if (!shouldRender) return null;

  return (
    <div
      className={`popup-overlay popup-overlay--top ${!open && !isClosing ? "popup-overlay--hidden" : ""}`}
      onClick={closeWithAnimation}
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        ref={popupRef}
        className={`popup popup--top ${className}`.trim()}
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="탑시트 메뉴"
      >
        {closeButton && isCloseBtnVisible && (
          <button
            type="button"
            className="popup__floating-close"
            aria-label="닫기"
            onClick={(e) => {
              e.stopPropagation();
              setIsCloseBtnVisible(false);
              closeWithAnimation();
            }}
          >
            ✕
          </button>
        )}
        <div className="popup__top-menu">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="popup__top-menu-item"
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                closeWithAnimation();
              }}
            >
              <span className="popup__top-menu-icon" aria-hidden="true">
                {item.icon ?? (
                  <span className="popup__top-menu-icon-fallback" aria-hidden="true" />
                )}
              </span>
              <span className="popup__top-menu-title">{item.title ?? item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * FullscreenPopup 컴포넌트
 */
export function FullscreenPopup({
  open,
  onClose,
  title,
  body,
  description,
  showHeaderClose = true,
  showBottomClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: ReactNode;
  description?: string;
  showHeaderClose?: boolean;
  showBottomClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  if (!open) return null;

  return (
    <div className="popup-overlay popup-overlay--full">
      <div className="popup popup--full" role="dialog" aria-modal="true" aria-label={title}>
        <div className="popup__header">
          <Typography variant="h4" size="small">
            {title}
          </Typography>
          {showHeaderClose && (
            <button className="popup__close" onClick={onClose} aria-label="닫기" type="button">
              ✕
            </button>
          )}
        </div>

        <div className="popup__body">
          {description && (
            <Typography variant="body" size="small" color="muted">
              {description}
            </Typography>
          )}
          {body}
        </div>

        {showBottomClose && (
          <div className="popup__actions popup__actions--stack">
            <Button variant="primary" onClick={onClose}>
              닫기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
