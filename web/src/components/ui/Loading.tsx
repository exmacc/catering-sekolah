export function Loading({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
