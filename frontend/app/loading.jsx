export default function Loading() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-velvet-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-[0.78rem] tracking-[0.15em] uppercase text-velvet-muted">Loading</p>
      </div>
    </div>
  );
}
