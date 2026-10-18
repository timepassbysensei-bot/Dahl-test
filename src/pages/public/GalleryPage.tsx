import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Images,
  Loader2,
  X,
  ZoomIn,
} from 'lucide-react';

interface GalleryPhoto {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

interface GalleryAlbum {
  id: string