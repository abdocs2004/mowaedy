import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { AppointmentsManager } from '../../components/shared/AppointmentsManager.jsx';

export default function AdminAppointmentsPage() {
  return (<><PageHeader title="المواعيد" description="جميع المواعيد عبر المنصة" /><AppointmentsManager basePath="/admin/appointments" admin /></>);
}
