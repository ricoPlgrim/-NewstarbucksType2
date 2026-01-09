import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./BottomDock.scss";

export type BottomDockItem = {
  key: string;     // ✅ React key & 외부 식별자
  label: string;
  icon: ReactNode;
};

export type BottomDockProps = {
  items: BottomDockItem[];
  onChange?: (key: BottomDockItem["key"]) => void;
  defaultActiveIndex?: number; // ✅ index 기반
  position?: "fixed" | "relative";
};

function BottomDock({
  items,
  onChange,
  defaultActiveIndex,
  position = "fixed",
}: BottomDockProps) {
  if (!items || items.length === 0) return null;

  const safeIndex =
  typeof defaultActiveIndex === "number"
    ? Math.min(Math.max(defaultActiveIndex, 0), items.length - 1)
    : null;

  // ✅ active는 index로 관리
  const [activeIndex, setActiveIndex] = useState<number | null>(safeIndex);

  useEffect(() => {
    setActiveIndex(safeIndex);
  }, [safeIndex]);


  const handleSelect = (index: number) => {
    setActiveIndex(index);
    onChange?.(items[index].key); // ✅ 외부에는 string key 전달
  };

  return (
    <nav
      className={`bottom-dock ${
        position === "relative" ? "bottom-dock--relative" : ""
      }`}
      aria-label="하단 내비게이션"
    >
      {items.map((item, index) => (
        <button
          key={item.key} // ✅ React key는 string 유지
          type="button"
          className={`bottom-dock__item ${activeIndex === index ? "is-active" : ""}`}
          aria-pressed={activeIndex === index}
          onClick={() => handleSelect(index)}
        >
          <span className="bottom-dock__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-dock__label">{item.label}</span> 
        </button>
      ))}
    </nav>
  );
}

export default BottomDock;
