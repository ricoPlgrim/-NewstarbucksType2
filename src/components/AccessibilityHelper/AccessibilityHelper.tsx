import { useState, useEffect, useRef } from "react";
import "./AccessibilityHelper.scss";

const FONT_SCALE_OPTIONS: { id: FontScale; label: string }[] = [
  { id: "small", label: "작게" },
  { id: "normal", label: "보통" },
  { id: "large", label: "크게" },
  { id: "xlarge", label: "아주 크게" },
];

type FontScale = "small" | "normal" | "large" | "xlarge";

interface AccessibilityHelperProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  fontScale: FontScale;
  setFontScale: React.Dispatch<React.SetStateAction<FontScale>>;
}



function AccessibilityHelper({
  isDarkMode,
  setIsDarkMode,
  fontScale,
  setFontScale,
}: AccessibilityHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  

  // isOpen 상태 변경 시 즉시 panel 표시/숨김
  useEffect(() => {
    setIsPanelVisible(isOpen);
  }, [isOpen]);

  const currentFontScaleLabel =
    FONT_SCALE_OPTIONS.find((option) => option.id === fontScale)?.label ?? "보통";

  return (
    <div 
      className={`accessibility-helper ${isOpen ? "is-open" : ""}`}
    >
      <button
        className="accessibility-helper__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "접근성 도우미 닫기" : "접근성 도우미 열기"}
        aria-expanded={isOpen}
      >
        <span className="accessibility-helper__icon" aria-hidden="true">
          {isOpen ? "◀" : "▶"}
        </span>
        <span className="accessibility-helper__label">옵션</span>
      </button>

      <div 
        ref={panelRef}
        className={`accessibility-helper__panel ${!isPanelVisible ? "is-hidden" : ""}`}
      >
        <div className="accessibility-helper__section">
            <div className="accessibility-helper__control">
              <label className="accessibility-helper__label-text">테마 모드</label>
              <div className="accessibility-helper__toggle-group" role="group">
                <button
                  type="button"
                  className={`accessibility-helper__button ${!isDarkMode ? "is-active" : ""}`}
                  onClick={() => setIsDarkMode(false)}
                  aria-pressed={!isDarkMode}
                >
                  라이트
                </button>
                <button
                  type="button"
                  className={`accessibility-helper__button ${isDarkMode ? "is-active" : ""}`}
                  onClick={() => setIsDarkMode(true)}
                  aria-pressed={isDarkMode}
                >
                  다크
                </button>
              </div>
            </div>

            <div className="accessibility-helper__control">
              <label className="accessibility-helper__label-text">글꼴 크기</label>
              <div className="accessibility-helper__toggle-group" role="group">
                {FONT_SCALE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`accessibility-helper__button ${fontScale === option.id ? "is-active" : ""}`}
                    onClick={() => setFontScale(option.id)}
                    aria-pressed={fontScale === option.id}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="accessibility-helper__status">
              <span>현재: {isDarkMode ? "다크" : "라이트"} · {currentFontScaleLabel}</span>
            </div>
          </div>
        </div>
    </div>
  );
}

export default AccessibilityHelper;

