'use client';
// ─── Admin Orders Page ────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import { ordersAPI, adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: 'badge-pending', confirmed: 'badge-processing', processing: 'badge-processing',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getAll({ search: search || undefined, status: statusFilter || undefined, limit: 25 });
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [search, statusFilter]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const exportCSV = async () => {
    try {
      const { data } = await adminAPI.exportOrders();
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'velvetcart-orders.csv'; a.click();
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="text-white space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Management</p>
          <h1 className="font-serif text-2xl font-light">Orders</h1>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-gold/25 text-gold text-[0.75rem] px-4 py-2.5 rounded-sm hover:bg-gold/5 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID..."
            className="w-full bg-[#1a1816] border border-gold/10 rounded-sm pl-9 pr-4 py-2.5 text-[0.82rem] text-white placeholder:text-white/25 outline-none focus:border-gold/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1a1816] border border-gold/10 rounded-sm px-4 py-2.5 text-[0.82rem] text-white/60 outline-none focus:border-gold/30">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-[#1a1816] border border-gold/10 rounded overflow-hidden">
        {loading ? <div className="py-16 text-center text-white/25 text-sm">Loading orders...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[0.62rem] tracking-[0.14em] uppercase text-white/25 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3.5 text-[0.78rem] text-gold font-medium">#{order.orderId}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-[0.78rem] text-white/70">{order.user?.name}</p>
                      <p className="text-[0.65rem] text-white/30">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[0.75rem] text-white/40">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3.5 font-serif text-[0.88rem] text-white">₹{Number(order.totalPrice).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-[0.72rem] text-white/40 capitalize">{order.paymentMethod}</td>
                    <td className="px-4 py-3.5">
                      <select value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="bg-transparent border border-white/10 rounded-sm text-[0.72rem] px-2 py-1 text-white/60 outline-none hover:border-gold/30 transition-colors cursor-pointer">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#1a1816] capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-[0.68rem] text-white/30">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-white/20 text-sm">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
