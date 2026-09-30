import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { submitFeedback } from '../../services/realtimeService';
import OrderTimeline, { getStatusColor, getStatusLabel } from '../../components/OrderTimeline';
import LiveBadge from '../../components/LiveBadge';
import type { Order } from '../../types';
import { ArrowLeft, Clock, Ticket, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOrder({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!user || !profile || !order || rating === 0) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback({
        userId: user.uid,
        userName: profile.name,
        orderId: order.id,
        rating,
        comment,
      });
      setFeedbackSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 font-medium">Order not found</p>
        <button onClick={() => navigate('/student/orders')} className="mt-4 text-blue-600 text-sm font-medium">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/student/orders')} className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Order Details</h1>
          <LiveBadge updatedAt={order.updatedAt} />
        </div>
      </div>

      {/* Token Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
        <Ticket className="w-6 h-6 mx-auto mb-2 opacity-80" />
        <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Your Token</p>
        <p className="text-4xl font-bold">{order.tokenNumber}</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/20`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Order Progress</h3>
        <OrderTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Items</h3>
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-slate-600">
                {item.quantity}× {item.name}
              </span>
              <span className="text-slate-800 font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-800">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Order Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID</span>
            <span className="text-slate-700 font-mono text-xs">{order.id.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Placed At</span>
            <span className="text-slate-700">{order.createdAt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Est. Time</span>
            <span className="text-slate-700">{order.estimatedTime} min</span>
          </div>
        </div>
      </div>

      {/* Feedback (only for completed orders) */}
      {order.status === 'completed' && !feedbackSubmitted && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Rate Your Experience</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your feedback (optional)"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={rating === 0 || submittingFeedback}
            className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit Feedback
          </button>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-green-700 font-medium text-sm">Thank you for your feedback! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
