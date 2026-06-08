import { useEffect, useState } from "react";

const COINS_KEY = "ift_coins_v1";
const MISSIONS_KEY = "ift_missions_v1";

interface Store {
  coins: number;
  completed: string[]; // mission ids
}

function read(): Store {
  if (typeof window === "undefined") return { coins: 0, completed: [] };
  try {
    const coins = Number(localStorage.getItem(COINS_KEY) ?? "0");
    const completed = JSON.parse(localStorage.getItem(MISSIONS_KEY) ?? "[]");
    return { coins: Number.isFinite(coins) ? coins : 0, completed: Array.isArray(completed) ? completed : [] };
  } catch {
    return { coins: 0, completed: [] };
  }
}

function write(s: Store) {
  localStorage.setItem(COINS_KEY, String(s.coins));
  localStorage.setItem(MISSIONS_KEY, JSON.stringify(s.completed));
  window.dispatchEvent(new CustomEvent("ift-coins:change"));
}

export function useIftCoins() {
  const [store, setStore] = useState<Store>(() => read());

  useEffect(() => {
    const sync = () => setStore(read());
    window.addEventListener("ift-coins:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ift-coins:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const completeMission = (id: string, reward: number) => {
    const s = read();
    if (s.completed.includes(id)) return false;
    write({ coins: s.coins + reward, completed: [...s.completed, id] });
    return true;
  };

  const resetMission = (id: string, reward: number) => {
    const s = read();
    if (!s.completed.includes(id)) return;
    write({ coins: Math.max(0, s.coins - reward), completed: s.completed.filter((m) => m !== id) });
  };

  const isCompleted = (id: string) => store.completed.includes(id);

  return {
    totalCoins: store.coins,
    completedMissions: store.completed,
    completedMissionsCount: store.completed.length,
    completeMission,
    resetMission,
    isCompleted,
  };
}
