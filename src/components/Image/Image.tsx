import { useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import "./Image.scss";
import type { ImgHTMLAttributes } from "react";

type ImageStatus = "loading" | "loaded" | "error";
type AspectRatio = "landscape" | "portrait" | "square";

type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onLoad" | "onError" | "width" | "height"
> & {
  src?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackSrc?: string;
  showFallback?: boolean;
  onLoad?: (img?: HTMLImageElement) => void;
  onError?: () => void;
};

const Image = ({
  src,
  alt = "",
  className = "",
  width,
  height,
  fallbackSrc,
  showFallback = true,
  onLoad,
  onError,
  ...props
}: ImageProps) => {
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
  const [fallbackError, setFallbackError] = useState(false);

  // ✅ 최신 콜백 유지 (부모에서 매 렌더마다 새 함수 내려와도 안전)
  const onLoadRef = useRef<ImageProps["onLoad"]>(onLoad);
  const onErrorRef = useRef<ImageProps["onError"]>(onError);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // 기본 noimage 이미지 URL (public 폴더의 no_image.png 사용)
  const baseUrl = useMemo(() => (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/"), []);
  const noImageUrl = fallbackSrc || `${baseUrl}no_image.png`;

  // ✅ src 바뀔 때만 상태 리셋
  useEffect(() => {
    setFallbackError(false);
    setAspectRatio(null);

    if (!src) {
      setImageStatus("error");
      return;
    }
    setImageStatus("loading");
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    // 비율 계산
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 1.1) setAspectRatio("landscape");
    else if (ratio < 0.9) setAspectRatio("portrait");
    else setAspectRatio("square");

    setImageStatus("loaded");
    onLoadRef.current?.(img);
  };

  const handleImageError = () => {
    setImageStatus("error");
    onErrorRef.current?.();
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  // 클래스 조합
  const classes = [
    "image",
    imageStatus === "loading" && "image--loading",
    imageStatus === "error" && "image--error",
    aspectRatio && `image--${aspectRatio}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // 에러 상태 처리
  if (imageStatus === "error") {
    if (!showFallback) return null;

    return (
      <div className={`${classes} image--fallback`} style={{ width, height }}>
        <div className="image__fallback-content">
          {fallbackError ? (
            <div className="image__fallback-text">noimage</div>
          ) : (
            <img
              src={noImageUrl}
              alt={alt || "이미지를 불러올 수 없습니다"}
              style={{ maxWidth: "100%", height: "auto" }}
              onError={handleFallbackError}
              {...props}
            />
          )}
        </div>
      </div>
    );
  }

  // ✅ loading이어도 DOM 유지 (Swiper 레이아웃 흔들림 방지)
  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      width={width}
      height={height}
      style={{
        width,
        height,
        opacity: imageStatus === "loading" ? 0 : 1,
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...props}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fallbackSrc: PropTypes.string,
  showFallback: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default Image;
