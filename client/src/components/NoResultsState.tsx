import SearchIcon from "../assets/icons/champs/search.svg?react";

const NoResultsState = () => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-base-300 border-dashed px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-base-200 text-neutral">
        <SearchIcon aria-hidden="true" className="size-6" />
      </span>

      <p className="font-semibold">Aucun exercice trouvé</p>

      <p className="text-neutral text-sm">
        Essayez un autre mot ou retirez un filtre.
      </p>
    </div>
  );
};

export default NoResultsState;
