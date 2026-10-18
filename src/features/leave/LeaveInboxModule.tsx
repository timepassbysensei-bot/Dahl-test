import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Search,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  teacher: {
    id: string;
    full_name: string;
  } | null;
};

type LeaveStatus = 'pending' | 'approved' | 'rejected';

const decisionSchema = z.object({
  note: z.string().max(500, 'Decision note must be under 500 characters').optional(),
});

type DecisionFormValues = z.infer<typeof decisionSchema>;

const statusStyles: Record<LeaveStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const statusLabels: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function LeaveCard({
  request,
  onDecision,
  isPrincipal,
}: {
  request: LeaveRequest;
  onDecision: (request: LeaveRequest) => void;
  isPrincipal: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {request.teacher?.full_name ?? 'Unknown Teacher'}
            </h3>
            <StatusBadge status={request.status as LeaveStatus} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatDate(request.start_date)} — {formatDate(request.end_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {request.days} day{request.days === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-3 rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-700">{request.reason}</p>
          </div>
          {request.decision_note && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Decision note</p>
              <p className="mt-1 text-sm text-slate-700">{request.decision_note}</p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Submitted {formatDateTime(request.created_at)}</span>
            {request.decided_at && (
              <span>Decided {formatDateTime(request.decided_at)}</span>
            )}
          </div>
        </div>
        {isPrincipal && request.status === 'pending' && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onDecision(request)}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onDecision(request)}
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionModal({
  request,
  decision,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  request: LeaveRequest;
  decision: 'approved' | 'rejected';
  onClose: () => void;
  onSubmit: (values: DecisionFormValues) => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {decision === 'approved' ? 'Approve Leave' : 'Reject Leave'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {request.teacher?.full_name ?? 'Unknown Teacher'} ·{' '}
              {formatDateRange(request.start_date, request.end_date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-sm text-slate-700">{request.reason}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <label htmlFor="decision-note" className="block text-sm font-medium text-slate-700">
            Decision note
          </label>
          <textarea
            id="decision-note"
            rows={4}
            placeholder="Optional note for the teacher"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('note')}
          />
          {errors.note && (
            <p className="mt-1 text-sm text-rose-600">{errors.note.message}</p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${
                decision === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
              }`}
            >
              {isSubmitting
                ? 'Saving…'
                : decision === 'approved'
                  ? 'Approve leave'
                  : 'Reject leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(start);
  }
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export function LeaveInboxModule() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LeaveStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<{
    request: LeaveRequest;
    decision: 'approved' | 'rejected';
  } | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['leave-inbox'],
    queryFn: async () => {
      const { data: leaveRequests, error: queryError } = await supabase
        .from('leave_requests')
        .select('*, teacher:profiles(id, full_name)')
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      return (leaveRequests ?? []) as LeaveRequest[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      note?: string;
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('You must be signed in to make this decision.');
      }

      const { error: updateError } = await supabase
        .from('leave_requests')
        .update({
          status,
          decision_note: note?.trim() || null,
          decided_by: userData.user.id,
          decided_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-inbox'] });
      toast.success('Leave request updated successfully.');
      setModalState(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update leave request.');
    },
  });

  const filteredRequests = (data ?? []).filter((request) => {
    if (filter !== 'all' && request.status !== filter) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      const teacherName = request.teacher?.full_name?.toLowerCase() ?? '';
      const reason = request.reason?.toLowerCase() ?? '';
      if (!teacherName.includes(query) && !reason.includes(query)) return false;
    }
    return true;
  });

  const pendingCount = (data ?? []).filter((r) => r.status === 'pending').length;
  const approvedCount = (data ?? []).filter((r) => r.status === 'approved').length;
  const rejectedCount = (data ?? []).filter((r) => r.status === 'rejected').length;

  const tabs: { key: LeaveStatus | 'all'; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: pendingCount },