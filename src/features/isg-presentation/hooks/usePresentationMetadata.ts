import { useEffect } from "react";
export function usePresentationMetadata(consoleMode = false) {
  useEffect(() => {
    const title = document.title;
    const lang = document.documentElement.lang;
    const existing = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const old = existing?.getAttribute("content");
    const robots = existing ?? document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(robots);
    document.title = consoleMode
      ? "Console do representante · ISG × Instituto"
      : "Escutar. Compreender. Agir. · ISG × Instituto";
    document.documentElement.lang = "pt-BR";
    return () => {
      document.title = title;
      document.documentElement.lang = lang;
      if (!existing) robots.remove();
      else if (old === null) robots.removeAttribute("content");
      else robots.content = old;
    };
  }, [consoleMode]);
}
