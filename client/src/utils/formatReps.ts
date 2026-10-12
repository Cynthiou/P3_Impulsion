import { formatPlural } from "./formatPlural";

export const formatReps = (repetitions: number | null) => {
  if (repetitions === null) {
    return "–";
  }

  return formatPlural(repetitions, "rep");
};
