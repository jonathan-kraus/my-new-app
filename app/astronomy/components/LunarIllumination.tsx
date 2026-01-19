export function LunarIllumination({ phase }: { phase: number }) {
  const percent = Math.round(phase * 100);

  return (
    <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
      <div
        className="absolute top-0 left-0 h-full bg-blue-400 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
