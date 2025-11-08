import { Skeleton } from "@/components/ui/skeleton.tsx"
import { cn } from "@/lib/utils.ts"

export default function SkeletonCard({
  title,
  className,
}: {
  title?: string
  className?: string
}) {
  return (
    <Skeleton className={cn("w-full sm:rounded-3xl sm:border", className)}>
      <div className="flex flex-col h-full sm:p-2 rounded-2xl sm:rounded-3xl">
        {title && (
          <div className="flex flex-row p-3 sm:pb-5">
            <h3 className="grow font-semibold text-xl/[2rem] sm:text-2xl">
              {title}
            </h3>
          </div>
        )}
        <div className="h-full rounded-2xl no-scrollbar overflow-hidden overflow-y-scroll"></div>
      </div>
    </Skeleton>
  )
}
