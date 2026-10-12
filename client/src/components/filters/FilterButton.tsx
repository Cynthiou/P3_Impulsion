import ChevronDownIcon from "../../assets/icons/chevrons/chevron-down.svg?react";
import ChevronUpIcon from "../../assets/icons/chevrons/chevron-up.svg?react";

type FilterButtonProps = {
  label: string;
  isOpen: boolean;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
};

const FilterButton = ({
  label,
  isOpen,
  isActive,
  disabled,
  onClick,
}: FilterButtonProps) => {
  let colorClassName = "border-base-300 bg-base-200 text-base-content/70";

  if (isActive) {
    colorClassName = "border-primary bg-primary/10 text-primary";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={isOpen}
      className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 font-normal text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40 ${colorClassName}`}
    >
      {label}
      {isOpen ? (
        <ChevronUpIcon aria-hidden="true" className="size-3.5" />
      ) : (
        <ChevronDownIcon aria-hidden="true" className="size-3.5" />
      )}
    </button>
  );
};

export default FilterButton;
