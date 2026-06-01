'use client';
// ─── QR Payments page ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { paymentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QRPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsAPI.getPendingQR();
      setPayments(data.payments);
    } catch { toast.error('Failed to load QR payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id) => {
    setProcessing(id);
    try {
      await paymentsAPI.approveQR(id, { note: 'Verified by admin' });
      toast.success('Payment approved — order confirmed!');
      fetch();
    } catch { toast.error('Approval failed'); }
    finally { setProcessing(null); }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason (optional):') || 'Payment could not be verified';
    setProcessing(id);
    try {
      await paymentsAPI.rejectQR(id, { reason });
      toast.success('Payment rejected');
      fetch();
    } catch { toast.error('Rejection failed'); }
    finally { setProcessing(null); }
  };

  return (
    <div className="text-white space-y-5">
      <div>
        <p className="text-[0.62rem] tracking-[0.2em] uppercase text-gold/60 mb-1">✦ Payments</p>
        <h1 className="font-serif text-2xl font-light">QR Payment Approvals</h1>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-36 bg-[#1a1816] rounded animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="bg-[#1a1816] border border-gold/10 rounded py-16 text-center">
          <CheckCircle size={36} className="text-green-500/40 mx-auto mb-3" />
          <p className="text-white/30 text-sm">All caught up! No pending QR payments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-[#1a1816] border border-gold/10 rounded p-5">
              <div className="flex flex-wrap gap-5">
                {/* Screenshot */}
                <div className="w-24 h-28 bg-white/5 rounded overflow-hidden flex-shrink-0 relative">
                  {payment.screenshotUrl ? (
                    <Image src={payment.screenshotUrl} alt="Payment screenshot" fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 text-xs text-center px-2">No screenshot</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[0.75rem] text-white/40">Order</p>
                      <p className="font-medium text-gold">#{payment.order?.orderId}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[0.65rem] px-2 py-1 rounded-sm">
                      <Clock size={11} /> Pending
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[0.65rem] text-white/30">Customer</p>
                      <p className="text-[0.78rem] text-white/70">{payment.user?.name}</p>
                      <p className="text-[0.65rem] text-white/40">{payment.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-white/30">Amount</p>
                      <p className="font-serif text-base text-gold">₹{Number(payment.amount).toLocaleString('en-IN')}</p>
                    </div>
                    {payment.utrNumber && (
                      <div>
                        <p className="text-[0.65rem] text-white/30">UTR / Ref</p>
                        <p className="text-[0.75rem] text-white/60 font-mono">{payment.utrNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[0.65rem] text-white/30">Submitted</p>
                      <p className="text-[0.72rem] text-white/40">
                        {new Date(payment.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => approve(payment._id)} disabled={!!processing}
                      className="flex items-center gap-2 bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 rounded-sm px-4 py-2 text-[0.75rem] transition-colors">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => reject(payment._id)} disabled={!!processing}
                      className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 rounded-sm px-4 py-2 text-[0.75rem] transition-colors">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
