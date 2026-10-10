import type { HistoryFilter } from "../../types/filters";

type HistoryFiltersProps = {
  filter: HistoryFilter;
  setFilter: (value: HistoryFilter) => void;
};

const BUTTON_STYLE =
  "rounded-field px-4 py-1.5 font-semibold text-sm transition-colors bg-base-200 text-base-content/75 hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-default disabled:bg-secondary disabled:text-secondary-content";

const HistoryFilters = ({ filter, setFilter }: HistoryFiltersProps) => {
  const allIsActive = filter === "all";
  const monthIsActive = filter === "month";
  const sevenDaysIsActive = filter === "sevenDays";

  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      <button
        type="button"
        disabled={allIsActive}
        onClick={() => setFilter("all")}
        className={BUTTON_STYLE}
      >
        Tout
      </button>
      <button
        type="button"
        disabled={monthIsActive}
        onClick={() => setFilter("month")}
        className={BUTTON_STYLE}
      >
        Ce mois
      </button>
      <button
        type="button"
        disabled={sevenDaysIsActive}
        onClick={() => setFilter("sevenDays")}
        className={BUTTON_STYLE}
      >
        7 derniers jours
      </button>
    </div>
  );
};
export default HistoryFilters;
