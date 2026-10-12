import { useEffect, useState } from "react";
import exerciseApi from "../../services/exerciseApi";
import type { ExerciseSummary } from "../../types/exercise";

function useExercises() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null,
  );
  const [selectedDifficultyId, setSelectedDifficultyId] = useState<
    number | null
  >(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  // compteur qu'on incremente juste pour relancer l'effet quand on clique sur "Reessayer"
  const [reloadCount, setReloadCount] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: on surveille les filtres pour revenir page 1
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategoryId, selectedEquipmentId, selectedDifficultyId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadCount n'est pas lu dans l'effet, il sert uniquement a le relancer quand on clique sur "Reessayer"
  useEffect(() => {
    // permet d'annuler cette requete si un critere change avant qu'elle reponde
    const controller = new AbortController();

    async function loadExercises() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await exerciseApi.fetchExercises(
          selectedCategoryId ?? undefined,
          selectedDifficultyId ?? undefined,
          selectedEquipmentId ?? undefined,
          search,
          page,
          controller.signal,
        );
        setExercises(data.items);
        setTotal(data.total);
        setPageCount(data.pageCount);
      } catch (err) {
        // requete annulee : une plus recente est en cours, on ignore cette reponse
        if ((err as Error).name === "AbortError") {
          return;
        }
        setError(err as Error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadExercises();

    // React appelle cette fonction avant de relancer l'effet
    return () => controller.abort();
  }, [
    search,
    selectedCategoryId,
    selectedEquipmentId,
    selectedDifficultyId,
    page,
    reloadCount,
  ]);

  function retry() {
    setReloadCount((count) => count + 1);
  }

  function resetFilters() {
    setSearch("");
    setSelectedCategoryId(null);
    setSelectedEquipmentId(null);
    setSelectedDifficultyId(null);
  }

  const hasActiveFilter =
    search !== "" ||
    selectedCategoryId !== null ||
    selectedEquipmentId !== null ||
    selectedDifficultyId !== null;

  // zero resultat sans aucun filtre actif = le catalogue lui-meme est vide
  const isCatalogEmpty =
    !isLoading && exercises.length === 0 && !hasActiveFilter;

  return {
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
    page,
    setPage,
    total,
    pageCount,
    resetFilters,
    hasActiveFilter,
    isCatalogEmpty,
  };
}

export default useExercises;
