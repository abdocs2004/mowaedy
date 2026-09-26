import { Building2, Dumbbell, Scissors, Stethoscope } from 'lucide-react';

export const categoryIcon = (slug) => ({ gym: Dumbbell, barber: Scissors, clinic: Stethoscope })[slug] || Building2;

/** Arabic labels used in provider cards / details for category-specific fields. */
export const providerRoleLabel = (slug) => ({ gym: 'مدرب', barber: 'حلاق', clinic: 'طبيب' })[slug] || 'مقدم خدمة';
