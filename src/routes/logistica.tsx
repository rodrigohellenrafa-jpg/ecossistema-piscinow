import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logistica")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/ordens" });
  },
  component: () => null,
});
