import { supabase } from '@/src/lib/supabase';
import type {
  MeasurementEntry,
  ProgressPhoto,
  StepEntry,
  WaterEntry,
  WeightEntry,
} from '@/src/types/domain';

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  return data.user.id;
}

// --- Eau -------------------------------------------------------------------

export async function listWater(date: string): Promise<WaterEntry[]> {
  const { data, error } = await supabase
    .from('water_entries')
    .select('*')
    .eq('entry_date', date)
    .order('logged_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addWater(date: string, amountMl: number): Promise<void> {
  const { error } = await supabase
    .from('water_entries')
    .insert({ user_id: await userId(), entry_date: date, amount_ml: amountMl });
  if (error) throw error;
}

/** Annule la dernière saisie d'eau de la journée. */
export async function undoLastWater(date: string): Promise<void> {
  const entries = await listWater(date);
  const last = entries[entries.length - 1];
  if (!last) return;
  const { error } = await supabase.from('water_entries').delete().eq('id', last.id);
  if (error) throw error;
}

// --- Pas -------------------------------------------------------------------

export async function getSteps(date: string): Promise<StepEntry | null> {
  const { data, error } = await supabase
    .from('step_entries')
    .select('*')
    .eq('entry_date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setSteps(date: string, steps: number): Promise<void> {
  const { error } = await supabase
    .from('step_entries')
    .upsert(
      { user_id: await userId(), entry_date: date, steps, source: 'manuel' },
      { onConflict: 'user_id,entry_date' },
    );
  if (error) throw error;
}

// --- Poids -----------------------------------------------------------------

export async function listWeights(limit = 365): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function upsertWeight(date: string, weightKg: number, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('weight_entries')
    .upsert(
      { user_id: await userId(), entry_date: date, weight_kg: weightKg, notes: notes ?? null },
      { onConflict: 'user_id,entry_date' },
    );
  if (error) throw error;
}

// --- Mensurations ----------------------------------------------------------

export async function listMeasurements(limit = 100): Promise<MeasurementEntry[]> {
  const { data, error } = await supabase
    .from('measurement_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function upsertMeasurement(
  entry: Partial<MeasurementEntry> & { entry_date: string },
): Promise<void> {
  const { error } = await supabase
    .from('measurement_entries')
    .upsert({ ...entry, user_id: await userId() }, { onConflict: 'user_id,entry_date' });
  if (error) throw error;
}

// --- Photos de progression (bucket privé + URLs signées) --------------------

const PHOTO_BUCKET = 'progress-photos';

export async function listPhotos(): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .order('taken_on', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** URL signée temporaire (1 h) — les photos ne sont jamais publiques. */
export async function getPhotoUrl(imagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(imagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadPhoto(
  localUri: string,
  meta: Pick<ProgressPhoto, 'taken_on' | 'photo_type'> & Partial<Pick<ProgressPhoto, 'weight_kg' | 'notes'>>,
): Promise<void> {
  const uid = await userId();
  const path = `${uid}/${Date.now()}-${meta.photo_type}.jpg`;

  const response = await fetch(localUri);
  const blob = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg' });
  if (uploadError) throw uploadError;

  const { error } = await supabase
    .from('progress_photos')
    .insert({ ...meta, user_id: uid, image_path: path });
  if (error) throw error;
}
