import { Skeleton } from '@/components/ui/skeleton'

export function LandingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <Skeleton className="mx-auto h-10 w-3/4 max-w-xl" />
      <Skeleton className="mx-auto h-5 w-1/2 max-w-md" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
