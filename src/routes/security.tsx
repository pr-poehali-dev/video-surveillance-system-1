import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import AuthPending from "@/components/AuthPending";
const Security = lazy(() => import("@/pages/Security"));

export const Route = createFileRoute("/security")({
  ssr: false,
  pendingComponent: AuthPending,
  component: Page,
});

function Page() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={null}>
        <Security />
      </Suspense>
    </AuthenticatedLayout>
  );
}
