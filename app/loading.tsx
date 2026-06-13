export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_35%)]" />

      <div className="relative flex flex-col items-center text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-white" />

        <h1 className="mt-8 text-2xl font-black">AI Bot Pro</h1>

        <p className="mt-3 text-sm text-zinc-400">
          正在加载，请稍等...
        </p>
      </div>
    </main>
  );
}