import { Compass } from 'lucide-react';
import { EmptyState, LinkButton } from '../../components/ui/index.js';

export default function NotFoundPage() {
  return <EmptyState icon={Compass} className="py-28" title="الصفحة غير موجودة" description="الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقله."
    action={<LinkButton to="/">العودة للرئيسية</LinkButton>} />;
}
