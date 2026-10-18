<think>The user wants me to create a complete production-ready PublicLayout.tsx file for the View Point Public School application. This is a React/TypeScript component using Tailwind CSS, React Router, and Supabase.

Let me analyze the requirements:

1. Responsive public website layout
2. Dynamic Emergency Alert bar
3. Announcement bar
4. Header with EN/HI language toggle
5. Logo
6. Navigation links
7. FAQ Chatbot widget
8. Dynamic Footer

I need to create a comprehensive layout component that includes all these features. Let me structure this properly:

1. Emergency Alert Bar - should be dismissible, show when there's an active alert
2. Announcement Bar - optional announcements
3. Header - logo, school name, navigation, language toggle, mobile menu
4. Main content area
5. FAQ Chatbot widget - floating button that opens a chat
6. Footer - logo, description, contact info, quick links, social links, legal links, current year

I'll need to:
- Use React Router for navigation
- Use Lucide icons
- Use Supabase for fetching alerts and announcements
- Create a mobile-responsive design
- Implement the language toggle functionality
- Create a chatbot widget

Let me write the complete code:

```tsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Bell, Mail, Phone, MapPin, Calendar, BookOpen, Users, Award, Image, FileText, MessageSquare, ChevronRight, Facebook, Twitter, Instagram, Youtube, Linkedin, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface EmergencyAlert {
  id: string;
  title: string;
  title_hi: string;
  message: string;
  message_hi: string;
  is_active: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  title_hi: string;
  message: string;
  message_hi: string;
  is_active: boolean;
  link_url?: string;
  created_at: string;
}

interface SchoolSettings {
  school_name: string;
  school_name_hi: string;
  address: string;
  phone: string;
  email: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  logo_url?: string;
  favicon_url?: string;
}

const publicNavItems = [
  { path: '/', label: 'Home', labelHi: 'होम' },
  { path: '/about', label: 'About', labelHi: 'हमारे बारे में' },
  { path: '/academics', label: 'Academics', labelHi: 'शिक्षा' },
  { path: '/admissions', label: 'Admissions', labelHi: 'प्रवेश' },
  { path: '/notices', label: 'Notices', labelHi: 'सूचनाएं' },
  { path: '/gallery', label: 'Gallery', labelHi: 'गैलरी' },
  { path: '/achievements', label: 'Achievements', labelHi: 'उपलब्धियां' },
  { path: '/contact', label: 'Contact', labelHi: 'संपर्क' },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyAlertDismissed, setEmergencyAlertDismissed] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch emergency alerts
  const { data: emergencyAlerts } = useQuery({
    queryKey: ['emergency-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as EmergencyAlert[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as Announcement[];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch school settings
  const { data: schoolSettings } = useQuery({
    queryKey: ['school-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as SchoolSettings;
    },
  });

  const activeEmergencyAlert = emergencyAlerts?.[0];
  const activeAnnouncement = announcements?.[0];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Emergency Alert Bar */}
      {activeEmergencyAlert && !emergencyAlertDismissed && (
        <div className="bg-red-600 text-white py-2 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {language === 'en' ? activeEmergencyAlert.title : activeEmergencyAlert.title_hi}
              </span>
            </div>
            <button
              onClick={() => setEmergencyAlertDismissed(true)}
              className="p-1 hover:bg-red-700 rounded"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Announcement Bar */}
      {activeAnnouncement && !announcementDismissed && (
        <div className="bg-blue-600 text-white py-2 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span>
                {language === 'en' ? activeAnnouncement.message : activeAnnouncement.message_hi}
              </span>
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="p-1 hover:bg-blue-700 rounded"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and School Name */}
            <Link to="/" className="flex items-center gap-3">
              {schoolSettings?.logo_url ? (
                <img
                  src={schoolSettings.logo_url}
                  alt={schoolSettings.school_name || 'View Point Public School'}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  VP
                </div>
              )}
              <span className="font-semibold text-gray-900 hidden sm:block">
                {schoolSettings?.school_name || 'View Point Public School'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-blue-600',
                    location.pathname === item.path
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  )}
                >
                  {language === 'en' ? item.label : item.labelHi}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Toggle language"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'en' ? 'EN' : 'हिं'}</span>
              </button>

              {/* Teacher Login */}
              <Link
                to="/teacher/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Teacher Login
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {language === 'en' ? item.label : item.labelHi}
                </Link>
              ))}
              <Link
                to="/teacher/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Teacher Login
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {schoolSettings?.logo_url ? (
                  <img
                    src={schoolSettings.logo_url}
                    alt={schoolSettings.school_name || 'View Point Public School'}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    VP
                  </div>
                )}
                <span className="font-semibold text-white">
                  {schoolSettings?.school_name || 'View Point Public School'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Providing quality education and nurturing young minds since establishment.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {schoolSettings?.facebook_url && (
                  <a
                    href={schoolSettings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {schoolSettings?.twitter_url && (
                  <a
                    href={schoolSettings.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {schoolSettings?.instagram_url && (
                  <a
                    href={schoolSettings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {schoolSettings?.youtube_url && (
                  <a
                    href={schoolSettings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {schoolSettings?.linkedin_url && (
                  <a
                    href={schoolSettings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/academics" className="text-sm hover:text-white transition-colors">
                    Academics
                  </Link>
                </li>
                <li>
                  <Link to="/admissions" className="text-sm hover:text-white transition-colors">
                    Admissions
                  </Link>
                </li>
                <li>
                  <Link to="/notices" className="text-sm hover:text-white transition-colors">
                    Notices
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="text-sm hover:text-white transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact Info</h3>
              <ul className="space-y-3">
                {schoolSettings?.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{schoolSettings.address}</span>
                  </li>
                )}
                {schoolSettings?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${schoolSettings.phone}`} className="text-sm hover:text-white">
                      {schoolSettings.phone}
                    </a>
                  </li>
                )}
                {schoolSettings?.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href={`mailto:${schoolSettings.email}`} className="text-sm hover:text-white">
                      {schoolSettings.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Useful Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/resources" className="text-sm hover:text-white transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-sm hover:text-white transition-colors">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/teacher/login" className="text-sm hover:text-white transition-colors">
                    Teacher Login
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="text-sm hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {schoolSettings?.school_name || 'View Point Public School'}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions"