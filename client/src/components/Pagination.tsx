import ChevronLeftIcon from "../assets/icons/chevrons/chevron-left.svg?react";
import ChevronRightIcon from "../assets/icons/chevrons/chevron-right.svg?react";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
};

const buttonClassName =
  "grid size-11 place-items-center rounded-xl border border-base-300 bg-base-200 font-semibold transition-colors hover:border-base-content/40 disabled:cursor-not-allowed disabled:opacity-40";

const chevronClassName =
  "grid size-11 place-items-center rounded-xl border border-base-300 bg-base-200 text-secondary transition-colors hover:border-base-content/40 disabled:cursor-not-allowed disabled:text-base-content disabled:opacity-40";

const Pagination = ({ page, pageCount, onPageChange }: PaginationProps) => {
  if (pageCount <= 1) {
    return null;
  }

  const isFirstPage = page === 1;
  const isLastPage = page === pageCount;
  const previousPage = page - 1;
  const nextPage = page + 1;

  const goToPage = (newPage: number) => {
    onPageChange(newPage);

    const resultsTop = document.getElementById("results-top");

    if (resultsTop !== null) {
      resultsTop.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label="Page précédente"
        onClick={() => goToPage(previousPage)}
        disabled={isFirstPage}
        className={chevronClassName}
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
      </button>

      {!isFirstPage && (
        <button
          type="button"
          onClick={() => goToPage(previousPage)}
          className={buttonClassName}
        >
          {previousPage}
        </button>
      )}

      <button
        type="button"
        aria-current="page"
        className="grid size-11 place-items-center rounded-xl bg-secondary font-semibold text-secondary-content"
      >
        {page}
      </button>

      {!isLastPage && (
        <button
          type="button"
          onClick={() => goToPage(nextPage)}
          className={buttonClassName}
        >
          {nextPage}
        </button>
      )}

      <button
        type="button"
        aria-label="Page suivante"
        onClick={() => goToPage(nextPage)}
        disabled={isLastPage}
        className={chevronClassName}
      >
        <ChevronRightIcon aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
};

export default Pagination;
