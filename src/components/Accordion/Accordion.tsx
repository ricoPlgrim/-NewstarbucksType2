import { useState, useRef, useEffect } from "react";
import "./Accordion.scss";
import type { ReactNode } from "react";

type AccordionType = "exclusive" | "independent";

type AccordionItem = {
  id: string | number;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
};

type AccordionProps = {
  items?: AccordionItem[];
  type?: AccordionType;
  defaultOpenFirst?: boolean;
  className?: string;
};

const Accordion = ({
  items = [],
  type = "exclusive",
  defaultOpenFirst = false,
  className = "",
}: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (type === "exclusive" && defaultOpenFirst && items.length > 0) {
      return [String(items[0].id)];
    }
    return [];
  });

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ✅ items가 바뀌었는데 openItems에 없는 id만 남아있으면 초기화 (안전)
  useEffect(() => {
    if (!items.length) {
      setOpenItems([]);
      return;
    }

    const validKeys = new Set(items.map((it) => String(it.id)));
    setOpenItems((prev) => prev.filter((k) => validKeys.has(k)));

    // defaultOpenFirst 처리(Exclusive에서만)
    if (type === "exclusive" && defaultOpenFirst) {
      const firstKey = String(items[0].id);
      setOpenItems((prev) => (prev.length ? prev : [firstKey]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, type, defaultOpenFirst]);

  const handleItemClick = (itemId: string | number) => {
    const key = String(itemId);

    if (type === "exclusive") {
      setOpenItems((prev) => (prev.includes(key) ? [] : [key]));
    } else {
      setOpenItems((prev) =>
        prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
      );
    }
  };

  // ✅ max-height 애니메이션
  useEffect(() => {
    items.forEach((item) => {
      const key = String(item.id);
      const ref = contentRefs.current[key];
      if (!ref) return;

      ref.style.maxHeight = openItems.includes(key) ? `${ref.scrollHeight}px` : "0";
    });
  }, [openItems, items]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!items.length) return null;

  return (
    <div className={`accordion accordion--category ${className}`}>
      <ul className="accordion__list">
        {items.map((item, index) => {
          const key = String(item.id);
          const isOpen = openItems.includes(key);

          return (
            <li
              key={key}
              className={`accordion__item ${isOpen ? "accordion__item--open" : ""}`}
            >
              {/* ✅ 캡처 디자인 헤더 */}
              <button
                type="button"
                className="accordion__header"
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${key}`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className="accordion__header-left">
                  <span className="accordion__category-icon" aria-hidden="true">
                    {item.icon ?? <DefaultCategoryIcon />}
                  </span>

                  <span className="accordion__label">{item.label}</span>
                </span>

                <span className="accordion__toggle" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              <div
                id={`accordion-content-${key}`}
                ref={(el) => {
                  contentRefs.current[key] = el;
                }}
                className="accordion__content-wrapper"
                role="region"
                aria-hidden={!isOpen}
                onClick={handleContentClick}
              >
                <div className="accordion__content">{item.content}</div>
              </div>

              {/* ✅ 캡처처럼 구분선 */}
              {index !== items.length - 1 && (
                <div className="accordion__divider" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Accordion;

function DefaultCategoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 1 1 10 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 10h12l-1 10H7L6 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 14v2M14 14v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
