import { createFileRoute } from "@tanstack/react-router";
import { MealsPage } from "@/features/meals/MealsPage";

export const Route = createFileRoute("/meals")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Keep daily nutrition targets, a current meal plan, and reusable food options.",
      },
      { property: "og:title", content: "Meals" },
      {
        property: "og:description",
        content: "A simple personal reference for nutrition targets, meal planning, and food options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MealsPage,
});
