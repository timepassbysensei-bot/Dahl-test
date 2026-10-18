import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  FileText,
  Bell,
  Calendar,
  Clock,
  Settings,
  GraduationCap,
  Image,
  FolderOpen,
  MessageSquare,
  Mail,
  Award,
  Cake,
  MessageCircle,
  Globe,
  Palette,
  ImageIcon,
  Bookmark,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Briefcase,
  DoorOpen,
  UserCheck,
  Megaphone,
  Shield,
  Loader2,
  CheckCircle,
  Eye,
  Home,
  LayoutDashboard,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface DashboardStats {
  pendingRegistrations: number;
  unreadMessages: number;
  pendingLeaveRequests: number;
  studentOfMonthSubmissions: number;
  newEnquiries: number;
  unreadNotices: number;
}

interface ModuleButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  to: string;
  badge?: number;
  badgeColor?: string;
  onClick?: () => void;
}

const ModuleButton = ({ icon, label, description, to, badge, badgeColor = 'bg-red-500', onClick }: ModuleButtonProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 active:scale-95">
      <div className="relative mb-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-700">
          {icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span className={`absolute -top-1 -right-1 ${badgeColor} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-gray-800 text-center leading-tight">{label}</span>
      {description && (
        <span className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{description}</span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  );
};

const SummaryCard = ({ title, count, icon, to, color }: { title: string; count: number; icon: React.ReactNode; to: string; color: string }) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
  >
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-sm text-gray-600 truncate">{title}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </Link>
);

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['principal-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        pendingRegistrations,
        unreadMessages,
        pendingLeaveRequests,
        studentOfMonth,
        newEnquiries,
        unreadNotices,
      ] = await Promise.all([
        supabase.from('teacher_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('parent_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('student_of_month').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('notices').select('id', { count: 'exact', head: true }).eq('is_read', false).eq('target', 'principal'),
      ]);

      return {
        pendingRegistrations: pendingRegistrations.count || 0,
        unreadMessages: unreadMessages.count || 0,
        pendingLeaveRequests: pendingLeaveRequests.count || 0,
        studentOfMonthSubmissions: studentOfMonth.count || 0,
        newEnquiries: newEnquiries.count || 0,
        unreadNotices: unreadNotices.count || 0,
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleTeacherDashboard = () => {
    navigate('/teacher');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    navigate('/auth/login');
    return null;
  }

  const modules: ModuleButtonProps[] = [
    { icon: <Users size={24} />, label: 'Pending Registrations', to: '/principal/registrations', badge: stats?.pendingRegistrations },
    { icon: <Briefcase size={24} />, label: 'Staff Roster', to: '/principal/staff' },
    { icon: <FileText size={24} />, label: 'Internal Notices', to: '/principal/notices/internal' },
    { icon: <Megaphone size={24} />, label: 'Public Notices', to: '/principal/notices/public' },
    { icon: <ClipboardList size={24} />, label: 'All Class Notices', to: '/principal/notices/class' },
    { icon: <BookOpen size={24} />, label: 'All Homework', to: '/principal/homework' },
    { icon: <Mail size={24} />, label: 'Leave Inbox', to: '/principal/leave', badge: stats?.pendingLeaveRequests },
    { icon: <Clock size={24} />, label: 'Timing Manager', to: '/principal/timings' },
    { icon: <AlertTriangle size={24} />, label: 'Emergency Alert', to: '/principal/emergency', badgeColor: 'bg-amber-500' },
    { icon: <Settings size={24} />, label: 'School Settings', to: '/principal/settings' },
    { icon: <GraduationCap size={24} />, label: 'Class & Section Manager', to: '/principal/classes' },
    { icon: <UserCheck size={24} />, label: 'Teacher Assignments', to: '/principal/assignments' },
    { icon: <Image size={24} />, label: 'Gallery Manager', to: '/principal/gallery' },
    { icon: <FolderOpen size={24} />, label: 'Media Library', to: '/principal/media' },
    { icon: <Bookmark size={24} />, label: 'Resources Manager', to: '/principal/resources' },
    { icon: <MessageSquare size={24} />, label: 'Parent Messages', to: '/principal/messages', badge: stats?.unreadMessages },
    { icon: <Mail size={24} />, label: 'Admission Enquiries', to: '/principal/enquiries', badge: stats?.newEnquiries },
    { icon: <Calendar size={24} />, label: 'Calendar', to: '/principal/calendar' },
    { icon: <Award size={24} />, label: 'Achievements', to: '/principal/achievements' },
    { icon: <CheckCircle size={24} />, label: 'Student of Month', to: '/principal/student-of-month', badge: stats?.studentOfMonthSubmissions },
    { icon: <Cake size={24} />, label: 'Birthday Management', to: '/principal/birthdays' },
    { icon: <MessageCircle size={24} />, label: 'Chatbot FAQs', to: '/principal/faqs' },
    { icon: <Globe size={24} />, label: 'Website Content', to: '/principal/website' },
    { icon: <Palette size={24} />, label: 'Branding', to: '/principal/branding' },
    { icon: <ImageIcon size={24} />, label: 'Change Logo', to: '/principal/logo' },
    { icon: <Bookmark size={24} />, label: 'Change Favicon', to: '/principal/favicon' },
    { icon: <Shield size={24} />, label: 'Audit Log', to: '/principal/audit' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <Link to="/principal" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900">View Point Public School</h1>
                  <p className="text-xs text-blue-700 font-medium">Principal Dashboard</p>
                </div>
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleTeacherDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                <LayoutDashboard size={18} />
                Teacher Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={handleTeacherDashboard}
                className="flex items-center gap-3 w-full px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                <LayoutDashboard size={20} />
                Teacher Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile.full_name || 'Principal'}</h2>
          <p className="text-gray-600 mt-1">Manage your school's operations and content</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard
                title="Pending Registrations"
                count={stats?.pendingRegistrations || 0}
                icon={<Users size={24} />}
                to="/principal/registrations"
                color="bg-blue-600"
              />
              <SummaryCard
                title="Unread Messages"
                count={stats?.unreadMessages || 0}
                icon={<MessageSquare size={24} />}
                to="/principal/messages"
                color="bg-purple-600"
              />
              <SummaryCard
                title="Pending Leave Requests"
                count={stats?.pendingLeaveRequests || 0}
                icon={<Mail size={24} />}
                to="/principal/leave"
                color="bg-amber-600"
              />
              <SummaryCard
                title="Student of Month"
                count={stats?.studentOfMonthSubmissions || 0}
                icon={<CheckCircle size={24} />}
                to="/principal/student-of-month"
                color="bg-green-600"
              />
              <SummaryCard
                title="New Enquiries"
                count={stats?.newEnquiries || 0}
                icon={<Mail size={24} />}
                to="/principal/enquiries"
                color="bg-teal-600"
              />
              <SummaryCard
                title="Unread Notices"
                count={stats?.unreadNotices || 0}
                icon={<Bell size={24} />}
                to="/principal/notices"
                color="bg-rose-600"
              />
            </div>
          )}
        </div>

        {/* Module Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Management Modules</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {modules.map((module, index) => (
              <ModuleButton
                key={index}
                icon={module.icon}
                label={module.label}
                to={module.to}
                badge={module.badge}
                badgeColor={module.badgeColor}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-
