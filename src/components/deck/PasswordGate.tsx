import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface PasswordGateProps {
  segmentLabel: string;
  onUnlock: () => void;
  colorClass: "gold" | "cyan" | "magenta";
}

const colorMap = {
  gold: { gradient: "gradient-gold", glow: "glow-gold", textGradient: "text-gradient-gold" },
  cyan: { gradient: "gradient-cyan", glow: "glow-cyan", textGradient: "text-gradient-cyan" },
  magenta: { gradient: "gradient-magenta", glow: "glow-magenta", textGradient: "text-gradient-magenta" },
};

const passwords: Record<string, string> = {
  "setor-publico": "felicidadepublica",
  "setor-privado": "felicidadeempresarial",
  "sociedade-civil": "felicidadecivil",
};

export function PasswordGate({ segmentLabel, onUnlock, colorClass }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colors = colorMap[colorClass];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check against all passwords to find matching segment
    const segmentKey = Object.keys(passwords).find(
      (key) => segmentLabel.toLowerCase().includes(key.replace("-", " ").replace("setor ", "")) || key === segmentLabel
    );

    // Simple match: try the password against the segment's expected password
    const expectedPassword = passwords[segmentKey || ""] || "";
    if (password.trim().toLowerCase() === expectedPassword) {
      onUnlock();
    } else {
      // Also try matching directly
      if (Object.values(passwords).includes(password.trim().toLowerCase())) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      {/* Background halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-strong rounded-2xl p-10 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${colors.gradient} flex items-center justify-center ${colors.glow}`}
          >
            <Lock className="w-7 h-7 text-primary-foreground" />
          </motion.div>

          <h1 className={`font-display text-2xl font-bold mb-2 ${colors.textGradient}`}>
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Insira a senha para acessar a apresentação<br />
            <span className="font-heading font-semibold text-foreground/80">{segmentLabel}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de acesso"
                className={`w-full bg-muted/50 border rounded-lg px-4 py-3 pr-12 text-foreground font-body text-sm focus:ring-1 outline-none transition-colors ${
                  error
                    ? "border-destructive focus:border-destructive focus:ring-destructive"
                    : "border-border focus:border-primary focus:ring-ring"
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs font-heading"
              >
                Senha incorreta. Tente novamente.
              </motion.p>
            )}

            <button
              type="submit"
              className={`w-full ${colors.gradient} text-primary-foreground font-heading font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
            >
              Acessar apresentação
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-6">
            Solicite a senha ao representante do Instituto Felicidade para Todos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export { passwords };
