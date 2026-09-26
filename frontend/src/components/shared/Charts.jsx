import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatShortDate } from '../../lib/format.js';

const tick = { fontSize: 12, fill: '#64748b', fontFamily: 'Cairo, sans-serif' };
const tip = { borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'Cairo, sans-serif', fontSize: 13, direction: 'rtl' };
export const STATUS_COLORS = { pending: '#f59e0b', confirmed: '#0d6efd', completed: '#10b981', cancelled: '#ef4444' };

/** Recharts renders left-to-right; the wrapper is forced LTR so axes/tooltips behave, text stays Arabic. */
const Box = ({ height, children, label }) => (
  <div dir="ltr" style={{ height }} role="img" aria-label={label}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>{children}</ResponsiveContainer>
  </div>
);

export function TrendChart({ data, height = 280 }) {
  return (
    <Box height={height} label="مخطط عدد المواعيد اليومية">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} /><stop offset="95%" stopColor="#0d6efd" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" tick={tick} tickLine={false} axisLine={false} tickFormatter={(d) => d.slice(5).replace('-', '/')} minTickGap={24} />
        <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tip} labelFormatter={(d) => formatShortDate(`${d}T12:00:00Z`)} formatter={(v, n) => [v, n === 'total' ? 'إجمالي المواعيد' : 'الملغاة']} />
        <Area type="monotone" dataKey="total" stroke="#0d6efd" strokeWidth={2.5} fill="url(#gTotal)" />
        <Area type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} fill="none" />
      </AreaChart>
    </Box>
  );
}

export function StatusDonut({ byStatus, labels, height = 220 }) {
  const data = Object.entries(byStatus).map(([k, v]) => ({ key: k, name: labels[k], value: v })).filter((d) => d.value > 0);
  return (
    <Box height={height} label="توزيع المواعيد حسب الحالة">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
          {data.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
        </Pie>
        <Tooltip contentStyle={tip} />
      </PieChart>
    </Box>
  );
}

export function CategoryBars({ data, height = 220 }) {
  return (
    <Box height={height} label="المواعيد حسب القسم">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={false} />
        <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tip} formatter={(v) => [v, 'المواعيد']} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="count" fill="#0d6efd" radius={[8, 8, 0, 0]} maxBarSize={56} />
      </BarChart>
    </Box>
  );
}
