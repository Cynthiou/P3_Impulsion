const ALLOWED_REST_SECONDS = [30, 60, 90, 120, 150] as const;

const DEFAULT_REST_SECONDS = 90;

function isAllowedRestSeconds(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" &&
      ALLOWED_REST_SECONDS.some((duration) => duration === value))
  );
}

export { ALLOWED_REST_SECONDS, DEFAULT_REST_SECONDS, isAllowedRestSeconds };
