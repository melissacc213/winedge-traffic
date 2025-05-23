import { PageHeader } from '../../components/page-header/page-header';
import { TaskDetails } from '../../components/task-dashboard';

export function TaskDetailsPage() {
  return (
    <div>
      <PageHeader
        title="Task Details"
        description="View task details and processing metrics"
      />
      
      <div className="mt-6">
        <TaskDetails />
      </div>
    </div>
  );
}