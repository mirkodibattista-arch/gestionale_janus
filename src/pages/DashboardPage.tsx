import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardWelcome } from "../modules/dashboard/components/DashboardWelcome";
import { EnrollmentChart } from "../modules/dashboard/components/EnrollmentChart";
import { KpiGrid } from "../modules/dashboard/components/KpiGrid";
import { PriorityTasks } from "../modules/dashboard/components/PriorityTasks";
import { RecentActivity } from "../modules/dashboard/components/RecentActivity";
import type { AuthSession } from "../modules/auth/types";

export function DashboardPage({ session }: { session: AuthSession }) {
  return (
    <DashboardLayout session={session}>
      <DashboardWelcome session={session} />
      <KpiGrid role={session.role} />
      <div className="dash-panels">
        <EnrollmentChart role={session.role} />
        <RecentActivity role={session.role} />
      </div>
      <PriorityTasks role={session.role} />
    </DashboardLayout>
  );
}
