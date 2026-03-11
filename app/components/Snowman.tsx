// components/Snowman.tsx
export function Snowman() {
  return (
    <div className="flex flex-col items-center gap-1 text-sky-100">
      <div className="relative">
        {/* Head */}
        <div className="w-8 h-8 rounded-full bg-sky-50 shadow-sm relative">
          {/* Eyes */}
          <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-slate-800" />
          <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-slate-800" />
          {/* Carrot nose */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-1 bg-orange-400 rounded-r-full" />
        </div>
        {/* Body */}
        <div className="w-10 h-10 rounded-full bg-sky-50 shadow-sm -mt-2 flex items-center justify-center gap-1">
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <div className="w-1 h-1 rounded-full bg-slate-700" />
        </div>
        {/* Base */}
        <div className="w-12 h-12 rounded-full bg-sky-50 shadow-sm -mt-3" />
        {/* Arms */}
        <div className="absolute top-6 -left-4 w-6 h-px bg-amber-900" />
        <div className="absolute top-6 -right-4 w-6 h-px bg-amber-900" />
      </div>
      <div className="text-xs uppercase tracking-wide text-sky-200">
        Snowman mode
      </div>
    </div>
  );
}
