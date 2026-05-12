import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, XCircle, Download, Clock, RotateCcw, AlertCircle, Eye, Truck, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';

interface ReturnReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => Promise<void>;
}

const ReturnReviewModal: React.FC<ReturnReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}) => {
  const [requestData, setRequestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchReturnRequest();
    }
  }, [isOpen, orderId]);

  const fetchReturnRequest = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/orders/${orderId}/return`);
      setRequestData(res.data);
    } catch (error) {
      console.error('Error fetching return request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !adminNote) {
      alert('Please provide a reason for rejection in the admin note.');
      return;
    }

    try {
      setIsProcessing(true);
      await axios.patch(`/api/returns/${requestData.id}`, {
        status,
        adminNote,
        adminId: 'admin'
      });
      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing return decision:', error);
      alert('Failed to process decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isPending = requestData?.status === 'requested';
  const isApproved = requestData?.status === 'approved';
  const isRejected = requestData?.status === 'rejected';
  const hasCourier = !!requestData?.courierId;

  const proofImages: string[] = (() => {
    if (!requestData?.proofImages) return [];
    if (Array.isArray(requestData.proofImages)) return requestData.proofImages;
    try { return JSON.parse(requestData.proofImages); } catch { return []; }
  })();

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-dark/5 flex items-center justify-between bg-brand-cream/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <RotateCcw size={20} />
              </div>
              <h2 className="text-3xl font-serif text-brand-dark">Review Return Request</h2>
            </div>
            <div className="flex items-center gap-3 mt-2 ml-13">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/30">
                Audit & Decision Panel • Order ID: {orderId}
              </p>
              {isApproved && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  Approved
                </span>
              )}
              {isRejected && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  Rejected
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-brand-dark/5 flex items-center justify-center text-brand-dark/40 hover:bg-brand-dark hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Loading request data...</p>
            </div>
          ) : requestData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-8">
                {/* Reason */}
                <div className="p-8 bg-brand-cream/20 rounded-[2rem] border border-brand-dark/5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-4">Reason for Return</h3>
                  <p className="text-lg text-brand-dark font-medium leading-relaxed">
                    {requestData.reason}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-brand-dark/5 rounded-[1.5rem]">
                    <div className="flex items-center gap-3 mb-2">
                      <RotateCcw size={16} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Return Method</span>
                    </div>
                    <p className="font-bold text-brand-dark">{requestData.returnMethod || '—'}</p>
                  </div>
                  <div className="p-6 bg-white border border-brand-dark/5 rounded-[1.5rem]">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock size={16} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Requested At</span>
                    </div>
                    <p className="font-bold text-brand-dark">
                      {new Date(requestData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Courier Details (shown after customer submits) */}
                {hasCourier && (
                  <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-200 space-y-5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      Courier Details — Submitted by Customer
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-emerald-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Hash size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Tracking ID</p>
                        <p className="font-bold text-brand-dark mt-0.5 font-mono">{requestData.courierId}</p>
                      </div>
                    </div>
                    {requestData.courierSlip && (
                      <div className="rounded-2xl overflow-hidden border border-emerald-100">
                        {requestData.courierSlip.startsWith('data:image/') ? (
                          <img
                            src={requestData.courierSlip}
                            alt="Courier slip"
                            className="w-full max-h-52 object-contain bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-4 p-5 bg-white">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                              <Download size={18} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-brand-dark">Courier Slip</p>
                              <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mt-0.5">PDF Document</p>
                            </div>
                            <a
                              href={requestData.courierSlip}
                              download="courier_slip"
                              className="px-4 py-2 rounded-xl bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Note (only for pending decisions) */}
                {isPending && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 ml-2">
                      Internal Admin Note / Feedback
                    </h3>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Provide context for approval or reason for rejection (required for rejection)..."
                      className="w-full h-32 p-6 bg-brand-cream/10 border-2 border-brand-dark/5 rounded-[2rem] text-sm focus:outline-none focus:border-brand-gold transition-all resize-none"
                    />
                  </div>
                )}

                {/* Show admin note if already decided */}
                {!isPending && requestData.adminNote && (
                  <div className="p-6 bg-brand-cream/20 rounded-2xl border border-brand-dark/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40 mb-2">Admin Note</p>
                    <p className="text-sm text-brand-dark/70 leading-relaxed">{requestData.adminNote}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Proof */}
              <div className="lg:col-span-5 space-y-8">
                {/* Proof Photos */}
                {proofImages.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-4 ml-2">
                      Proof Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {proofImages.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden border-2 border-brand-dark/5 group"
                        >
                          <img src={img} alt="Proof" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <button className="p-2 bg-white rounded-full text-brand-dark shadow-xl">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Receipt / Proof of Purchase */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-4 ml-2">
                    Receipt / Proof of Purchase
                  </h3>
                  <div className="rounded-3xl overflow-hidden border-2 border-brand-dark/5 shadow-inner">
                    {requestData.paymentProof ? (
                      requestData.paymentProof.startsWith('data:image/') ? (
                        <img
                          src={requestData.paymentProof}
                          alt="Receipt"
                          className="w-full max-h-64 object-cover"
                        />
                      ) : (
                        <div className="flex items-center gap-4 p-6 bg-brand-cream/30">
                          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
                            <Download size={20} className="text-brand-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand-dark">Receipt uploaded</p>
                            <p className="text-[10px] text-brand-dark/40 mt-0.5 uppercase tracking-widest">Non-image file</p>
                          </div>
                          <a
                            href={requestData.paymentProof}
                            download="receipt"
                            className="px-4 py-2 rounded-xl bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                          >
                            Download
                          </a>
                        </div>
                      )
                    ) : (
                      <div className="p-10 bg-brand-cream/50 flex flex-col items-center justify-center text-brand-dark/20">
                        <AlertCircle size={32} />
                        <p className="text-[10px] font-bold mt-2">No Receipt Provided</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Courier slip thumbnail in right column when approved but not yet submitted */}
                {isApproved && !hasCourier && (
                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                    <Truck size={18} className="text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-orange-800">Awaiting Customer Shipment</p>
                      <p className="text-xs text-orange-600 mt-1 leading-relaxed">
                        Return was approved. Customer has been asked to ship the item and submit courier details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center">
              <p className="text-brand-dark/40">No request found for this order.</p>
            </div>
          )}
        </div>

        {/* Footer Actions — only shown for pending decisions */}
        {isPending && (
          <div className="p-8 border-t border-brand-dark/5 bg-brand-cream/5 flex gap-4">
            <button
              onClick={() => handleDecision('approved')}
              disabled={isProcessing || !requestData}
              className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              {isProcessing ? 'Processing...' : 'Approve Return'}
            </button>
            <button
              onClick={() => handleDecision('rejected')}
              disabled={isProcessing || !requestData}
              className="flex-1 h-14 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject Return Request
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ReturnReviewModal;
