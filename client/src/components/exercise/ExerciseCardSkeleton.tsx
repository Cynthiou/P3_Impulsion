import Skeleton from "../feedback/Skeleton";

type ExerciseCardSkeletonProps = {
  selectionMode?: boolean;
};

function ExerciseCardSkeleton({ selectionMode }: ExerciseCardSkeletonProps) {
  if (!selectionMode) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3">
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2 rounded-box border border-base-300 bg-base-200 p-3">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export default ExerciseCardSkeleton;
