import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Globe,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Loader2,
  Shield,
  Users,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const studentSchema = z.object({
  id: z.string().optional(),
  admission_number: z.string().min(1, 'Admission number is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  class_id: z.string().min(1, 'Class is required'),
  section_id: z.string().min(1, 'Section is required'),
  roll_number: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  photo_consent: z.boolean().default(false),
  public_display_consent: z.boolean().default(false),
  emergency_contact: z.string().optional(),
  blood_group: z.string().optional(),
  aadhar_number: z.string().optional(),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  class_id: string;
  section_id: string;
  roll_number: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  photo_consent: boolean;
  public_display_consent: boolean;
  emergency_contact: string | null;
  blood_group: string | null;
  aadhar_number: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  class?: { id: string; name: string; numeric_value: number };
  section?: { id: string; name: string };
  photo_url?: string;
}

interface Class {
  id: string;
  name: string;
  numeric_value: number;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
}

interface TeacherAssignment {
  class_id: string;
  section_id: string;
}

export function StudentManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const isPrincipal = profile?.role === 'principal';
  const isTeacher = profile?.role === 'teacher';

  // Fetch teacher's assigned classes/sections if teacher
  const { data: teacherAssignments } = useQuery({
    queryKey: ['teacher-assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select('class_id, section_id')
        .eq('teacher_id', profile.id)
        .eq('is_active', true);
      if (error) throw error;
      return data as TeacherAssignment[];
    },
    enabled: isTeacher && !!profile?.id,
  });

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, numeric_value')
        .order('numeric_value', { ascending: true });
      if (error) throw error;
      return data as Class[];
    },
  });

  // Fetch sections
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('id, name, class_id')
        .order('name');
      if (error) throw error;
      return data as Section[];
    },
  });

  // Filter sections by selected class
  const filteredSections = useMemo(() => {
    if (!filterClass) return sections;
    return sections.filter(s => s.class_id === filterClass);
  }, [sections, filterClass]);

  // Fetch students
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students', filterClass, filterSection, showArchived, teacherAssignments],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, numeric_value),
          section:sections(id, name)
        `)
        .order('created_at', { ascending: false });

      // Teacher can only see students from their assigned classes/sections
      if (isTeacher && teacherAssignments && teacherAssignments.length > 0) {
        const classIds = teacherAssignments.map(a => a.class_id);
        const sectionIds = teacherAssignments.map(a => a.section_id);
        query = query.in('class_id', classIds).in('section_id', sectionIds);
      }

      if (!showArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Student[];
    },
  });

  // Fetch student photos from storage
  const { data: studentPhotos } = useQuery({
    queryKey: ['student-photos', students.map(s => s.id)],
    queryFn: async () => {
      const photos: Record<string, string> = {};
      for (const student of students) {
        const { data } = await supabase.storage
          .from('student-photos')
          .download(`${student.id}.jpg`);
        if (data) {
          photos[student.id] = URL.createObjectURL(data);
        }
      }
      return photos;
    },
    enabled: students.length > 0,
  });

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(student => 
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.admission_number.toLowerCase().includes(query) ||
      student.roll_number?.toLowerCase().includes(query) ||
      student.father_name?.toLowerCase().includes(query) ||
      student.mother_name?.toLowerCase().includes(query) ||
      student.phone?.includes(query)
    );
  }, [students, searchQuery]);

  // Apply class/section filters
  const displayStudents = useMemo(() => {
    return filteredStudents.filter(student => {
      if (filterClass && student.class_id !== filterClass) return false;
      if (filterSection && student.section_id !== filterSection) return false;
      return true;
    });
  }, [filteredStudents, filterClass, filterSection]);

  // Create/Update student mutation
  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const studentData = {
        admission_number: data.admission_number,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        class_id: data.class_id,
        section_id: data.section_id,
        roll_number: data.roll_number || null,
        father_name: data.father_name || null,
        mother_name: data.mother_name || null,
        guardian_name: data.guardian_name || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        photo_consent: data.photo_consent,
        public_display_consent: data.public_display_consent,
        emergency_contact: data.emergency_contact || null,
        blood_group: data.blood_group || null,
        aadhar_number: data.aadhar_number || null,
        notes: data.notes || null,
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({ ...studentData, updated_at: new Date().toISOString() })
          .eq('id', editingStudent.id);
        if (error) throw error;
        return editingStudent.id;
      } else {
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert(studentData)
          .select()
          .single();
        if (error) throw error;
        return newStudent.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      setEditingStudent(null);
      reset();
      toast({
        title: editingStudent ? 'Student updated' : 'Student added',
        description: `Student record has been ${editingStudent ? 'updated' : 'created'} successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save student record.',
        variant: 'error',
      });
    },
  });

  // Archive student mutation
  const archiveMutation = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('students')
        .update({ is_archived: archived, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDeleteConfirm(null);
      toast({
        title: archived ? 'Student archived' : 'Student restored',
        description: `Student record has been ${archived ? 'archived' : 'restored'} successfully.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student record.',
        variant: 'error',
      });
    },
  });

  // Bulk archive mutation
  const bulkArchiveMutation = useMutation({
    mutationFn: async ({ ids, archived }: { ids: string[]; archived: boolean }) => {
      const { error } = await supabase
        .from('students')
        .update({ is_archived: archived, updated_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedStudents([]);
      toast({
        title: `Students ${archived ? 'archived' : 'restored'}`,
        description: `${selectedStudents.length} student(s) have been ${archived ? 'archived' : 'restored'}.`,
        variant: 'success',
      });
    },
  });

  // Photo upload mutation
  const uploadPhoto = async (studentId: string, file: File) => {
    setUploadingPhoto(studentId);
    try {
      const { error } = await supabase.storage
        .from('student-photos')
        .upload(`${studentId}.jpg`, file, { upsert: true });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['student-photos'] });
      toast({
        title: 'Photo uploaded',
        description: 'Student photo has been updated.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo.',
        variant: 'error',
      });
    } finally {
      setUploadingPhoto(null);
    }
  };

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      photo_consent: false,
      public_display_consent: false,
    },
  });

  const watchedClass = watch('class_id');

  // Reset section when class changes
  useMemo(() => {
    if (watchedClass !== filterClass) {
      setValue('section_id', '');
    }
  }, [watchedClass, setValue, filterClass]);

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      reset({
        id: student.id,
        admission_number: student.admission_number,
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        class_id: student.class_id,
        section_id: student.section_id,
        roll_number: student.roll_number || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        guardian_name: student.guardian_name || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        photo_consent: student.photo_consent,
        public_display_consent: student.public_display_consent,
        emergency_contact: student.emergency_contact || '',
        blood_group: student.blood_group || '',
        aadhar_number: student.aadhar_number || '',
        notes: student.notes || '',
      });
    } else {
      setEditingStudent(null);
      reset({
        admission_number: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'male',
        class_id: '',
        section_id: '',
        roll_number: '',
        father_name: '',
        mother_name: '',
        guardian_name: '',
        phone: '',
        email: '',
        address: '',
        photo_consent: false,
        public_display_consent: false,
        emergency_contact: '',
        blood_group: '',
        aadhar_number: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === displayStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(displayStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getClassSections = (classId: string) => {
    return sections.filter(s => s.class_id === classId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy-900 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Student Manager</h1>
                <p className="text-sm text-slate-500">
                  {isPrincipal ? 'Manage all student records' : 'View assigned students'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isPrincipal && selectedStudents.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                  <span className="text-sm text-slate-600">{selectedStudents.length} selected</span>
                  <button
