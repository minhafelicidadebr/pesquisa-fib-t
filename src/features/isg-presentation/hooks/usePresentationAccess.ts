import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearSession,
  IsgSessionExpired,
  readSession,
} from "@/lib/isgAggregate";
import { validatePresentationAccess } from "../data/presentation-access";

export function usePresentationAccess(onClear: () => void) {
  const [status, setStatus] = useState<
    "checking" | "denied" | "ready" | "unavailable"
  >("checking");
  const [notice, setNotice] = useState("");
  const expiry = useRef(0);
  const clearRef = useRef(onClear);
  clearRef.current = onClear;
  const generation = useRef(0);
  const invalidate = useCallback(() => {
    generation.current += 1;
  }, []);
  const revoke = useCallback(() => {
    generation.current++;
    expiry.current = 0;
    clearRef.current();
    setStatus("denied");
    setNotice("");
  }, []);
  const check = useCallback(async () => {
    const attempt = generation.current;
    if (!readSession()) {
      revoke();
      return false;
    }
    try {
      const validUntil = await validatePresentationAccess();
      if (attempt !== generation.current) return false;
      expiry.current = validUntil;
      setStatus("ready");
      setNotice("");
      return true;
    } catch (error) {
      if (attempt !== generation.current) return false;
      if (error instanceof IsgSessionExpired || expiry.current <= Date.now()) {
        if (error instanceof IsgSessionExpired) revoke();
        else {
          clearRef.current();
          setStatus("unavailable");
        }
      } else
        setNotice(
          "Sem confirmação recente de rede. O retrato já autorizado permanece em memória até o vencimento da sessão; nenhuma atualização foi feita.",
        );
      return false;
    }
  }, [revoke]);
  useEffect(() => {
    let active = true;
    void check();
    const tick = window.setInterval(() => {
      if (!readSession() || (expiry.current && expiry.current <= Date.now()))
        revoke();
    }, 1000);
    const recheck = window.setInterval(() => {
      if (active) void check();
    }, 45000);
    const focus = () => {
      if (active) void check();
    };
    window.addEventListener("focus", focus);
    window.addEventListener("isg-results-session-ended", revoke);
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel("isg-results-lifecycle");
    if (channel)
      channel.onmessage = (e) => {
        if (
          e.data?.type === "session-ended" &&
          Object.keys(e.data).length === 1
        ) {
          clearSession(false);
          revoke();
        }
      };
    return () => {
      active = false;
      invalidate();
      clearInterval(tick);
      clearInterval(recheck);
      window.removeEventListener("focus", focus);
      window.removeEventListener("isg-results-session-ended", revoke);
      channel?.close();
      clearRef.current();
    };
  }, [check, revoke, invalidate]);
  const logout = () => {
    clearSession();
    revoke();
  };
  return { status, notice, check, logout };
}
