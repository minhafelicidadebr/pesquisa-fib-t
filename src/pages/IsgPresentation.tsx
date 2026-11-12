import { useLocation } from "react-router-dom";
import { PresentationShell } from "@/features/isg-presentation/components/PresentationShell";
import { PresenterConsole } from "@/features/isg-presentation/components/PresenterConsole";
import "@/features/isg-presentation/styles/presentation.css";

export default function IsgPresentation() {
  const { pathname } = useLocation();
  return pathname.endsWith("/console") ? (
    <PresenterConsole />
  ) : (
    <PresentationShell />
  );
}
