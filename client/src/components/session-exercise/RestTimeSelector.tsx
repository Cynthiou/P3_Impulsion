import { useState } from "react";
import PencilIcon from "../../assets/icons/actions/pencil.svg?react";

const REST_OPTIONS = [
  { label: "0:00", value: null },
  { label: "1:00", value: 60 },
  { label: "1:30", value: 90 },
  { label: "2:00", value: 120 },
  { label: "2:30", value: 150 },
  { label: "3:00", value: 180 },
] as const;

type RestTimeSelectorProps = {
  value: number | null;
  onChange: (restSeconds: number | null) => void;
  disabled?: boolean;
  editable?: boolean;
};

function formatRestTime(restSeconds: number | null) {
  if (restSeconds === null) {
    return "Repos 0:00";
  }

  const minutes = Math.floor(restSeconds / 60);
  const seconds = String(restSeconds % 60).padStart(2, "0");

  return `Repos ${minutes}:${seconds}`;
}

function RestTimeSelector({
  value,
  onChange,
  disabled = false,
  editable = true,
}: RestTimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formattedValue = formatRestTime(value);

  if (!editable) {
    return (
      <p className="mt-0.5 font-medium text-base-content/70 text-sm">
        {formattedValue}
      </p>
    );
  }

  return (
    <div className="mt-0.5 -ml-2">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-label={`${formattedValue}, modifier`}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-medium text-base-content/70 text-sm transition hover:bg-base-300 hover:text-base-content disabled:cursor-wait disabled:opacity-50"
      >
        {formattedValue}
        <PencilIcon aria-hidden="true" className="size-3.5" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 left-0 z-20 mt-2 flex gap-1 rounded-box border-2 border-primary/60 bg-base-300 p-1.5 shadow-2xl"
          aria-label="Temps de repos"
        >
          {REST_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              disabled={disabled}
              aria-pressed={value === option.value}
              className={`flex-1 rounded-lg px-2 py-2.5 font-semibold text-sm tabular-nums transition disabled:cursor-wait disabled:opacity-50 ${
                value === option.value
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestTimeSelector;
