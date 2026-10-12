export const formatWeight = (weightKg: number | string | null) => {
  if (weightKg === null) {
    return "–";
  }

  const weight = Number(weightKg);

  return `${weight.toLocaleString("fr-FR")} kg`;
};
