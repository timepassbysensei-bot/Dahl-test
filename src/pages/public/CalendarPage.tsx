import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  RefreshCw,
  School,
  Sun,
  AlertTriangle,
  CalendarOff,
  Clock,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type CalendarEventType = 'holiday' | 'exam' | 'event';

type CalendarEvent = {
  id: string;
  title_en: string | null;
  title_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  event_date: string;
  event_type: CalendarEventType;
  is_published: boolean;
};

type EventTypeMeta = {
  label: string;
  icon: typeof Sun;
  dotClass: string;
  badgeClass: string;
};

const EVENT_TYPE_META: Record<CalendarEventType, EventTypeMeta> = {
  holiday: {
    label: 'Holiday',
    icon: Sun,
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  exam: {
    label: 'Exam',
    icon: GraduationCap,
    dotClass: 'bg-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  event: {
    label: 'Event',
    icon: CalendarDays,
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(year, month, 1 - startOffset);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
  return { start: format(start), end: format(end) };
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get('lang') === 'hi' ? 'hi' : 'en';

  const { start, end } = useMemo(
    () => getMonthRange(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['public-calendar-events', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title_en, title_hi, description_en, description_hi, event_date, event_type, is_published')
        .eq('is_published', true)
        .gte('event_date', start)
        .lte('event_date', end)
        .order('event_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as CalendarEvent[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    if (!events) return map;
    for (const event of events) {
      const key = event.event_date;
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
        selectedDate.getDate(),
      ).padStart(2, '0')}`
    : '';

  const selectedEvents = selectedDateKey ? eventsByDate.get(selectedDateKey) ?? [] : [];

  const monthEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events]);

  const weeks = useMemo(
    () => getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    const params = new URLSearchParams(searchParams);
    params.set('lang', next);
    setSearchParams(params, { replace: true });
  };

  const getTitle = (event: CalendarEvent) => (lang === 'hi' && event.title_hi ? event.title_hi : event.title_en ?? '');
  const getDescription = (event: CalendarEvent) =>
    lang === 'hi' && event.description_hi ? event.description_hi : event.description_en ?? '';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <section className="bg-[#12335B] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                School Calendar
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {lang === 'hi' ? 'स्कूल कैलेंडर' : 'School Calendar'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
                {lang === 'hi'
                  ? 'छुट्टियाँ, परीक्षाएँ और कार्यक्रम देखें।'
                  : 'View important holidays, exams, and school events.'}
              </p>
            </div>
            <button
              onClick={toggleLanguage}
              className="inline-flex w-fit items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>
        </div>
      </section>

      {/* Calendar content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg