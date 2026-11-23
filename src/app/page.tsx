import { Suspense } from "react";
import { Dashboard, DashboardSkeleton } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-7">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
