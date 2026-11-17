import { useEffect, useRef, useState } from "react";

/** Animated number that counts up on mount; respects reduced motion. */
export function CountUp({ value, decimals = 0, duration = 1100 }: { value: number | null | undefined; decimals?: number; duration?: number }) {
  const [shown, setShown] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    if (value == null || !Number.isFinite(value)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setShown(value * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);
  if (value == null || !Number.isFinite(value)) return <>—</>;
  return (
    <span className="p-countup" aria-label={value.toFixed(decimals).replace(".", ",")}>
      {shown.toFixed(decimals).replace(".", ",")}
    </span>
  );
}
