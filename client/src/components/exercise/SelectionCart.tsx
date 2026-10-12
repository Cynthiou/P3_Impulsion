import { useState } from "react";
import BarbellIcon from "../../assets/icons/navigation/barbell.svg?react";

type SelectionCartProps = {
  count: number;
  onValidate: () => void;
  onClear: () => void;
};

const SelectionCart = ({ count, onValidate, onClear }: SelectionCartProps) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (count === 0) {
    return null;
  }

  let countText = `${count} exercices sélectionnés`;

  if (count === 1) {
    countText = "1 exercice sélectionné";
  }

  if (!isCartOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={`${countText}, ouvrir le panier`}
        className="fixed right-4 bottom-24 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-content shadow-[0_0_24px_8px_rgba(0,0,0,0.75)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 lg:right-8 lg:bottom-8"
      >
        <BarbellIcon aria-hidden="true" className="size-6" />
        <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-base-100 bg-info font-bold text-info-content text-xs">
          {count}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 rounded-2xl border-2 border-primary/60 bg-base-300 p-4 shadow-2xl shadow-black/60 lg:right-8 lg:bottom-8 lg:left-auto lg:w-96">
      <button
        type="button"
        onClick={() => setIsCartOpen(false)}
        aria-label="Réduire le panier"
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-xl leading-none transition hover:bg-base-100 hover:ring-1 hover:ring-base-content/30 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <p className="flex items-center justify-center gap-3 pr-8 font-medium text-base-content text-sm">
        {countText}
        <button
          type="button"
          onClick={onClear}
          className="font-semibold text-info"
        >
          Vider
        </button>
      </p>

      <button
        type="button"
        onClick={onValidate}
        className="mt-3 w-full rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-content text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ajouter à ma séance
      </button>
    </div>
  );
};

export default SelectionCart;
