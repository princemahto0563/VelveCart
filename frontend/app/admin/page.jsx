'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, Users, Package, AlertCircle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function StatCard({ label, value, change, positive, icon: Icon, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1816] border border-gold/10 rounded p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${color}`} />
      <div className="flex items-start justify-between mb-4">
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-white/35">{label}</p>
        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/40">
          <Icon size={15} />
        </div>
      </div>
      <p className="font-serif text-2xl text-white mb-1">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-[0.68rem] ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </div>
      )}
    </motion.div>
  );
}

const STATUS_STYLES = {
  pending: 'badge-pending', confirmed: 'badge-processing', processing: 'badge-processing',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1816] border border-gold/20 rounded px-3 py-2 text-[0.75rem]">
        <p className="text-white/50 mb-1">{label}</p>
        <p className="text-gold font-medium">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data: res }) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-[#1a1816] rounded animate-pulse" />)}
      </div>
      <div className="h-64 bg-[#1a1816] rounded animate-pulse" />
    </div>
  );

  const { stats, recentOrders = [], topProducts = [], revenueChart = [] } = data || {};

  const monthGrowth = stats?.lastMonthRevenue > 0
    ? (((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100).toFixed(1)
    : null;

  const chartData = revenueChart.map((d) => ({
    date: new Date(d._id).toLocaleDateString('en-IN', { weekday: 'short' }),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="space-y-5 text-white">
      {/* Page title */}
      <div>
        <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Overview</p>
        <h1 className="font-serif text-2xl font-light">Dashboard</h1>
      </div>

      {/* Alert: pending QR payments */}
      {stats?.pendingQR > 0 && (
        <Link href="/admin/qr-payments"
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded px-4 py-3 text-[0.8rem] text-amber-400 hover:bg-amber-500/15 transition-colors">
          <AlertCircle size={16} />
          <span>{stats.pendingQR} QR payment{stats.pendingQR !== 1 ? 's' : ''} pending verification</span>
          <span className="ml-auto text-[0.72rem]">Review →</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(stats?.totalRevenue || 0)} icon={TrendingUp} color="bg-gold" />
        <StatCard label="This Month" value={fmt(stats?.monthRevenue || 0)}
          change={monthGrowth ? `${monthGrowth > 0 ? '+' : ''}${monthGrowth}% vs last month` : null}
          positive={Number(monthGrowth) > 0} icon={BarChart2 || TrendingUp} color="bg-green-500" />
        <StatCard label="Today's Orders" value={stats?.todayOrders || 0} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard label="Total Customers" value={(stats?.totalUsers || 0).toLocaleString()} icon={Users} color="bg-purple-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Revenue chart */}
        <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[0.8rem] font-medium text-white">Revenue — Last 7 Days</p>
              <p className="text-[0.68rem] text-white/35 mt-0.5">Razorpay + QR payments</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#c9a96e" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/20 text-sm">No data yet</div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-[#1a1816] border border-gold/10 rounded p-5">
          <p className="text-[0.8rem] font-medium text-white mb-4">Top Products</p>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-[0.65rem] text-white/25 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.75rem] text-white/70 truncate">{p.name}</p>
                  <p className="text-[0.65rem] text-white/30">{p.totalSold} units</p>
                </div>
                <p className="text-[0.75rem] text-gold flex-shrink-0">{fmt(p.revenue)}</p>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-[0.75rem] text-white/25 text-center py-4">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-[#1a1816] border border-gold/10 rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/8">
          <p className="text-[0.8rem] font-medium">Recent Orders</p>
          <Link href="/admin/orders" className="text-[0.72rem] text-gold hover:text-gold-light transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID', 'Customer', 'Amount', 'Payment', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[0.62rem] tracking-[0.14em] uppercase text-white/25 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 text-[0.78rem] text-gold">#{order.orderId}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-[0.78rem] text-white/70">{order.user?.name}</p>
                    <p className="text-[0.65rem] text-white/30">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-serif text-[0.88rem] text-white">{fmt(order.totalPrice)}</td>
                  <td className="px-5 py-3.5 text-[0.72rem] text-white/40 capitalize">{order.paymentMethod}</td>
                  <td className="px-5 py-3.5">
                    <span className={STATUS_STYLES[order.status] || 'badge-pending'}>{order.status}</span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[0.78rem] text-white/20">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
