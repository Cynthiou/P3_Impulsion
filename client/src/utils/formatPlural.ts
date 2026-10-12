export const formatPlural = (count: number, word: string) => {
  let letterS = "s";

  if (count <= 1) {
    letterS = "";
  }

  return `${count} ${word}${letterS}`;
};
