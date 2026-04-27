import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional role gate. If provided, user must have one of the roles. */
  requireRole?: ("admin" | "gestor" | "colaborador")[];
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && !roles.some((r) => requireRole.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
