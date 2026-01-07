import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "../../components/Tabs/Tabs";
import Dropdown from "../../components/Dropdown/Dropdown";
import Typography from "../../components/Typography/Typography";
import { ListItem } from "../../components/List/List";
import Badge from "../../components/Badge/Badge";
import "./ProgressStatusPage.scss";

type ProgressItem = {
  id: string;
  title: string;
  store: string;
  lastModified: string;
  status: "store-request" | "partner-received" | "repair-completed";
  statusLabel: string;
};

/** ✅ title 앞의 [정기세척] 같은 “카테고리”를 추출 */
const extractCategory = (title: string) => {
  const m = title.match(/^\[(.*?)\]/);
  return m?.[1]?.trim() || "기타";
};

type CategoryKey = "all" | string;
type TabKey = "all" | ProgressItem["status"];

const ProgressStatusPage = () => {
  const navigate = useNavigate();

  // 진행현황 데이터 (원본 그대로)
  const [progressItems] = useState<ProgressItem[]>([
    {
      id: "1",
      title: "[협력업체접수] 마스트레나 2PM관련",
      store: "매장 : 종로구청",
      lastModified: "최근수정일 : 2025-12-17",
      status: "store-request",
      statusLabel: "매장요청",
    },
    {
      id: "2",
      title: "[정기세척] 아이스빈 배관, 호스(수전)누수관련",
      store: "매장 : 강남구청",
      lastModified: "최근수정일 : 2026-01-09",
      status: "partner-received",
      statusLabel: "협력업체접수",
    },
    {
      id: "3",
      title:
        "[장비정기점검] 레일등/직부등(LED PAR-30전구) 일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구) 일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)",
      store: "매장 : 성동구청",
      lastModified: "최근수정일 : 2026-07-09",
      status: "repair-completed",
      statusLabel: "공사(수선)완료/금액청구",
    },
    {
      id: "4",
      title: "[수선] 에어커튼(전기누전)관련(에어커튼900)",
      store: "매장 : 강동구청",
      lastModified: "최근수정일 : 2026-04-28",
      status: "partner-received",
      statusLabel: "협력업체접수",
    },
    {
      id: "5",
      title: "[협력업체접수] 마스트레나 2PM관련",
      store: "매장 : 종로구청",
      lastModified: "최근수정일 : 2025-12-17",
      status: "store-request",
      statusLabel: "매장요청",
    },
    {
      id: "6",
      title: "[정기세척] 아이스빈 배관, 호스(수전)누수관련",
      store: "매장 : 강남구청",
      lastModified: "최근수정일 : 2026-01-09",
      status: "partner-received",
      statusLabel: "협력업체접수",
    },
    {
      id: "7",
      title:
        "[장비정기점검] 레일등/직부등(LED PAR-30전구) 일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구) 일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)일등/직부등(LED PAR-30전구)",
      store: "매장 : 성동구청",
      lastModified: "최근수정일 : 2026-07-09",
      status: "repair-completed",
      statusLabel: "공사(수선)완료/금액청구",
    },
    {
      id: "8",
      title: "[수선] 에어커튼(전기누전)관련(에어커튼900)",
      store: "매장 : 강동구청",
      lastModified: "최근수정일 : 2026-04-28",
      status: "partner-received",
      statusLabel: "협력업체접수",
    },
  ]);

  /** ✅ 드롭다운(카테고리) 선택값 */
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  /** ✅ 탭(상태) 선택값 */
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  /** ✅ 카테고리 목록 생성 (데이터 기반) */
  const categoryOptions = useMemo(() => {
    const categorySet = new Set<string>();
    progressItems.forEach((it) => categorySet.add(extractCategory(it.title)));

    // "전체" 포함 + 나머지 카테고리 정렬
    const categories = ["all", ...Array.from(categorySet).sort()];

    return categories.map((c) => ({
      value: c,
      label: c === "all" ? "전체" : c,
    }));
  }, [progressItems]);

  /** ✅ 현재 카테고리에 해당하는 아이템만 먼저 필터 */
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === "all") return progressItems;
    return progressItems.filter((it) => extractCategory(it.title) === selectedCategory);
  }, [progressItems, selectedCategory]);

  /** ✅ 카테고리 필터 기준 상태 카운트 */
  const statusCountMap = useMemo(() => {
    return categoryFiltered.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [categoryFiltered]);

  /** ✅ 드롭다운(카테고리)이 바뀌면 탭을 기본(all)로 리셋 */
  useEffect(() => {
    setActiveTab("all");
  }, [selectedCategory]);

  /** ✅ 탭 아이템 구성 (카테고리 기준으로 카운트 반영) */
  const tabItems = useMemo(() => {
    const base = [
      { id: "all" as const, label: `전체(${categoryFiltered.length})` },
      { id: "store-request" as const, label: `매장요청(${statusCountMap["store-request"] ?? 0})` },
      { id: "partner-received" as const, label: `협력업체접수(${statusCountMap["partner-received"] ?? 0})` },
      { id: "repair-completed" as const, label: `수선완료/청구(${statusCountMap["repair-completed"] ?? 0})` },
    ];
    return base;
  }, [categoryFiltered.length, statusCountMap]);

  /** ✅ 최종 리스트 필터: (카테고리 필터) + (탭 상태 필터) */
  const filteredItems = useMemo(() => {
    if (activeTab === "all") return categoryFiltered;
    return categoryFiltered.filter((it) => it.status === activeTab);
  }, [categoryFiltered, activeTab]);

  const getStatusButtonVariant = (status: ProgressItem["status"]) => {
    switch (status) {
      case "store-request":
      case "partner-received":
        return "success";
      case "repair-completed":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="progress-status-page">
      {/* ✅ 카테고리 드롭다운: 선택하면 탭 구성이 바뀜 */}
      <div className="progress-status-page__select-section">
        <Dropdown
          options={categoryOptions}
          value={selectedCategory}
          placeholder="카테고리"
          fullWidth={true}
          onChange={(opt) => {
            const next = typeof opt === "string" ? opt : opt.value;
            setSelectedCategory(next);
          }}
        />
      </div>

      {/* ✅ 탭: 드롭다운 선택된 카테고리 기준으로 카운트/라벨이 바뀜 */}
      <div id="progress-status-filter-scroll">
        <Tabs
          activeTabId={activeTab}
          type="scroll"
          scrollContainerId="progress-status-filter-scroll"
          items={tabItems}
          onChange={(nextId) => setActiveTab(nextId as TabKey)}
          showContent={false}
        />
      </div>

      {/* 진행현황 리스트 */}
      <div className="progress-status-page__list">
        {filteredItems.length === 0 ? (
          <div className="progress-status-page__empty">
            <Typography variant="body" size="medium" color="muted">
              진행현황이 없습니다.
            </Typography>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ListItem
              key={item.id}
              className="progress-status-page__list-item"
              onClick={() => {
                console.log("아이템 클릭:", item.id);
              }}
            >
              <div className="progress-status-page__item-content">
                <Typography variant="h5" size="small" weight="bold" className="progress-status-page__item-title">
                  {item.title}
                </Typography>

                <div className="progress-status-page__item-info">
                  <Typography variant="body" size="small" color="muted" className="progress-status-page__item-store">
                    {item.store}
                  </Typography>

                  <div className="progress-status-page__item-meta">
                    <Typography variant="body" size="small" color="muted" className="progress-status-page__item-date">
                      {item.lastModified}
                    </Typography>

                    <Badge
                      variant={getStatusButtonVariant(item.status)}
                      size="small"
                      className="progress-status-page__status-badge"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginRight: "4px" }}
                      >
                        <path
                          d="M2 4H14V12H2V4Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 6L8 10L14 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item.statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            </ListItem>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressStatusPage;
