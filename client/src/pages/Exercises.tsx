import { useState } from "react";
import ArrowRightIcon from "../assets/icons/arrows/arrow-right.svg?react";
import EmptyState from "../components/EmptyState";
import NoResultsState from "../components/NoResultsState";
import Pagination from "../components/Pagination";
import ExerciseCard from "../components/exercise/ExerciseCard";
import ExerciseCardSkeleton from "../components/exercise/ExerciseCardSkeleton";
import ExerciseDetailSheet from "../components/exercise/ExerciseDetailSheet";
import SearchField from "../components/exercise/SearchField";
import SelectionCart from "../components/exercise/SelectionCart";
import LocalErrorState from "../components/feedback/LocalErrorState";
import CategoryIcon from "../components/filters/CategoryIcon";
import EquipmentIcon from "../components/filters/EquipmentIcon";
import FilterButton from "../components/filters/FilterButton";
import FilterGrid from "../components/filters/FilterGrid";
import LevelIcon from "../components/filters/LevelIcon";
import useExercises from "../hooks/exercise/useExercises";
import useFilters from "../hooks/useFilters";

const SKELETON_IDS = [
  "exercise-skeleton-1",
  "exercise-skeleton-2",
  "exercise-skeleton-3",
  "exercise-skeleton-4",
  "exercise-skeleton-5",
  "exercise-skeleton-6",
];

type ExercisesProps = {
  selectionMode?: boolean;
  excludedIds?: number[];
  onCancel?: () => void;
  onValidate?: (selectedIds: number[]) => void;
};

function Exercises({
  selectionMode,
  excludedIds = [],
  onCancel,
  onValidate,
}: ExercisesProps) {
  const {
    exercises,
    isLoading,
    error,
    retry,
    search,
    setSearch,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedEquipmentId,
    setSelectedEquipmentId,
    selectedDifficultyId,
    setSelectedDifficultyId,
    hasActiveFilter,
    resetFilters,
    isCatalogEmpty,
    page,
    setPage,
    total,
    pageCount,
  } = useExercises();

  const {
    categories,
    difficulties,
    equipment,
    error: filtersError,
  } = useFilters();

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const exerciseGridClassName = selectionMode
    ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
    : "flex flex-col gap-2";

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleFilter = (name: string) => {
    if (openFilter === name) {
      setOpenFilter(null);
    } else {
      setOpenFilter(name);
    }
  };

  const showFilterBox = openFilter !== null;

  function handleToggleSelection(id: number) {
    if (excludedIds.includes(id)) {
      return;
    }

    setSelectedIds((previousSelectedIds) => {
      if (previousSelectedIds.includes(id)) {
        return previousSelectedIds.filter((selectedId) => selectedId !== id);
      }
      return [...previousSelectedIds, id];
    });
  }

  function handleOpenExerciseDetail(exerciseId: number) {
    setSelectedExerciseId(exerciseId);
  }

  function handleCloseExerciseDetail() {
    setSelectedExerciseId(null);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function handleValidate() {
    onValidate?.(selectedIds);
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl md:py-4">
        <LocalErrorState
          message="Impossible de charger les exercices."
          onRetry={retry}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl text-base-content md:py-4">
      <header className="mb-6 flex items-center gap-2">
        {selectionMode && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Retour à la séance"
            className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
          >
            <ArrowRightIcon aria-hidden="true" className="size-5 rotate-180" />
          </button>
        )}

        <h1 className="font-display font-extrabold text-2xl uppercase italic tracking-wide">
          {selectionMode ? "Ajouter à ma séance" : "Catalogue d'exercices"}
        </h1>
      </header>

      {selectionMode && (
        <SelectionCart
          count={selectedIds.length}
          onValidate={handleValidate}
          onClear={handleClearSelection}
        />
      )}

      <div className="mb-4">
        <SearchField
          value={search}
          onChange={setSearch}
          disabled={isCatalogEmpty}
        />
      </div>

      <div className="mb-3 flex gap-2">
        <FilterButton
          label="Groupe"
          isOpen={openFilter === "category"}
          isActive={selectedCategoryId !== null}
          disabled={isCatalogEmpty}
          onClick={() => toggleFilter("category")}
        />
        <FilterButton
          label="Matériel"
          isOpen={openFilter === "equipment"}
          isActive={selectedEquipmentId !== null}
          disabled={isCatalogEmpty}
          onClick={() => toggleFilter("equipment")}
        />
        <FilterButton
          label="Difficulté"
          isOpen={openFilter === "difficulty"}
          isActive={selectedDifficultyId !== null}
          disabled={isCatalogEmpty}
          onClick={() => toggleFilter("difficulty")}
        />
      </div>

      {showFilterBox && (
        <div className="mb-5 space-y-4 rounded-2xl border border-base-300 bg-base-200/60 p-3">
          {openFilter === "category" && (
            <FilterGrid
              legend="Zone musculaire"
              options={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              disabled={isCatalogEmpty}
              columnsClassName="grid-cols-4"
              renderIcon={(option, isSelected) => (
                <CategoryIcon name={option.name} isSelected={isSelected} />
              )}
            />
          )}

          {openFilter === "equipment" && (
            <FilterGrid
              legend="Matériel"
              options={equipment}
              selectedId={selectedEquipmentId}
              onSelect={setSelectedEquipmentId}
              disabled={isCatalogEmpty}
              columnsClassName="grid-cols-3 sm:grid-cols-6"
              renderIcon={(option, isSelected) => (
                <EquipmentIcon name={option.name} isSelected={isSelected} />
              )}
            />
          )}

          {openFilter === "difficulty" && (
            <FilterGrid
              legend="Niveau"
              options={difficulties}
              selectedId={selectedDifficultyId}
              onSelect={setSelectedDifficultyId}
              disabled={isCatalogEmpty}
              columnsClassName="grid-cols-3"
              renderIcon={(option, isSelected) => (
                <LevelIcon name={option.name} isSelected={isSelected} />
              )}
            />
          )}
        </div>
      )}

      {hasActiveFilter && (
        <button
          type="button"
          onClick={resetFilters}
          disabled={isCatalogEmpty}
          className="mb-5 w-full rounded-xl border-2 border-base-300 bg-base-200 px-4 py-3 font-semibold text-neutral text-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Réinitialiser
        </button>
      )}

      {filtersError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-error text-sm"
        >
          Impossible de charger les filtres.
        </div>
      )}

      {isCatalogEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div
            id="results-top"
            className="mb-3 flex scroll-mt-4 items-center justify-between"
          >
            <p className="font-semibold text-info text-xs uppercase tracking-wider">
              {total} résultat
              {total > 1 ? "s" : ""}
            </p>
          </div>

          {isLoading ? (
            <div className={exerciseGridClassName}>
              {SKELETON_IDS.map((skeletonId) => (
                <ExerciseCardSkeleton
                  key={skeletonId}
                  selectionMode={selectionMode}
                />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <NoResultsState />
          ) : (
            <>
              <div className={exerciseGridClassName}>
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={handleOpenExerciseDetail}
                    selectionMode={selectionMode}
                    isSelected={selectedIds.includes(exercise.id)}
                    isUnavailable={excludedIds.includes(exercise.id)}
                    onToggleSelect={handleToggleSelection}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      <ExerciseDetailSheet
        exerciseId={selectedExerciseId}
        onClose={handleCloseExerciseDetail}
        selectionMode={selectionMode}
        isSelected={
          selectedExerciseId !== null &&
          selectedIds.includes(selectedExerciseId)
        }
        isUnavailable={
          selectedExerciseId !== null &&
          excludedIds.includes(selectedExerciseId)
        }
        onToggleSelect={handleToggleSelection}
      />
    </section>
  );
}

export default Exercises;
