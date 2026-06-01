'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const COLORS = ['#c9a96e', '#4caf7d', '#5b8dd9', '#d4a0a0', '#a084ca'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1816] border border-gold/20 rounded px-3 py-2 text-[0.75rem] shadow-lg">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === 'revenue' ? fmt(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data: res }) => setData(res))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-white space-y-5">
      <div className="h-8 w-48 bg-[#1a1816] rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1,2,3,4].map(i => <div key={i} className="h-64 bg-[#1a1816] rounded animate-pulse" />)}
      </div>
    </div>
  );

  const { stats = {}, revenueChart = [], topProducts = [] } = data || {};

  const chartData = revenueChart.map((d) => ({
    date: new Date(d._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Math.round(d.revenue),
    orders: d.orders,
  }));

  const categoryData = topProducts.slice(0, 5).map((p, i) => ({
    name: p.name?.split(' ').slice(0, 2).join(' ') || `Product ${i+1}`,
    value: Math.round(p.revenue || 0),
  }));

  const conversionRate = stats.totalOrders && stats.totalUsers
    ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  const avgOrderValue = stats.totalOrders && stats.totalRevenue
    ? Math.round(stats.totalRevenue / stats.totalOrders)
    : 0;

  return (
    <div className="text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Insights</p>
          <h1 className="font-serif text-2xl font-light">Analytics</h1>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-[0.72rem] px-3 py-1.5 rounded-sm border transition-all ${period === p ? 'border-gold text-gold' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.totalRevenue || 0), sub: 'All time' },
          { label: 'Avg Order Value', value: fmt(avgOrderValue), sub: 'Per order' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, sub: 'Orders / Users' },
          { label: 'Total Products', value: stats.totalProducts || 0, sub: 'Active listings' },
        ].map(card => (
          <div key={card.label} className="bg-[#1a1816] border border-gold/10 rounded p-4">
            <p className="text-[0.62rem] tracking-[0.14em] uppercase text-white/30 mb-2">{card.label}</p>
            <p className="font-serif text-2xl text-white">{card.value}</p>
            <p className="text-[0.65rem] text-white/20 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
        <h2 className="text-[0.8rem] font-medium mb-1">Revenue & Orders (Last 7 Days)</h2>
        <p className="text-[0.68rem] text-white/30 mb-5">Daily breakdown from confirmed payments</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c9a96e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf7d" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4caf7d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="revenue" stroke="#c9a96e" strokeWidth={2} fill="url(#revGrad)" />
              <Area yAxisId="ord" type="monotone" dataKey="orders" name="orders" stroke="#4caf7d" strokeWidth={1.5} fill="url(#ordGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/15 text-sm">
            No revenue data yet — orders will appear here
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products Bar Chart */}
        <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
          <h2 className="text-[0.8rem] font-medium mb-5">Top Products by Revenue</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts.slice(0, 5).map(p => ({
                name: p.name?.split(' ').slice(0,2).join(' '),
                revenue: Math.round(p.revenue || 0),
                units: p.totalSold || 0,
              }))} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="revenue" fill="#c9a96e" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/15 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Revenue by category pie */}
        <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
          <h2 className="text-[0.8rem] font-medium mb-5">Revenue Distribution</h2>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie data={categoryData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[0.72rem] text-white/50 truncate max-w-[100px]">{d.name}</span>
                    </div>
                    <span className="text-[0.72rem] text-white/70">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/15 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
        <h2 className="text-[0.8rem] font-medium mb-4">Store Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders || 0, good: true },
            { label: 'Total Customers', value: stats.totalUsers || 0, good: true },
            { label: 'Pending QR Payments', value: stats.pendingQR || 0, good: stats.pendingQR === 0 },
            { label: 'Today\'s Orders', value: stats.todayOrders || 0, good: true },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-white/3 rounded">
              <p className={`font-serif text-2xl ${s.good ? 'text-white' : 'text-amber-400'}`}>{s.value}</p>
              <p className="text-[0.65rem] text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
