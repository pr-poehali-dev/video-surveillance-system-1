import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import AuthPending from "@/components/AuthPending";
const ORD = lazy(() => import("@/pages/ORD"));

export const Route = createFileRoute("/ord")({
  ssr: false,
  pendingComponent: AuthPending,
  component: Page,
});

// Pages pull in leaflet (touches window at import): loaded in the browser only.
function Page() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={null}>
        <ORD />
      </Suspense>
    </AuthenticatedLayout>
  );
}
