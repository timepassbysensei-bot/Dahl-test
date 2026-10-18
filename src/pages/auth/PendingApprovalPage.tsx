import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, XCircle, LogOut, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ProfileStatus = 'pending' | 'approved' | 'rejected';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  status: ProfileStatus | null;
  created_at: string | null;
  updated_at: string | null;
}

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, status, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Profile not found');
  }

  return data as Profile;
}

export default function PendingApprovalPage() {
  const navigate = useNavigate();

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: Infinity,
  });

  const userId = sessionQuery.data?.user?.id;

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: Boolean(userId),
    retry: false,
  });

  useEffect(() => {
    if (!sessionQuery.isLoading && !sessionQuery.data) {
      navigate('/teacher-login', { replace: true });
    }
  }, [sessionQuery.isLoading, sessionQuery.data, navigate]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    if (profile.role === 'principal') {
      navigate('/principal/dashboard', { replace: true });
      return;
    }

    if (profile.role === 'teacher' && profile.status === 'approved') {
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [profileQuery.data, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/teacher-login', { replace: true });
  };

  if (sessionQuery.isLoading || (sessionQuery.data && profileQuery.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#12335B]" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Unable to load registration status</h1>
          <p className="mt-2 text-sm text-slate-600">
            {(profileQuery.error as Error)?.message ?? 'Please try again later.'}
          </p>
          <button
            onClick={() => profileQuery.refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#12335B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B2442] focus:outline-none focus:ring-2 focus:ring-[#12335B] focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const status = profile?.status ?? 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isRejected ? 'bg-red-100' : 'bg-amber-100'
            }`}
          >
            {isRejected ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Clock className="h-8 w-8 text-amber-600" />
            )}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            {isRejected ? 'Registration Rejected' : 'Approval Pending'}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {isRejected
              ? 'Your teacher registration was not approved. Please contact the school office for more information.'
              : 'Thank you for registering. Your account is awaiting approval by the Principal. You will be able to access the dashboard once approved.'}
          </p>
        </div>

        <dl className="mt-8 space-y-4 border-t border-slate-100 pt-6 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{profile?.full_name || '—'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{profile?.email || '—'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Status</dt