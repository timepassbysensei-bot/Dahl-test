import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare, 
  User, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  priority: z.enum(['normal', 'high']).default('normal'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface SchoolSettings {
  school_name: string;
  school_address: string;
  school_city: string;
  school_state: string;
  school_pincode: string;
  school_phone: string;
  school_phone_2: string;
  school_email: string;
  school_timings: string;
  map_embed_url: string;
  map_enabled: boolean;
}

export function ContactPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['school-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as SchoolSettings;
    },
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: '',
      subject: '',
      message: '',
      priority: 'normal',
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const { error } = await supabase.from('parent_messages').insert({
        parent_name: data.name,
        parent_email: data.email,
        parent_phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        priority: data.priority,
        status: 'open',
        source: 'contact_page',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      toast.success(t('contact.successMessage', 'Message sent successfully! We will get back to you soon.'));
    },
    onError: (error) => {
      toast.error(t('contact.errorMessage', 'Failed to send message. Please try again.'));
      console.error('Contact form error:', error);
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitContactMutation.mutationFn(data);
  };

  const formatAddress = (settings: SchoolSettings) => {
    const parts = [
      settings.school_address,
      settings.school_city,
      settings.school_state,
      settings.school_pincode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t('contact.thankYou', 'Thank You!')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t(
                  'contact.thankYouMessage',
                  'Your message has been submitted successfully. Our team will review your inquiry and get back to you within 2-3 business days.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/')}>
                  {t('contact.goHome', 'Go to Home')}
                </Button>
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  {t('contact.sendAnother', 'Send Another Message')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('contact.title', 'Contact Us')}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t(
                'contact.subtitle',
                'Have questions or want to schedule a visit? We\'d love to hear from you. Reach out to us using the form below or visit our campus.'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gold-500" />
                  {t('contact.schoolInfo', 'School Information')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : settings ? (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{t('contact.address', 'Address')}</p>
                        <p className="text-gray-600 text-sm">{formatAddress(settings)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{t('contact.phone', 'Phone')}</p>
                        <p className="text-gray-600 text-sm">{settings.school_phone}</p>
                        {settings.school_phone_2 && (
                          <p className="text-gray-600 text-sm">{settings.school_phone_2}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{t('contact.email', 'Email')}</p>
                        <a 
                          href={`mailto:${settings.school_email}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {settings.school_email}
                        </a>
                      </div>
                    </div>

                    {settings.school_timings && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{t('contact.schoolHours', 'School Hours')}</p>
                          <p className="text-gray-600 text-sm whitespace-pre-line">
                            {settings.school_timings}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">{t('contact.noInfo', 'Contact information not available')}</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('contact.quickActions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/admissions')}
                >
                  <span className="mr-2">📚</span>
                  {t('contact.viewAdmissions', 'View Admissions')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/notices')}
                >
                  <span className="mr-2">📢</span>
                  {t('contact.viewNotices', 'View Notices')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/gallery')}
                >
                  <span className="mr-2">📷</span>
                  {t('contact.viewGallery', 'View Gallery')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold-500" />
                  {t('contact.sendMessage', 'Send Us a Message')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.yourName', 'Your Name')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...form.register('name')}
                        placeholder={t('contact.namePlaceholder', 'Enter your full name')}
                        error={form.formState.errors.name?.message}
                        disabled={submitContactMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.emailAddress', 'Email Address')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        {...form.register('email')}
                        placeholder={t('contact.emailPlaceholder', 'your.email@example.com')}
                        error={form.formState.errors.email?.message}
                        disabled={submitContactMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.phoneNumber', 'Phone Number')}
                        <span className="text-gray-400 text-xs ml-1">({t('common.optional', 'Optional')})</span>
                      </label>
                      <Input
                        type="tel"
                        {...form.register('phone')}
                        placeholder={t('contact.phonePlaceholder', '+91 98765 43210')}
                        error={form.formState.errors.phone?.message}
                        disabled={submitContactMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('contact.priority', 'Priority')}
                      </label>
                      <select
                        {...form.register('priority')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        disabled={submitContactMutation.isPending}
                      >
                        <option value="normal">{t('contact.normalPriority', 'Normal')}</option>
                        <option value="high">{t('contact.highPriority', 'High Priority')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.subject', 'Subject')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...form.register('subject')}
                      placeholder={t('contact.subjectPlaceholder', 'Brief description of your inquiry')}
                      error={form.formState.errors.subject?.message}
                      disabled={submitContactMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('contact.message', 'Message')} <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      {...form.register('message')}
                      placeholder={t('contact.messagePlaceholder', 'Please describe your inquiry in detail...')}
                      rows={6}
                      error={form.formState.errors.message?.message}
                      disabled={submitContactMutation.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('contact.messageHint', 'Minimum 20 characters')}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="consent"
                      required
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={submitContactMutation.isPending}
                    />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      {t(
                        'contact.consent',
                        'I agree to the collection and processing of my personal information for responding to my inquiry. I have read and agree to the'
                      )}{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        {t('contact.privacyPolicy', 'Privacy Policy')}
                      </a>{' '}
                      {t('common.and', 'and')}{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        {t('contact.termsOfService', 'Terms of Service')}
                      </a>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={submitContactMutation.isPending}
                  >
                    {submitContactMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('contact.sending', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('contact.sendMessage', 'Send Message')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Response Time Notice */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('contact.responseTime', 'Response Time