import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { AppointmentsManager } from '../../components/shared/AppointmentsManager.jsx';

export default function ProviderAppointmentsPage() {
  return (<><PageHeader title="المواعيد" description="إدارة طلبات الحجز وتحديث حالتها" /><AppointmentsManager basePath="/provider/appointments" /></>);
}
