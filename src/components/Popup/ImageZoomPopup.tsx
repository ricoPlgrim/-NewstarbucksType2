import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper"; // ✅ 핵심: 타입 import
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "../Image/Image";
import Loading from "../Loading/Loading";
import Typography from "../Typography/Typography";
import "./Popup.scss";

type ImageZoomPopupProps = {
  images: string | string[];
  alt?: string | string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  headerAlign?: "left" | "center";
};

/**
 * ImageZoomPopup 컴포넌트
 * 이미지를 스와이퍼로 보여주고 각 이미지에 커스텀 줌 기능을 제공하는 풀스크린 팝업 컴포넌트
 * 핀치 줌, 더블 탭 줌, 마우스 휠 줌 지원
 */
const ImageZoomPopup = ({
  images,
  alt = "Zoom image",
  initialIndex = 0,
  open,
  onClose,
  headerAlign = "center",
}: ImageZoomPopupProps) => {
  // ✅ any 제거
  const swiperRef = useRef<SwiperInstance | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [imageList, setImageList] = useState<string[]>([]);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // 각 이미지의 로딩 상태
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});

  // props로 받은 images를 동적으로 state로 반영
  useEffect(() => {
    const next = Array.isArray(images) ? images : images ? [images] : [];
    setImageList(next);

    // 이미지 소스가 바뀌면 인덱스와 로딩 상태 리셋
    setCurrentIndex(Math.min(initialIndex, Math.max(next.length - 1, 0)));

    const loading: Record<number, boolean> = {};
    next.forEach((_, idx) => {
      loading[idx] = true;
    });
    setIsLoading(loading);
  }, [images, initialIndex]);

  const altArray = Array.isArray(alt)
    ? alt
    : imageList.map((_, idx) =>
        typeof alt === "string" ? `${alt} ${idx + 1}` : `Zoom image ${idx + 1}`
      );

  // 팝업이 열릴 때 현재 인덱스로 이동
  useEffect(() => {
    if (open && swiperRef.current && currentIndex < imageList.length) {
      swiperRef.current.slideTo(currentIndex);
    }
  }, [open, currentIndex, imageList.length]);

  const handleImageLoad = (index: number) => {
    setIsLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setIsLoading((prev) => ({ ...prev, [index]: false }));
  };

  if (!open || imageList.length === 0) return null;

  return (
    <div className="popup-overlay popup-overlay--full" onClick={onClose}>
      <div
        className="popup popup--full popup--image-zoom"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className={`popup__header ${
            headerAlign === "center" ? "popup__header--center" : ""
          }`}
        >
          <div className="popup__header-title">
            <Typography variant="h5" size="small" weight="bold">
              확대 보기
            </Typography>
          </div>
          <button className="popup__close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Swiper */}
        <div className="popup__image-viewport">
          <Swiper
            modules={[Navigation, Pagination, Zoom]}
            navigation={imageList.length > 1}
            pagination={
              imageList.length > 1
                ? { clickable: true, type: "fraction" }
                : false
            }
            zoom={{
              maxRatio: 3,
              minRatio: 1,
              toggle: true,
            }}
            spaceBetween={0}
            slidesPerView={1}
            allowTouchMove={true}
            simulateTouch={true}
            touchStartPreventDefault={false}
            touchRatio={1}
            threshold={5}
            shortSwipes={true}
            longSwipes={true}
            longSwipesRatio={0.5}
            longSwipesMs={300}
            resistance={true}
            resistanceRatio={0.85}
            followFinger={true}
            initialSlide={initialIndex}
            // ✅ 여기부터 전부 타입 지정
            onSwiper={(swiper: SwiperInstance) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper: SwiperInstance) => {
              setCurrentIndex(swiper.activeIndex);
              if (swiperRef.current) {
                swiperRef.current.allowTouchMove = true;
              }
            }}
            onTransitionEnd={(swiper: SwiperInstance) => {
              void swiper;
            }}
            onTouchStart={(
              swiper: SwiperInstance,
              event: TouchEvent | PointerEvent | MouseEvent
            ) => {
              void swiper;
              void event;
            }}
            onTouchMove={(
              swiper: SwiperInstance,
              event: TouchEvent | PointerEvent | MouseEvent
            ) => {
              void swiper;
              void event;
            }}
            onTouchEnd={(
              swiper: SwiperInstance,
              event: TouchEvent | PointerEvent | MouseEvent
            ) => {
              void swiper;
              void event;
            }}
            onNavigationNext={(swiper: SwiperInstance) => {
              void swiper;
            }}
            onNavigationPrev={(swiper: SwiperInstance) => {
              void swiper;
            }}
            onTransitionStart={(swiper: SwiperInstance) => {
              void swiper;
            }}
            onZoomChange={(swiper: SwiperInstance, scale: number) => {
              void swiper;
              setIsZoomed(scale > 1);
            }}
            className={`popup__image-swiper ${isZoomed ? "is-zoomed" : ""}`}
          >
            {imageList.map((imageSrc, index) => (
              <SwiperSlide key={index} className="popup__image-slide">
                <div className="popup__image-zoom-container swiper-zoom-container">
                  {/* 로딩 */}
                  {isLoading[index] !== false && (
                    <div className="popup__image-loading">
                      <Loading size={48} thickness={4} label="이미지 로딩 중..." />
                    </div>
                  )}

                  {/* 이미지 */}
                  <Image
                    src={imageSrc}
                    alt={altArray[index] || `Zoom image ${index + 1}`}
                    className="popup__image-zoom-element"
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    draggable={false}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomPopup;
