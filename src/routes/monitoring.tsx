import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import AuthPending from "@/components/AuthPending";
const Monitoring = lazy(() => import("@/pages/Monitoring"));

export const Route = createFileRoute("/monitoring")({
  ssr: false,
  pendingComponent: AuthPending,
  component: Page,
});

// Pages pull in leaflet (touches window at import): loaded in the browser only.
function Page() {
  return (
    <AuthenticatedLayout containerClassName="w-full px-0 py-0">
      <Suspense fallback={null}>
        <Monitoring />
      </Suspense>
    </AuthenticatedLayout>
  );
}
