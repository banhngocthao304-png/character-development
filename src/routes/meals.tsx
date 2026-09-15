import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/meals")({
  head: () => ({
    meta: [
      { title: "Meals — a healthier, happier me" },
      {
        name: "description",
        content: "Plan what you'll cook each day and keep your personal recipe library.",
      },
      { property: "og:title", content: "Meals" },
      {
        property: "og:description",
        content: "Plan what you'll cook each day and keep your personal recipe library.",
      },
    ],
  }),
  component: MealsPage,
});

function MealsPage() {
  return (
    <>
      <PageHeader
        icon={<UtensilsCrossed className="size-7" />}
        title="Meals"
        subtitle="Plan it, cook it, love it"
      />
      <Card>
        <EmptyState
          title="Plan and Recipes are coming next"
          description="This section is being built right now."
        />
      </Card>
    </>
  );
}
