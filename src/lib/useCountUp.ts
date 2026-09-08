/*
 * @FilePath     : \my-new-app\lib\countDown.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-10 16:48:19
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-10 16:48:20
 */
import { useEffect, useState } from "react";

function useCountUp(target: number, durationMs = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = Math.max(0, Math.round(target));
    if (end === start) return;

    const startTime = performance.now();

    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const current = Math.round(start + (end - start) * progress);
      setValue(current);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}

export default useCountUp;
