export const formatClock = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};
