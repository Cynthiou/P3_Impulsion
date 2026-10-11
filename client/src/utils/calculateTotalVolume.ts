type VolumeSet = {
  repetitions: number | null;
  weightKg: number | string | null;
};

export const calculateTotalVolume = (sets: VolumeSet[]) => {
  let totalVolumeKg = 0;

  for (const set of sets) {
    const setVolume = Number(set.repetitions) * Number(set.weightKg);
    totalVolumeKg = totalVolumeKg + setVolume;
  }

  return totalVolumeKg;
};
