import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  IndianRupee,
  Info,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WebsiteContent {
  id: string;
  page: string;
  section_key: string;
  title_en: string;
  body_en: string;
  title_hi?: string | null;
  body_hi?: string | null;
  updated_at: string;
}

interface SchoolSettings {
  id: string;
  school_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  office_timings: string;
}

interface AdmissionEnquiry {
  id: string;
  parent_name: string;
  email: string;
  phone: string;
  child_name: string;
  child_dob: string;
  grade_applying: string;
  message?: string | null;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

const enquirySchema = z.object({
  parent_name: z.string().min(2, 'Please enter parent/guardian name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Please enter a valid 10-digit phone number')
    .max(15, 'Please enter a valid phone number')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number can only contain digits, spaces, and +-()'),
  child_name: z.string().min(2, 'Please enter child name'),
  child_dob: z.string().min(1, 'Please select date of birth'),
  grade_applying: z.string().min(1, 'Please select a grade'),
  message: z.string().max(1000, 'Message must be under 1000 characters').optional(),
});

type EnquiryFormValues = z.infer<typeof enquirySchema>;

const GRADES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const DEFAULT_CONTENT: Record<string, { title: string; body: string }> = {
  hero_title: { title: 'Admissions Open', body: 'Join View Point Public School for the upcoming academic session. We are here to guide you through the admission process.' },
  hero_subtitle: { title: '', body: 'Admissions are subject to seat availability. Please contact the school office for exact dates and criteria.' },
  process_title: { title: 'Admission Process', body: 'The admission process includes enquiry, registration, interaction, and final confirmation. Please contact the school office for the current schedule.' },
  requirements_title: { title: 'Requirements', body: 'Please bring the child’s birth certificate, previous report card, and passport-size photographs at the time of enquiry.' },
  documents_title: { title: 'Documents Needed', body: 'Birth certificate, transfer certificate (if applicable), previous academic records, and parent ID proof.' },
  fees_title: { title: 'Fee Structure', body: 'Please contact the school office for the current fee structure. We do not publish fees online without verification.' },
  faq_title: { title: 'Frequently Asked Questions', body: 'Have questions? Reach out to us and we will be happy to help.' },
};

const CONTENT_KEYS = [
  'hero_title',
  'hero_subtitle',
  'process_title',
  'requirements_title',
  'documents_title',
  'fees_title',
  'faq_title',
];

async function fetchAdmissionContent(): Promise<WebsiteContent[]> {
  const { data, error } = await supabase
    .from('website_content')
    .select('*')
    .eq('page', 'admissions')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WebsiteContent[];
}

async function fetchSchoolSettings(): Promise<SchoolSettings | null> {
  const { data, error } = await supabase
    .from('school_settings')
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as SchoolSettings) ?? null;
}

async function submitAdmissionEnquiry(values: EnquiryFormValues): Promise<void> {
  const normalizedPhone = values.phone.trim();
  const normalizedEmail = values.email.trim().toLowerCase();

  // Duplicate check: recent enquiry with same phone or email
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const { data: existing, error: duplicateCheckError } = await supabase
    .from('admission_enquiries')
    .select('id, parent_name, child_name, created_at')
    .or(`phone.eq.${normalizedPhone},email.eq.${normalizedEmail}`)
    .gte('created_at', sinceIso)
    .limit(1);

  if (duplicateCheckError) {
    throw new Error('Unable to verify duplicate enquiries. Please try again.');
  }

  if (existing && existing.length > 0) {
    throw new Error('An enquiry with this phone number or email was already submitted recently. Please contact the school office if this is a mistake.');
  }

  const { error: insertError } = await supabase.from('admission_enquiries').insert({
    parent_name: values.parent_name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    child_name: values.child_name.trim(),
    child_dob: values.child_dob,
    grade_applying: values.grade_applying,
    message: values.message?.trim() || null,
    status: 'new',
  });

  if (insertError) {
    throw new Error('We could not submit your enquiry. Please try again later.');
  }
}

function ContentSection({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
}) {
  if (!title && !body) return null;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {icon ? <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">{icon}</div> : null}
      {title ? <h2 className="text-xl font-bold text-navy-900">{title}</h2> : null}
      {body ? <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p> : null}
    </div>
  );
}

export default function AdmissionsPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      parent_name: '',
      email: '',
      phone: '',
      child_name: '',
      child_dob: '',
      grade_applying: '',
      message: '',
    },
  });

  const contentQuery = useQuery({
    queryKey: ['website-content', 'admissions'],
    queryFn: fetchAdmissionContent,
    staleTime: 5 * 60 * 1000,
  });

  const settingsQuery = useQuery({
    queryKey: ['school-settings'],
    queryFn: fetchSchoolSettings,
    staleTime: 5 * 60 * 1000,
  });

  const contentByKey = useMemo(() => {
    const map: Record<string, WebsiteContent> = {};
    if (contentQuery.data) {
      for (const item of contentQuery.data) {
        if (!map[item.section_key]) {
          map[item.section_key] = item;
        }
      }
    }
    return map;
  }, [contentQuery.data]);

  const getContent = (key: string) => {
    const item = contentByKey[key];
    if (!item) {
      return DEFAULT_CONTENT[key] ?? { title: '', body: '' };
    }
    if (lang === 'hi' && (item.title_hi || item.body_hi)) {
      return {
        title: item.title_hi || item.title_en,
        body: item.body_hi || item.body_en,
      };
    }
    return { title: item.title_en, body: item.body_en };
  };

  const hero = getContent('hero_title');
  const heroSubtitle = getContent('hero_subtitle');
  const process = getContent('process_title');
  const requirements = getContent('requirements_title');
  const documents = getContent('documents_title');
  const