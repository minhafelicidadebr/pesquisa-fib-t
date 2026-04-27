import { Link } from "react-router-dom";
import { LogIn, User as UserIcon, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Auth state widget for the navbar — shows "Entrar" or avatar+menu. */
export function AuthMenu() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-foreground/80 hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-foreground/5"
      >
        <LogIn className="w-4 h-4" />
        Entrar
      </Link>
    );
  }

  const displayName = profile?.full_name ?? user.email ?? "Usuário";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-full">
        <Avatar className="w-9 h-9 border border-brand-gold/30 hover:border-brand-gold/60 transition-colors">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="bg-brand-gold/15 text-brand-gold font-heading font-bold text-xs">
            {initials || <UserIcon className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card-strong border-border/40">
        <DropdownMenuLabel className="font-body">
          <p className="text-sm font-heading font-bold text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem asChild>
          <Link to="/perfil" className="cursor-pointer font-heading">
            <UserIcon className="w-4 h-4 mr-2" />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive font-heading"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
