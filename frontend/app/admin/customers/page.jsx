'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, UserX } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 20, search: search || undefined });
      setUsers(data.users);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${user.name} ${newRole}?`)) return;
    try {
      await adminAPI.updateUserRole(user._id, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  return (
    <div className="text-white space-y-5">
      <div>
        <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Users</p>
        <h1 className="font-serif text-2xl font-light">Customers</h1>
        <p className="text-[0.72rem] text-white/30 mt-1">{total} total registered users</p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-[#1a1816] border border-gold/10 rounded-sm pl-9 pr-4 py-2.5 text-[0.82rem] text-white placeholder:text-white/25 outline-none focus:border-gold/30" />
      </div>

      <div className="bg-[#1a1816] border border-gold/10 rounded overflow-hidden">
        {loading ? <div className="py-16 text-center text-white/20 text-sm">Loading customers...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[0.62rem] tracking-[0.14em] uppercase text-white/25 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-serif text-gold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-[0.78rem] text-white/70">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[0.75rem] text-white/40">{user.email}</td>
                    <td className="px-5 py-3.5 text-[0.75rem] text-white/30">{user.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-sm ${user.role === 'admin' ? 'bg-gold/15 text-gold' : 'bg-white/8 text-white/40'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[0.68rem] text-white/25">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleRoleToggle(user)}
                        className="flex items-center gap-1.5 text-[0.7rem] bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded text-white/40 hover:text-white transition-all">
                        {user.role === 'admin' ? <><UserX size={12} /> Remove Admin</> : <><Shield size={12} /> Make Admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-white/20 text-sm">No customers found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / 20) }).slice(0, 8).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-sm text-xs transition-all ${i + 1 === page ? 'bg-gold text-velvet-black' : 'border border-gold/20 text-white/30 hover:border-gold/40'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
