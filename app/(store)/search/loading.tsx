export default function SearchLoading() {
  return (
    <div className="container animate-pulse py-8 sm:py-10">
      <div className="bg-surface h-8 w-56 rounded" />
      <div className="bg-surface mt-2 h-4 w-40 rounded" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="border-border bg-surface hidden h-96 rounded-lg border lg:block" />
        <div>
          <div className="bg-surface mb-5 h-5 w-40 rounded" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-border bg-surface aspect-[3/4] rounded-lg border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
