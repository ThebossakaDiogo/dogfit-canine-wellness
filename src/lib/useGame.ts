import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MISSIONS, levelInfo, streak, type MissionKind } from "./game";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("kind, day, xp").order("day", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });
}

export function useGame() {
  const q = useActivities();
  const acts = q.data ?? [];
  const xp = acts.reduce((s, a) => s + a.xp, 0);
  const today = todayKey();
  const doneToday = new Set(acts.filter((a) => a.day === today).map((a) => a.kind));
  return { ...q, acts, xp, level: levelInfo(xp), streak: streak(acts.map((a) => a.day)), doneToday };
}

export function useAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kind: MissionKind) => {
      const m = MISSIONS.find((x) => x.kind === kind)!;
      const { error } = await supabase.from("activities").insert({ kind, xp: m.xp, day: todayKey() });
      if (error) {
        if (error.code === "23505") return null; // already done today
        throw error;
      }
      return m;
    },
    onSuccess: (m) => {
      if (m) toast.success(`+${m.xp} XP · ${m.title}`, { icon: "🎉" });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
