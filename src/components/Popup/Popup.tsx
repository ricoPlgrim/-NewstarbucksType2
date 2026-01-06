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

/**
 * BasicPopup 컴포넌트
 * 기본 팝업 형태의 모달 컴포넌트
 *
 * @param {boolean} open - 팝업 열림/닫힘 상태
 * @param {function} onClose - 팝업 닫기 핸들러
 * @param {string} icon - 아이콘 (이모지, 텍스트 등, 기본값: "🔒", images가 없을 때 사용)
 * @param {Array} images - 이미지 URL 배열 (선택, images가 있으면 icon 대신 이미지 캐러셀 표시)
 * @param {string} title - 팝업 제목
 * @param {string} description - 팝업 설명
 * @param {Array} actions - 액션 버튼 배열 [{ label, variant, onClick }]
 */

// ✅ 팝업 공통 스크롤 락 (중첩 안전)
let POPUP_LOCK_COUNT = 0;
let POPUP_SAVED_SCROLL_Y = 0;

function lockPageScroll() {
  if (typeof window === "undefined") return;

  POPUP_LOCK_COUNT += 1;
  if (POPUP_LOCK_COUNT > 1) return; // 이미 잠겨있으면 중복 작업 X

  const html = document.documentElement;
  const body = document.body;

  POPUP_SAVED_SCROLL_Y = window.scrollY;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  // iOS 튐/배경스크롤 방지 + 스크롤 위치 고정
  body.style.position = "fixed";
  body.style.top = `-${POPUP_SAVED_SCROLL_Y}px`;
  body.style.width = "100%";
}

function unlockPageScroll() {
  if (typeof window === "undefined") return;

  POPUP_LOCK_COUNT = Math.max(0, POPUP_LOCK_COUNT - 1);
  if (POPUP_LOCK_COUNT > 0) return; // 다른 팝업이 아직 열려있음

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
  
  //바디 스크롤막기기
  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  if (!open) return null;

  console.log("팝업 열림: BasicPopup", { title, description });

  const shouldUseSwiper = images && images.length > 1;

  const handleOverlayClick = () => {
    onClose?.();
  };

  const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };


  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className={`popup popup--basic ${shouldUseSwiper ? "" : "popup--no-swiper"}`} onClick={handlePopupClick}>
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
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="popup__nav-button popup__nav-button--next"
                  onClick={handleNext}
                  aria-label="다음 이미지"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
 * BottomSheetPopup 컴포넌트
 */
export function BottomSheetPopup({
  open,
  onClose,
  title,
  description,
  options = [],
  content,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  options?: Array<{ icon?: string; label: string; onClick?: () => void }>;
  content?: ReactNode; 
  className?: string;
}) {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [popupHeight, setPopupHeight] = useState(0);
  const [offset, setOffset] = useState<number>(() => window.innerHeight);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  //바디 스크롤막기
  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  // 최신 offset 트래킹
  const offsetRef = useRef<number>(window.innerHeight);

  // ✅ 드래그 관련: 핸들에서만 사용
  const startYRef = useRef<number | null>(null);
  const startOffsetRef = useRef<number>(0);

   // ✅ rAF 스로틀링
  const rafRef = useRef<number | null>(null);
  const pendingOffsetRef = useRef<number>(0);
 
  const applyOffset = (next: number) => {
    pendingOffsetRef.current = next;
 
    if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const v = pendingOffsetRef.current;
        setOffset(v);
        offsetRef.current = v;
     });
   };
   
   useEffect(() => {
     return () => {
       if (rafRef.current) cancelAnimationFrame(rafRef.current);
     };
   }, []);

  const measureHeight = () => {
    const el = popupRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setPopupHeight(h);
  };

  // 열릴 때: 아래에서 위로 애니메이션 + 높이 측정
  useEffect(() => {
    if (open) {
      setIsClosing(false);

      const initialOffset = window.innerHeight;
      setOffset(initialOffset);
      offsetRef.current = initialOffset;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureHeight();
          setOffset(0);
          offsetRef.current = 0;
        });
      });
    } else if (!open && !isClosing) {
      startYRef.current = null;
      setIsDragging(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 리사이즈(회전/주소창 변화) 대응
  useEffect(() => {
    const onResize = () => measureHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const threshold = popupHeight ? popupHeight * 0.5 : window.innerHeight * 0.25;

  const closeWithAnimation = () => {
    if (isClosing) return;

    const h = popupRef.current?.offsetHeight || popupHeight || window.innerHeight;
    setIsClosing(true);
    setIsDragging(false);

    setOffset(h);
    offsetRef.current = h;

    setTimeout(() => {
      onClose?.();
      // 다음 오픈을 위해 초기화
      setOffset(window.innerHeight);
      offsetRef.current = window.innerHeight;
      setIsClosing(false);
    }, 300);
  };

  // ✅ Pointer Events (끊김 방지: setPointerCapture)
  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isClosing) return;

    // 포인터가 밖으로 나가도 move 계속 잡힘
    e.currentTarget.setPointerCapture(e.pointerId);

    startYRef.current = e.clientY;
    startOffsetRef.current = offsetRef.current; // 보통 0
    setIsDragging(true);
  };
  
  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isClosing) return;
    if (!isDragging) return;
    if (startYRef.current == null) return;

    const delta = e.clientY - startYRef.current;
    const h = popupRef.current?.offsetHeight || popupHeight || window.innerHeight;

    const next = Math.max(0, Math.min(startOffsetRef.current + delta, h));

    // ✅ rAF로 프레임당 1번만 setOffset
    applyOffset(next);
  };

  
  const onHandlePointerUp = () => {
    if (isClosing) return;
    if (!isDragging) return;

    setIsDragging(false);

    const current = offsetRef.current;
    startYRef.current = null;

    if (current >= threshold) {
      closeWithAnimation();
    } else {
      // 복귀(드래그 끝났으니 transition 살아있음)
      setOffset(0);
      offsetRef.current = 0;
    }
  };


  // open=false여도 닫힘 애니메이션 동안 DOM 유지
  const shouldRender = open || isClosing || offset !== window.innerHeight;
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
       className={`popup popup--sheet ${isDragging ? "is-dragging" : ""} ${className}`.trim()}
       style={{ transform: `translate3d(0, ${offset}px, 0)` }}
       onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ 드래그 핸들: 여기서만 드래그 이벤트 */}
        <div
          className="popup__handle"
          role="button"
          tabIndex={0}
          aria-label="드래그하여 닫기"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        />

        {/* ✅ 본문: 컨텐츠 많으면 여기만 스크롤 */}
        {hasHeader && (
          <div className="popup__body">
            {title && (
              <Typography variant="h4" size="small" className="popup__title">
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body" size="small" color="muted" className="popup__description">
                {description}
              </Typography>
            )}

            {options.length > 0 && (
              <div className="popup__options">
                {options.map((option, index) => (
                  <button
                    key={index}
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
          </div>
        )}
        {/* ✅ 자유 ui 등록 */}
        {content && (
          <div className="popup__content">
            {/* ✅ content를 ReactNode로 "그대로" 렌더 */}
            {content}
          </div>
        )}

        <div className="popup__actions popup__actions--stack">
          <Button variant="ghost" onClick={closeWithAnimation}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * FullscreenPopup 컴포넌트
 *
 * @param {boolean} open - 팝업 열림/닫힘 상태
 * @param {function} onClose - 팝업 닫기 핸들러
 * @param {string} title - 팝업 제목
 * @param {ReactNode} body - 팝업 본문 내용
 * @param {string} description - 제목 아래에 표시할 설명 텍스트
 * @param {boolean} showHeaderClose - 헤더 오른쪽 X 버튼 표시 여부 (기본값: true)
 * @param {boolean} showBottomClose - 하단 닫기 버튼 표시 여부 (기본값: false)
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

  //바디 스크롤막기
  useEffect(() => {
    if (!open) return;
    lockPageScroll();
    return () => unlockPageScroll();
  }, [open]);

  if (!open) return null;

  console.log("팝업 열림: FullscreenPopup", { title });

  return (
    <div className="popup-overlay popup-overlay--full">
      <div className="popup popup--full">
        <div className="popup__header">
          <Typography variant="h4" size="small">
            {title}
          </Typography>
          {showHeaderClose && (
            <button className="popup__close" onClick={onClose} aria-label="닫기">
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
