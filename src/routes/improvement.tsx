import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import AuthPending from "@/components/AuthPending";
const Improvement = lazy(() => import("@/pages/Improvement"));

export const Route = createFileRoute("/improvement")({
  ssr: false,
  pendingComponent: AuthPending,
  component: Page,
});

function Page() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={null}>
        <Improvement />
      </Suspense>
    </AuthenticatedLayout>
  );
}
