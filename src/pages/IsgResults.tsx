import { useEffect, useState } from "react";
import { IsgResultsGate } from "@/components/isg/IsgResultsGate";
import { IsgAggregateDashboard } from "@/components/isg/IsgAggregateDashboard";
import { IsgFooter } from "@/components/isg/IsgBrand";
import { readSession } from "@/lib/isgAggregate";

/**
 * /isg/resultados — Painel Executivo FIB-T (agregado).
 * Superfície administrativa: não deve ser linkada na experiência do participante.
 */
export default function IsgResults() {
  const [authorized, setAuthorized] = useState(() => readSession("admin") !== null);

  useEffect(() => {
    document.title = "Painel Executivo FIB-T — IFT";
    const meta = document.querySelector('meta[name="robots"]');
    const el = meta ?? document.createElement("meta");
    el.setAttribute("name", "robots");
    el.setAttribute("content", "noindex, nofollow");
    if (!meta) document.head.appendChild(el);
    return () => {
      if (!meta) el.remove();
    };
  }, []);

  return (
    <div className="isg-theme min-h-dvh bg-background font-body text-foreground">
      {authorized ? (
        <>
          <IsgAggregateDashboard onLogout={() => setAuthorized(false)} />
          <IsgFooter />
        </>
      ) : (
        <IsgResultsGate onAuthorized={() => setAuthorized(true)} />
      )}
    </div>
  );
}
