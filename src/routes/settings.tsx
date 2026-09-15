import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle, FieldLabel, PageHeader, Skeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { currentUserId, fetchPtSettings } from "@/features/pt/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — a healthier, happier me" },
      {
        name: "description",
        content: "Set your PT package size and period start day, and manage your account.",
      },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Set your PT package size and period start day." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ["pt-settings"], queryFn: fetchPtSettings });

  const [sessions, setSessions] = useState<string | null>(null);
  const [startDay, setStartDay] = useState<string | null>(null);

  const sessionsValue = sessions ?? String(settingsQuery.data?.sessions_per_period ?? 16);
  const startDayValue = startDay ?? String(settingsQuery.data?.period_start_day ?? 15);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const userId = await currentUserId();
      const { error } = await supabase
        .from("pt_settings")
        .update({
          sessions_per_period: Math.max(1, Math.round(Number(sessionsValue) || 16)),
          period_start_day: Math.min(28, Math.max(1, Math.round(Number(startDayValue) || 15))),
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["pt-settings"] });
    },
    onError: () => toast.error("Couldn't save your settings. Please try again."),
  });

  return (
    <>
      <PageHeader
        icon={<SettingsIcon className="size-7" />}
        title="Settings"
        subtitle="Make it yours"
      />
      <Card className="max-w-xl">
        <CardTitle>PT package</CardTitle>
        {settingsQuery.isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="sessions">Sessions per period</FieldLabel>
              <Input
                id="sessions"
                inputMode="numeric"
                value={sessionsValue}
                onChange={(e) => setSessions(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="start-day" hint="(day of the month a new period begins)">
                Period start day
              </FieldLabel>
              <Input
                id="start-day"
                inputMode="numeric"
                value={startDayValue}
                onChange={(e) => setStartDay(e.target.value)}
              />
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Save changes
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
