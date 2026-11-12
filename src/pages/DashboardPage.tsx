import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardWelcome } from "../modules/dashboard/components/DashboardWelcome";
import { EnrollmentChart } from "../modules/dashboard/components/EnrollmentChart";
import { KpiGrid } from "../modules/dashboard/components/KpiGrid";
import { PriorityTasks } from "../modules/dashboard/components/PriorityTasks";
import { RecentActivity } from "../modules/dashboard/components/RecentActivity";
import type { Role } from "../types/roles";

export function DashboardPage({ onExit }: { onExit: () => void }) {
  const [role, setRole] = useState<Role>("Admin");
  return (
    <DashboardLayout>
      <DashboardWelcome role={role} onRoleChange={setRole} onExit={onExit} />
      <KpiGrid role={role} />
      <div className="dash-panels">
        <EnrollmentChart />
        <RecentActivity />
      </div>
      <PriorityTasks />
    </DashboardLayout>
  );
}
