import { useState, useEffect } from "react";
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

  // 기본 noimage 이미지 URL (public 폴더의 no_image.png 사용)
  const noImageUrl = fallbackSrc || `${process.env.PUBLIC_URL || ""}/no_image.png`;

  useEffect(() => {
    setFallbackError(false);
    setAspectRatio(null); // ✅ src 바뀌면 비율도 초기화

    if (!src) {
      setImageStatus("error");
      return;
    }

    setImageStatus("loading");

    // 이미지 로드를 위한 임시 img 요소 생성
    const img = document.createElement("img");

    img.onload = () => {
      setImageStatus("loaded");

      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.1) {
        setAspectRatio("landscape");
      } else if (ratio < 0.9) {
        setAspectRatio("portrait");
      } else {
        setAspectRatio("square");
      }

      onLoad?.(img);
    };

    img.onerror = () => {
      setImageStatus("error");
      onError?.();
    };

    img.src = src;

    // ✅ cleanup: src가 빠르게 바뀔 때 이벤트 정리(안전)
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  const handleImageError = () => {
    setImageStatus("error");
    onError?.();
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  const handleImageLoad = () => {
    setImageStatus("loaded");
    onLoad?.();
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

  // 로딩 중일 때는 아무것도 렌더링하지 않음 (액박 방지)
  if (imageStatus === "loading") {
    return null;
  }

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

  // 정상 로드된 이미지 표시
  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      width={width}
      height={height}
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
