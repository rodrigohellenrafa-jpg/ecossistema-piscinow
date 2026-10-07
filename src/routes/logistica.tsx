import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/logistica")({
  beforeLoad: () => {
    throw redirect({ to: "/ordens" });
  },
  component: () => null,
});
