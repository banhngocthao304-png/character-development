import { createFileRoute } from "@tanstack/react-router";
import { Ruler } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "Body Measurements — a healthier, happier me" },
      {
        name: "description",
        content: "Record your weight and body measurements over time and watch the trend.",
      },
      { property: "og:title", content: "Body Measurements" },
      {
        property: "og:description",
        content: "Record your weight and body measurements over time.",
      },
    ],
  }),
  component: BodyPage,
});

function BodyPage() {
  return (
    <>
      <PageHeader
        icon={<Ruler className="size-7" />}
        title="Body Measurements"
        subtitle="Progress, not perfection"
      />
      <Card>
        <EmptyState
          title="Measurements are coming next"
          description="This section is being built right now."
        />
      </Card>
    </>
  );
}
