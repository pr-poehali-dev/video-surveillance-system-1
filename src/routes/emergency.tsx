import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import AuthPending from "@/components/AuthPending";
const Emergency = lazy(() => import("@/pages/Emergency"));

export const Route = createFileRoute("/emergency")({
  ssr: false,
  pendingComponent: AuthPending,
  component: Page,
});

function Page() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={null}>
        <Emergency />
      </Suspense>
    </AuthenticatedLayout>
  );
}
