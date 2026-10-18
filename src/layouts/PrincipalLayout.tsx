import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Megaphone,
  BookOpen,
  CalendarDays,
  Clock,
  AlertTriangle,
  Settings,
  School,
  UserCog,
  Images,
  Library,
  MessageSquare,
  Inbox,
  Trophy,
  Star,
  Cake,
  Bot,
  Globe,
  Palette,
  LogOut,
  Menu,
  X,
  ArrowLeftRight,
  Bell,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badgeKey?: 'pendingRegistrations' | 'unreadMessages' | 'pendingLeave' | 'pendingStudentOfMonth' | 'newEnquiries';
  end?: boolean;
}

const principalNav: NavItem[] = [
  { label: 'Overview', to: '/principal', icon: LayoutDashboard, end: true },
  { label: 'Pending Registrations', to: '/principal/registrations', icon: Users, badgeKey: 'pendingRegistrations' },
  { label: 'Staff Roster', to: '/principal/staff', icon: UserCog },
  { label: 'Internal Notices', to: '/principal/notices/internal', icon: Megaphone },
  { label: 'Public Notices', to: '/principal/notices/public', icon: Globe },
  { label: 'All Class Notices', to: '/principal/notices/class', icon: ClipboardList },
  { label: 'All Homework', to: '/principal/homework', icon: BookOpen },
  { label: 'Leave Inbox', to: '/principal/leave', icon: Inbox, badgeKey: 'pendingLeave' },
  { label: 'Timing Manager', to: '/principal/timings', icon: Clock },
  { label: 'Emergency Alert', to: '/principal/emergency', icon: AlertTriangle },
  { label: 'School Settings', to: '/principal/settings', icon: Settings },
  { label: 'Class & Section Manager', to: '/principal/classes', icon: School },
  { label: 'Teacher Assignments', to: '/principal/assignments', icon: UserCog },
  { label: 'Gallery Manager', to: '/principal/gallery', icon: Images },
  { label: 'Media Library', to: '/principal/media', icon: Library },
  { label: 'Resources Manager', to: '/principal/resources', icon: Library },
  { label: 'Parent Messages', to: '/principal/messages', icon: MessageSquare, badgeKey: 'unreadMessages' },
  { label: 'Admission Enquiries', to: '/principal/enquiries', icon: Inbox, badgeKey: 'newEnquiries' },
  { label: 'Calendar', to: '/principal/calendar', icon: CalendarDays },
  { label: 'Achievements', to: '/principal/achievements', icon: Trophy },
  { label: 'Student of the Month Reviews', to: '/principal/student-of-month', icon: Star, badgeKey: 'pendingStudentOfMonth' },
  { label: 'Birthday Management', to: '/principal/birthdays', icon: Cake },
  { label: 'Chatbot FAQs', to: '/principal/chatbot', icon: Bot },
  { label: 'Website Content', to: '/principal/website', icon: Globe },
  { label: 'Branding', to: '/principal/branding', icon: Palette },
  { label: 'Change Logo', to: '/principal/branding/logo', icon: Images },
  { label: 'Change Favicon', to: '/principal/branding/favicon', icon: Images },
  { label: 'Audit Log', to: '/principal/audit', icon: ClipboardList },
];

interface Counts {
  pendingRegistrations: number;
  unreadMessages: number;
  pendingLeave: number;
  pendingStudentOfMonth: number;
  newEnquiries: number;
}

async function fetchCounts(): Promise<Counts> {
  const [
    pendingRegistrations,
    unreadMessages,
    pendingLeave,
    pendingStudentOfMonth,
    newEnquiries,
  ] = await Promise.all([
    supabase.from('teacher_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_role', 'principal').is('read_at', null),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('student_of_month').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('admission_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const errors = [
    pendingRegistrations.error,
    unreadMessages.error,
    pendingLeave.error,
    pendingStudentOfMonth.error,
    newEnquiries.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error('Failed to load notification counts');
  }

  return {
    pendingRegistrations: pendingRegistrations.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
    pendingLeave: pendingLeave.count ?? 0,
    pendingStudentOfMonth: pendingStudentOfMonth.count ?? 0,
    newEnquiries: newEnquiries.count ?? 0,
  };
}

export function PrincipalLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const countsQuery = useQuery({
    queryKey: ['principal', 'counts'],
    queryFn: fetchCounts,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const totalNotifications = countsQuery.data
    ? Object.values(countsQuery.data).reduce((sum, value) => sum + value, 0)
    : 0;

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (active) {
          if (profile && profile.role !== 'principal') {
            navigate('/teacher', { replace: true });
            return;
          }
          setProfileName(profile?.full_name ?? user.email ?? 'Principal');
        }
      } catch {
        if (active) {
          setProfileName('Principal');
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  function handleTeacherDashboard() {
    navigate('/teacher');
  }

  const badgeCount = (key?: string) => {
    if (!key || !countsQuery.data) return 0;
    return countsQuery.data[key as keyof Counts] ?? 0;
  };

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0B2442] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F5B841]">
          <School className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">View Point Public School</p>
          <p className="flex items-center gap-1 text-xs text-[#F5B841]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Principal
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <button
          onClick={handleTeacherDashboard}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D99500] px-4 py-2.5 text-sm font-semibold text-[#0B2442] transition hover:bg-[#E8A700] focus:outline-none focus:ring-2 focus:ring-[#F5B841] focus:ring-offset-2 focus:ring-offset-[#0B2442]"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Teacher Dashboard
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-6">
        {principalNav.map((item) => {
          const Icon = item.icon;
          const count = badgeCount(item.badgeKey);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#F5B841]' : 'text-blue-100/60 group-hover:text-[#F5B841]')} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D99500] px-1.5 text-xs font-bold text-[#0B2442]">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
            {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : profileName?.charAt(0).toUpperCase() ?? 'P'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{profileLoading ? 'Loading…' : profileName}</p>
            <p className="text-xs text-blue-100/60">Principal</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify