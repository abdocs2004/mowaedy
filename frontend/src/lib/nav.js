import { CalendarDays, Home, LayoutDashboard, MessagesSquare, Settings2, ShoppingBag, Tag, Users } from 'lucide-react';

export const providerNav = [
  { to: '/provider', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/provider/appointments', label: 'المواعيد', icon: CalendarDays },
  { to: '/provider/services', label: 'الخدمات', icon: ShoppingBag },
  { to: '/provider/profile', label: 'الملف الشخصي', icon: Settings2 },
];

export const adminNav = [
  { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'المواعيد', icon: CalendarDays },
  { to: '/admin/providers', label: 'مقدمو الخدمة', icon: Home },
  { to: '/admin/users', label: 'المستخدمون', icon: Users },
  { to: '/admin/categories', label: 'الأقسام', icon: Tag },
  { to: '/admin/messages', label: 'الرسائل', icon: MessagesSquare },
];
